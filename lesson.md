# Lesson 2.12: Introduction to Next.js

## Overview

- **Duration:** ~2 hours 21 minutes (hands-on lab, Parts 1-5; Part 5 is an instructor demo, not code-along); the Activity, "Mutating Data with a Server Action," and "Route Handlers" are all optional or self-study and do not count against lab time
- **Prerequisites:** Lesson 2.11 - Form Handling, Validation, and Deployment

> **Instructor timing note:** Parts 1 through 5 sum to roughly 2 hours 21 minutes, leaving room for 30-40 minutes of lecture and a proper Q&A inside a 3-hour session. Part 5 (Middleware and login) is an **instructor demo**, built live and screen-shared rather than a code-along, learners copy the same steps into their own project afterward, at their own pace. The Activity (Fetch and Display Interactions) is **optional/take-home**, nothing later in the lesson depends on it. Part 1 and Part 2's minute counts assume a faster, more narrated instructor pace than a full code-along, the content itself is unchanged, Part 1's Lighthouse/hydration demo and Part 2's Sidebar build both need to move briskly rather than lingering on every step. If a session still runs behind, "Mutating Data with a Server Action" (self-study, 20 minutes) remains the release valve, it teaches no new concept beyond what Part 5's login already covers.

## Learning Objectives

By the end of this lesson, you will be able to:

1. **Explain** the difference between a React SPA rendered in the browser and a Next.js application that renders on the server
2. **Build** a multi-page Next.js application using the App Router's file-based routing conventions, including dynamic segments, shared layouts (`layout.js`), and route-level loading and error states (`loading.js`, `error.js`)
3. **Distinguish** between Server Components and Client Components and apply the correct pattern for data fetching and interactivity
4. **Describe** how Middleware can gate access to a route before a page ever renders
5. **Use** a Server Action to submit a form and mutate data without writing a client-side `fetch` call

## Introduction

Every lesson so far has used Vite to build a single-page application: the browser downloads an empty `index.html`, loads a JavaScript bundle, and React renders the page in the browser. This works well, but it has trade-offs: search engines see an empty page until the JavaScript runs, and users on slow connections wait for the bundle to download before anything appears.

Next.js solves this by adding a server layer. Pages are rendered on the server before they reach the browser, so users see real HTML immediately and search engines can index the content. In this lesson you will create a new Next.js project and progressively rebuild the CRM inside it, mapping each familiar concept, including its visual design, from the Vite CRM to its Next.js equivalent.

By the end of the lab, you will have a working Next.js CRM with a customer list page, a customer detail page, an Add Customer form, live data from a local json-server API, a route-level error boundary, an interactive client-side search box, and a simulated login that gates the customer pages.

> **A note on authentication:** The login you build today is a simulation. It checks a hardcoded email and password and does not talk to a real backend. A production login would instead call a real authentication endpoint, issuing a JWT (JSON Web Token) when a user signs in, and the Server Action here would call that endpoint instead of checking a hardcoded value. What would *not* change is the shape of the solution: a login action that sets a cookie, and Middleware that checks it before a protected page is allowed to render. Even though today's credential check is fake, the mechanism around it, a Server Action setting an httpOnly cookie and Middleware reading that cookie on the server, is already the real, production-shaped pattern. That is the part worth learning properly now, since only the source of truth for the credential check would change, not the architecture.

> **What is not carrying over from the Vite CRM:** The Vite CRM used `AuthContext` to hold the logged-in user in the browser and `CustomerContext` to hold the customer list, loading state, and error state in the browser. Neither is needed here. Auth state becomes a cookie checked by Middleware on the server, and the customer list becomes server state fetched inside a Server Component and passed down as props. There is no client-side store for either concern. `ProtectedRoute`, the component that used to check `AuthContext` and redirect, is also gone, its job is now done by Middleware before any page component runs. Role-based checks (`hasRole`, admin-only actions) are not covered in this lesson; they are called out as a bonus challenge for learners who want to explore how they would fit once real JWTs carry a role claim.

---

## Part 1: Bootstrap the Next.js Project (30 minutes)

### Scaffolding with create-next-app

`create-next-app` is the official CLI for creating a new Next.js project. It generates the App Router file structure and installs dependencies.

Open a terminal, navigate to the folder where you keep your projects, and run:

```bash
npx create-next-app@15 crm-next
```

> This lesson targets Next.js 15. Next.js 16 has since been released and changes several defaults (Turbopack on by default, `params` and `searchParams` always asynchronous, `middleware.js` renamed to `proxy.js`, among others). Pinning to `@15` keeps the steps below accurate; do not use `@latest`.

You will be prompted with a series of questions. Answer them exactly as shown:

```
Would you like to use TypeScript?              No
Would you like to use ESLint?                  Yes
Would you like to use Tailwind CSS?            No
Would you like your code inside a `src/` directory?  No
Would you like to use App Router?              Yes
Would you like to use Turbopack for next dev?  Yes
Would you like to customize the import alias?  No
```

> We are opting out of TypeScript for now. Next.js uses TypeScript by default, which is why you will see `.tsx` and `.ts` file extensions in the generated project even though we selected No. Lesson 2.13 will give you a short introduction to TypeScript; for today we are keeping the focus on Next.js itself rather than juggling two new topics at once.

> We are also opting out of Tailwind CSS. The Vite CRM you have been building since Lesson 2.2 styles itself with plain CSS and CSS Modules, not Tailwind. Today you will carry that same styling approach into Next.js, so the CRM you build here looks and feels like the one you already know, and so you are not learning a new styling system on top of everything else.

Once the scaffold completes, open the project in your editor:

```bash
cd crm-next
code .
```

### Touring the Generated Files

Before writing any code, spend a few minutes reading through what was generated. The most important files are:

| File | What it does |
|------|-------------|
| `app/layout.js` | Root layout - wraps every page in the app |
| `app/page.js` | The home route `/` |
| `app/globals.css` | Global styles imported by the root layout |
| `next.config.mjs` | Next.js configuration |

Notice that there is no `main.jsx`, no `ReactDOM.createRoot`, and no `<Router>` component. Next.js handles all of that internally.

Open `app/layout.js`. Near the top you will see a `metadata` export the scaffold generated automatically:

```jsx
export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
```

Replace it with a fallback that actually describes this app:

```jsx
export const metadata = {
  title: "Simple CRM",
  description: "Track customers, log interactions, and never lose a lead again.",
};
```

Any page that does not define its own `metadata` will use this one; a page that does define its own, like the homepage you will build shortly, overrides it.

### Carry Over the Design Tokens

The Vite CRM defines its colours, spacing, and typography as CSS custom properties in `src/index.css`, and every component styles itself with a `.module.css` file that references those properties. You will use the same system here.

Download [`assets/globals.css`](assets/globals.css) from the lesson materials and use it to replace the entire contents of `app/globals.css`.

> This is the exact same token set from the Vite CRM's `src/index.css`. Recognising it is the point: the styling layer has not changed, only the framework around it has.

### Set Up json-server

This lesson uses the same json-server setup from Lesson 2.5 onward, a local REST API that reads from a plain JSON file, rather than the hosted MockAPI.io project from Lesson 2.11. Running data locally keeps the focus on Next.js itself instead of an account signup step, and it is the same local API you have already used all course long.

> **What about MockAPI.io from Lesson 2.11?** MockAPI.io only became necessary in Lesson 2.11 because the Vite CRM needed to be deployed to Netlify, and a deployed app cannot reach `localhost`. Today's lesson does not deploy the Next.js CRM, so there is no reason to introduce a hosted API. Everything you learn about `fetch` in a Server Component works identically against either one, only the base URL changes.

Install json-server as a dev dependency:

```bash
npm install --save-dev json-server
```

Create a `data/` folder in the root of `crm-next/` (next to `package.json`), then download [`assets/data/db.json`](assets/data/db.json) from the lesson materials and place it there:

```
crm-next/
├── app/
├── data/
│   └── db.json       ← add this
├── package.json
```

This is the same `customers` and `interactions` data shape you used in Lesson 2.11, before the switch to MockAPI.io.

Add a `server` script to `package.json`, alongside the existing `dev` script:

```json
"scripts": {
  "dev": "next dev",
  "server": "json-server --watch data/db.json --port 3001",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

Start json-server in its own terminal window:

```bash
npm run server
```

> **Two terminals:** json-server and the Next.js dev server must both be running at the same time. Keep both terminal windows open throughout the lesson: one running `npm run server` on port 3001, the other running `npm run dev` on port 3000.

Confirm it is working by opening `http://localhost:3001/customers` in your browser. You should see the JSON array from your `db.json` file.

### Start the Dev Server

In a second terminal, start the Next.js development server:

```bash
npm run dev
```

Open `http://localhost:3000`. You will see the default Next.js welcome page.

### Build the Marketing Homepage

The home page at `/` is the one page in this CRM a stranger, or a search engine, will see before signing in. It is the right page to demonstrate two of Next.js's biggest advantages over a Vite SPA: real content on the first response (good for SEO and load speed) and page-specific `metadata`.

Copy the hero image supplied with this lesson into `public/`:

```
crm-next/
  public/
    team-office.jpg   <-- copy from the lesson's assets/images/ folder
```

> Image credit: "Four people watching on white MacBook on top of glass-top table", [Unsplash License](https://unsplash.com/photos/four-people-watching-on-white-macbook-on-top-of-glass-top-table-vdXMSiX-n6M) (free to use, no attribution required).

Create `app/page.module.css`:

```css
/* app/page.module.css */
.page {
  min-height: 100vh;
  background: var(--surface-page);
  padding: var(--space-8);
}

.hero {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.eyebrow {
  color: var(--action-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.headline {
  margin-top: var(--space-2);
  font-size: 2.25rem;
  color: var(--text-strong);
}

.image {
  margin-top: var(--space-6);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.image img {
  width: 100%;
  height: auto;
  display: block;
}

.subhead {
  margin-top: var(--space-6);
  color: var(--text-muted);
  font-size: var(--text-md);
}

.features {
  margin-top: var(--space-6);
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.cta {
  margin-top: var(--space-8);
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  background: var(--action-primary);
  color: var(--text-on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-weight: var(--weight-medium);
  text-decoration: none;
  cursor: pointer;
  box-sizing: border-box;
  transition: background var(--duration-fast) var(--ease-standard);
}

.cta:hover {
  background: var(--action-primary-hover);
}
```

Replace the contents of `app/page.js`. Start with a plain HTML `<img>` tag, the same way you would in any React app, you will swap it for `next/image` in a moment:

```jsx
// app/page.js
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Simple CRM — Know Every Customer, Close Every Deal',
  description:
    'Simple CRM helps small teams track customers, log interactions, and never lose a lead again. Free to start, no credit card required.',
};

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Simple CRM</p>
        <h1 className={styles.headline}>
          Know every customer. Close every deal.
        </h1>
        <div className={styles.image}>
          <img
            src="/team-office.jpg"
            alt="A small team reviewing customer data together on a laptop"
          />
        </div>
        <p className={styles.subhead}>
          Simple CRM helps small teams track customers, log interactions, and
          never lose a lead again. No spreadsheets, no sticky notes.
        </p>
        <ul className={styles.features}>
          <li>See every customer and their history in one place</li>
          <li>Log calls, emails, and meetings as they happen</li>
          <li>Built for teams who are done using spreadsheets</li>
        </ul>
        <Link href="/login" className={styles.cta}>
          Sign in to get started
        </Link>
      </div>
    </main>
  );
}
```

**Browser check:** Visit `http://localhost:3000`. You see the headline, hero image, and sales copy stacked below it.

### Diagnose the Plain `<img>` Tag

**Payload:** open the **Network** tab and reload. The request for `team-office.jpg` transfers the full 2400×1800, ~500KB source file, regardless of how small it renders on screen.

**Layout shift:** open the **Network** tab, set throttling to "Slow 3G", and reload. Watch the copy and feature list below the image. Because the image has no reserved height, that content renders too high at first, then jumps down the instant the image finishes loading. This is a **layout shift**, one of the things `next/image` fixes automatically.

### Compare Against the Vite CRM

`simple-crm-web-spa`, supplied with this lesson, has a matching homepage (same headline, copy, and image) already built, so the comparison is fair, no editing required.

```bash
cd simple-crm-web-spa
npm install
npm run dev
```

1. Open the Vite CRM (`http://localhost:5173`) in one tab, the Next.js CRM (`http://localhost:3000`) in another.
2. In each tab: DevTools → Cmd+Shift+P (Ctrl+Shift+P) → "Disable JavaScript" → reload both. The Vite tab goes blank; the Next.js tab still shows the full page.
3. Re-enable JavaScript. **View Page Source** (not Inspect) on each. Vite's raw HTML is `<div id="root"></div>` and a `<script>` tag. Next.js's raw HTML already contains the full headline, copy, and image markup.
4. Open DevTools → **Lighthouse**, run a report on each (Performance category). Compare **LCP**: Next.js should already be well ahead, that gap is the SSR effect alone, both pages are still using the same unoptimized `<img>`.

> Keep both tabs open; you will come back to Lighthouse once more after the next fix, on the Next.js tab only.

### Fix It: Swap in `next/image`

```jsx
// app/page.js — swap the import and the image element
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

// ...metadata and the rest of HomePage unchanged...

      <div className={styles.image}>
        <Image
          src="/team-office.jpg"
          alt="A small team reviewing customer data together on a laptop"
          width={800}
          height={600}
          priority
        />
      </div>
```

**Browser check, payload:** reload with the Network tab open. The image request is now much smaller than 500KB, resized to the `width`/`height` you declared.

**Browser check, layout shift:** throttle to "Slow 3G" and reload. The image's space is reserved immediately; nothing jumps this time.

> **Common mistake:** forgetting `width` and `height` on `Image`. Next.js requires them (or `fill` with a sized parent) so it can reserve layout space up front. Omitting them is a build error, not a silent failure.

Run Lighthouse again on the Next.js tab. **LCP** should drop further, now that the image is no longer the slowest thing on the page. **CLS** should read 0, same as before the fix, but now for a structural reason (`width`/`height` reserve the space) rather than a timing coincidence. Ask your instructor if you want the details on why CLS already read 0 before the fix too.

**`next/image` also lazy-loads by default:** an image below the fold is not requested until it is about to scroll into view. `priority` opts an image *out* of that, telling Next.js this is the LCP candidate and should load immediately, which is why the hero image above uses it.

### Per-Page `metadata`

Open `simple-crm-web-spa/index.html`. This is the entire `<head>` that project sends, unchanged, for every route:

```html
<!-- simple-crm-web-spa/index.html -->
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>simple-crm-web</title>
</head>
```

No description, and no way to vary it per route without JavaScript rewriting `document.title` after the page loads, which crawlers do not reliably wait for.

Compare the `metadata` export you already wrote in `app/page.js`:

```jsx
export const metadata = {
  title: 'Simple CRM — Know Every Customer, Close Every Deal',
  description:
    'Simple CRM helps small teams track customers, log interactions, and never lose a lead again. Free to start, no credit card required.',
};
```

Next.js merges a page's `metadata` with its layout's, field by field, so this `title` and `description` override the placeholder ones from `app/layout.js` for this route only, generated server-side, per request. Once `/login` and `/crm/customers` exist later in this lesson, each can carry its own `metadata`, independent of this one and of each other.

> `metadata` also accepts an `openGraph` field for how a link looks when shared on Slack or LinkedIn. Not a Google ranking factor, so it is not covered today; see the [Next.js Metadata docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) if you want it for your own project.

### What Specifically Helps SEO Here

- **Content exists without JavaScript.** Many crawlers and link-preview bots do not execute JS reliably. SSR means your headline and copy are in the first response regardless.
- **`title` and `description`** are what Google reads for ranking relevance and displays in search results. Per-route `metadata` means each page describes itself accurately.
- **Core Web Vitals** (LCP, CLS, and INP) are a direct Google ranking factor. SSR improves LCP; `next/image`'s required `width`/`height` improves CLS.

### Add Interactivity Without Losing the Score

Everything on the homepage so far is static: every word was decided on the server and never changes. A fair question is whether adding real interactivity, a Client Component with state and event handlers, undoes any of what you just measured. Find out by adding one.

Create a `components` folder inside `app/`. Download [`assets/SpecialOffer.module.css`](assets/SpecialOffer.module.css) from the lesson materials and place it at `app/components/SpecialOffer.module.css`.

Create `app/components/SpecialOffer.js`, a licence-quantity stepper that recalculates a bulk discount as the count changes:

```jsx
// app/components/SpecialOffer.js
'use client';

import { useState } from 'react';
import styles from './SpecialOffer.module.css';

function discountFor(licences) {
  if (licences >= 20) return 0.25;
  if (licences >= 10) return 0.15;
  if (licences >= 5) return 0.1;
  return 0;
}

export default function SpecialOffer() {
  const [licences, setLicences] = useState(1);
  const discount = discountFor(licences);

  return (
    <section className={styles.card}>
      <div className={styles.copy}>
        <h2>Special offer: buy licences in bulk</h2>
        <p>Discounts apply automatically as your team grows.</p>
      </div>
      <div className={styles.stepper}>
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => setLicences(n => Math.max(1, n - 1))}
          aria-label="Decrease licences"
        >
          −
        </button>
        <span className={styles.count}>{licences}</span>
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => setLicences(n => n + 1)}
          aria-label="Increase licences"
        >
          +
        </button>
        <span className={styles.discount}>
          {discount === 0 ? 'No discount yet' : `${discount * 100}% off`}
        </span>
      </div>
    </section>
  );
}
```

Import it into `app/page.js` and render it below the hero, as a sibling of the `.hero` div rather than inside it:

```jsx
// app/page.js — add this import and render it just after the closing </div> of .hero
import SpecialOffer from './components/SpecialOffer';
// ...
      </div>
      <SpecialOffer />
    </main>
```

`'use client'` is required because `useState` and `onClick` only run in the browser. `HomePage` itself stays a Server Component; `SpecialOffer` is one interactive island inside an otherwise static page, the same Server-renders/Client-interacts split you will build again with `CustomerSearch` in Part 4.

**Browser check:** Visit `http://localhost:3000`. Click `+` until it reaches 5, 10, then 20 licences and watch the discount update.

### Watch Hydration Happen, Then Confirm the Score Holds

`SpecialOffer`'s buttons are part of the server-rendered HTML, so they appear on screen immediately, but they are not interactive the instant they appear. React still has to run in the browser and attach the `onClick` handlers to markup the server already sent, a step called **hydration**.

1. Throttle to "Slow 3G" and reload.
2. The instant the `SpecialOffer` card appears, click `+`. Notice it does nothing for a moment, the button is visible and styled, but not yet wired up. Once hydration finishes, the same click works.
3. Run Lighthouse again. Compare **Total Blocking Time** and check for an **INP** figure, alongside the same LCP and CLS you already recorded. Interactivity has a real cost, TBT should tick up slightly compared to your `next/image` run, but LCP and CLS should be essentially unchanged, the hero content and layout stability never depended on `SpecialOffer` at all.

> This is the same story as the earlier `<img>` vs `next/image` comparison, from a different angle: SSR gets content painted early, but a Client Component's event handlers are not live until JavaScript hydrates. The two do not conflict, one interactive widget does not undo the SEO and performance work already on the page, which is the case for Next.js as a good fit for apps that need to be fast, indexable, *and* interactive, not forced to choose only one.

---

## Part 2: Routes and Layout (40 minutes)

### How the App Router Creates Pages

In the Vite CRM, routes were defined in a `<Routes>` component, with the entire logged-in area nested under an `/app` prefix:

```jsx
// Vite CRM — you had to declare every route explicitly
<Routes>
  <Route path="/" element={<WelcomePage />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/app" element={<RootLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="customers" element={<CustomersPage />} />
      <Route path="customers/:id" element={<CustomerDetailPage />} />
    </Route>
  </Route>
</Routes>
```

In Next.js, the App Router uses folders to create URL segments instead. Since there is already a default `app` folder, you will use a `crm` folder for the equivalent grouping instead, for better clarity:

- `app/crm/page.js` becomes the post-login Dashboard, the equivalent of the SPA's `/app` index route
- `app/crm/customers/page.js` becomes `/crm/customers`

In the App Router, routes come from the folder structure: `page.js` is a **special filename** Next.js looks for. A folder becomes a URL segment, and a `page.js` file directly inside that folder is what actually makes it render as a page, rather than just being a folder for organisation. This is the same `app/page.js` you have been editing since Part 1, its filename is why it renders at `/`, not because Next.js knows that file by name specifically.

Create a `crm` folder inside `app/`, then a `customers` folder inside that. Create a file at `app/crm/customers/page.js` and the `/crm/customers` route exists automatically. No configuration required.

Create `app/crm/customers/page.js`:

```jsx
// app/crm/customers/page.js
export default function CustomersPage() {
  return (
    <main>
      <h1>Customers</h1>
    </main>
  );
}
```

**Browser check:** Visit `http://localhost:3000/crm/customers`. The page renders. You did not register a route anywhere.

> The **filename** `page.js` is fixed, Next.js will not recognise a route-defining file under any other name. The **component name** inside it is not: Next.js's own default, if you leave `create-next-app`'s generated file untouched, is literally `Page`, same generic name in every project. This lesson uses more descriptive names instead, `CustomersPage` here, `HomePage` back in `app/page.js`, purely for your own readability. Next.js does not read or care about the function name at all, only the `export default` matters, whatever function is exported is what renders.

### Adding a Shared Layout

In the Vite CRM, `RootLayout` rendered navigation only around the logged-in area, nested inside the `/app` `<Route>` so it never appeared on the public homepage or the login page. In Next.js, shared UI belongs in `layout.js`, and layouts nest the same way routes do: a `layout.js` file wraps every page in its own folder and every folder beneath it, without affecting anything outside that folder. `app/layout.js` (the root layout you already edited to add `globals.css`) wraps the entire application, so that is not the right place for a CRM-only sidebar. Instead, create a second, nested layout scoped to `app/crm/`.

> **Why not just skip `RootLayout` for `/` and `/login`, the way the Vite CRM did?** In React Router, `WelcomePage` and `LoginPage` were siblings of the `<Route element={<RootLayout />}>` block, not inside it, so they never passed through its `<Outlet />` at all. The App Router has no sibling equivalent: `app/layout.js` sits at the top of the entire `app/` folder, so every route underneath it, `/`, `/login`, `/crm`, `/crm/customers`, all of it, renders inside that one root layout. There is no way to opt a route out of an ancestor layout. The only lever you have is *where in the folder tree* you add another layout, which is why the CRM's navigation will live in a new layout nested one level down, inside `app/crm/`, instead of trying to exclude `/` and `/login` from the root layout the way `RootLayout`'s sibling routes did.

Create `app/crm/layout.module.css`, matching the Vite CRM's `RootLayout.module.css`:

```css
/* app/crm/layout.module.css */
.shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100vh;
}

@media (max-width: 768px) {
  .shell {
    grid-template-columns: 1fr;
  }
}

.content {
  padding: var(--space-6);
  min-width: 0;
  overflow-y: auto;
}
```

Create `app/crm/layout.js`. It renders only `{children}` inside the grid for now, there is no navigation yet, that comes once `<Link>` has been introduced:

```jsx
// app/crm/layout.js
import styles from './layout.module.css';

export default function CrmLayout({ children }) {
  return (
    <div className={styles.shell}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
```

`app/crm/` has no `page.js` of its own yet, so `/crm` itself still 404s, only `layout.js` exists so far. Add a placeholder so there is something to navigate to:

Create `app/crm/page.js`:

```jsx
// app/crm/page.js
export default function DashboardPage() {
  return <p>Dashboard coming in Part 3.</p>;
}
```

**Browser check:** Visit `http://localhost:3000/crm`. The placeholder text renders inside the grid's content area. Visit `http://localhost:3000/crm/customers` too, the "Customers" page from earlier still renders the same way, both routes already sit inside `CrmLayout`.

### Navigation with the Next.js Link Component

Next.js provides its own `Link` component from `next/link`. Before using it, it helps to understand how it compares to the alternatives you already know:

| Approach | Code | What happens on click |
|----------|------|-----------------------|
| Plain HTML anchor | `<a href="/crm/customers">` | Full page reload, the browser discards all JS state and downloads the page from scratch |
| React Router `<Link>` (Vite CRM) | `<Link to="/app/customers">` | Client-side navigation, React swaps the component without a reload |
| Next.js `<Link>` | `<Link href="/crm/customers">` | Client-side navigation, same as React Router, plus Next.js **prefetches** the target page when the link appears in the viewport |

The prefetching behaviour is worth noting. When a `<Link>` scrolls into view, Next.js quietly fetches the code for the linked route in the background, the page's compiled JavaScript, not the data it displays. By the time the user clicks, that route is already cached and navigation feels instant. You get this for free without any configuration. Once `CustomersPage` fetches real data from an API in Part 3, prefetching still only covers the route itself; the data fetch happens fresh on navigation.

Try it before building any real navigation UI. Add two plain `<Link>`s to `app/crm/page.js` temporarily:

```jsx
// app/crm/page.js — temporary, just to try Link
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div>
      <p>Dashboard coming in Part 3.</p>
      <Link href="/crm/customers">Go to Customers</Link>
    </div>
  );
}
```

**Browser check:** Visit `/crm`, click "Go to Customers". The URL changes and the content area swaps, but watch the page as a whole: no full reload, no flash. That is client-side navigation. You will replace this temporary link with a real sidebar next.

> **Does `app/components/` become a route?** No. A folder inside `app/` only turns into a URL segment if it contains a `page.js` or `route.js` file directly inside it. `app/components/` will hold `SpecialOffer.js`, `Sidebar.js`, and their CSS Modules, no `page.js`, so Next.js never registers `/components` as a route. You can nest plain folders anywhere inside `app/` for organisation, the same way you nested `components/` inside `src/` in the Vite CRM, and they stay invisible to the router unless you add a `page.js`.

### Building a Real Sidebar

`Sidebar` goes into the same `app/components/` folder you already created for `SpecialOffer` in Part 1. Next.js has no built-in concept of "the" components folder the way the Vite CRM's single `src/components/` did, but there is nothing stopping one shared folder from working here too, and it is simpler to keep track of for a project this size.

The Vite CRM's navigation is a fixed sidebar, not a top bar, install the icon library it uses for the nav items:

```bash
npm install lucide-react
```

Create `app/components/Sidebar.module.css`:

```css
/* app/components/Sidebar.module.css */
.sidebar {
  background: var(--surface-card);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logo {
  padding: 18px 20px 14px;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border-bottom: 1px solid var(--border-subtle);
}

.logoMark {
  width: 28px;
  height: 28px;
  background: var(--primary-500);
  border-radius: var(--radius-md);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  padding: 5px;
}

.logoMark span {
  display: block;
  background: var(--neutral-0);
  border-radius: 2px;
  opacity: 0.9;
}

.logoText {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-strong);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3);
  flex: 1;
}

.navLabel {
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
  padding: 14px 10px 6px;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-body);
  text-decoration: none;
  transition: background var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.navItem:hover {
  background: var(--surface-hover);
  color: var(--text-strong);
}

.navItem svg {
  color: var(--text-muted);
  flex: none;
}

.navItemActive {
  background: var(--primary-100);
  color: var(--primary-700);
}

.navItemActive svg {
  color: var(--primary-600);
}

.foot {
  margin-top: auto;
  border-top: 1px solid var(--border-subtle);
  padding: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.signOutBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  flex: none;
  transition: background var(--duration-fast) var(--ease-standard);
}

.signOutBtn:hover {
  background: var(--surface-hover);
  color: var(--text-strong);
}
```

> This is a trimmed-down version of the Vite CRM's `Sidebar.module.css`. The original also styles a user name, a role badge, and an avatar in the footer, all sourced from `AuthContext`'s real user object. Today's login only sets a cookie holding a placeholder token string, there is no user object to read a name or role from, so those parts are left out. The footer keeps only the Sign Out button, whose real behaviour is Bonus Challenge 6. `.navItemActive` is included here already, but nothing applies it yet, that comes in the next section.

Create `app/components/Sidebar.js`. For now the two links just navigate, nothing highlights which one is active yet:

```jsx
// app/components/Sidebar.js
import Link from 'next/link';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className={styles.logoText}>Simple CRM</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navLabel}>Workspace</div>
        <Link href="/crm" className={styles.navItem}>
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </Link>
        <Link href="/crm/customers" className={styles.navItem}>
          <Users size={17} />
          <span>Customers</span>
        </Link>
      </nav>

      <div className={styles.foot}>
        <button className={styles.signOutBtn} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
```

The temporary `<Link>` in `app/crm/page.js` can stay, Part 3 replaces this file's contents entirely when the real Dashboard is built.

Render `Sidebar` in `app/crm/layout.js`:

```jsx
// app/crm/layout.js
import Sidebar from '../components/Sidebar';
import styles from './layout.module.css';

export default function CrmLayout({ children }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
```

**Browser check:** Visit `http://localhost:3000`, the public homepage, no sidebar. Visit `http://localhost:3000/crm`, the sidebar appears down the left side. Click "Customers", the sidebar stays, and the content area to the right swaps without a full reload. Look closely, though: nothing in the sidebar shows you which page you are currently on.

### Highlighting the Active Link

React Router's `<Link>` has a sibling component, `NavLink`, that adds an `active` class automatically based on the current URL, which is what the Vite CRM's `Sidebar.jsx` used for exactly this highlighting. Next.js's `<Link>` has no such sibling and no `isActive` prop at all, there is no built-in way to ask "is this the current route?" from inside a `<Link>`. You have to check the URL yourself. The `.navItemActive` rule is already sitting in `Sidebar.module.css`, unused, from when you first created the file; now it gets applied.

Update `app/components/Sidebar.js` to read the current URL with `usePathname` and apply that class conditionally:

```jsx
// app/components/Sidebar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

function navItemClass(pathname, href, exact = false) {
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + '/');
  return isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem;
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className={styles.logoText}>Simple CRM</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navLabel}>Workspace</div>
        <Link href="/crm" className={navItemClass(pathname, '/crm', true)}>
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </Link>
        <Link href="/crm/customers" className={navItemClass(pathname, '/crm/customers')}>
          <Users size={17} />
          <span>Customers</span>
        </Link>
      </nav>

      <div className={styles.foot}>
        <button className={styles.signOutBtn} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
```

`Sidebar` needs `'use client'` now because `usePathname` is a hook, and hooks only run in the browser, this is the first time the file needs it. `usePathname` returns the current URL's path, so `Sidebar` can compare it against each link's `href` and highlight whichever one matches. The `startsWith(href + '/')` check keeps "Customers" highlighted on nested routes too, like `/crm/customers/5`, not just the exact `/crm/customers` URL. "Dashboard" needs the `exact` match instead: `/crm` is a prefix of every route beneath it, so without `exact`, "Dashboard" would incorrectly stay highlighted on `/crm/customers` too. This is the same problem React Router's `<NavLink to="/app" end>` solves with its `end` prop, matching the index route exactly rather than everything nested under it.

**Browser check:** Visit `http://localhost:3000/crm`, "Dashboard" is highlighted. Click "Customers", the highlight moves to "Customers" and stays off "Dashboard".

### Dynamic Routes

The customer detail page has a URL like `/crm/customers/5` where `5` is a dynamic segment. In React Router you wrote `:id`. In the App Router you create a folder with the segment name wrapped in square brackets.

Create a folder literally named `[id]` (including the square brackets) inside `app/crm/customers/`. Everything inside it applies to any value in that URL position, `/crm/customers/5`, `/crm/customers/42`, `/crm/customers/anything`, all match.

Create `app/crm/customers/[id]/page.js`:

```jsx
// app/crm/customers/[id]/page.js
export default async function CustomerDetailPage({ params }) {
  const { id } = await params;
  return (
    <main>
      <h1>Customer {id}</h1>
    </main>
  );
}
```

Two things to notice here:

1. The component is `async`. Server Components can be asynchronous functions, this is not something you can do in a Vite React component.
2. `params` is a `Promise` in Next.js 15. You must `await` it to get the segment values.

**Browser check:** Visit `http://localhost:3000/crm/customers/42`. The page renders "Customer 42". Visit `/crm/customers/abc` and confirm it also renders. The segment value is just a string.

Create `app/crm/customers/page.module.css`:

```css
/* app/crm/customers/page.module.css */
.list {
  margin-top: var(--space-4);
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
```

Update `app/crm/customers/page.js` to link to a few hardcoded IDs so you can navigate to the detail page:

```jsx
// app/crm/customers/page.js
import Link from 'next/link';
import styles from './page.module.css';

const PLACEHOLDER_CUSTOMERS = [
  { id: '1', name: 'Alice Tan' },
  { id: '2', name: 'Ben Lim' },
  { id: '3', name: 'Carol Wong' },
];

export default function CustomersPage() {
  return (
    <main>
      <h1>Customers</h1>
      <ul className={styles.list}>
        {PLACEHOLDER_CUSTOMERS.map(c => (
          <li key={c.id}>
            <Link href={`/crm/customers/${c.id}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

You will replace the hardcoded data with a real API call in Part 3.

---

## Part 3: Fetch Data in a Server Component (30 minutes)

### The New Data Fetching Model

This is the biggest mental shift in Next.js compared to the Vite CRM. In the Vite CRM, all data fetching happened in the browser:

```jsx
// Vite CRM — fetch runs in the browser
useEffect(() => {
  fetch('https://api.example.com/customers')
    .then(r => r.json())
    .then(setCustomers);
}, []);
```

In a Next.js Server Component, the component itself is `async` and the `fetch` call runs on the server before any HTML is sent to the browser:

```jsx
// Next.js Server Component — fetch runs on the server
export default async function CustomersPage() {
  const res = await fetch('https://api.example.com/customers');
  const customers = await res.json();
  // customers is already populated — no useEffect, no useState
  return <ul>{customers.map(...)}</ul>;
}
```

There is no `useState` for loading state, no `useEffect`, and no race condition. The component suspends until the data arrives, then renders with the complete data already present.

### Set Up the Environment Variable

Create a `.env.local` file in the root of `crm-next/` (the same folder as `package.json`):

```
# .env.local
API_BASE_URL=http://localhost:3001
```

This points at the json-server instance you started earlier in Part 1. Make sure it is still running in its own terminal.

In Next.js, variables prefixed with `NEXT_PUBLIC_` are exposed to the browser; variables without this prefix are server-only, the browser never sees them. This is the same concept as the `VITE_` prefix in the Vite CRM, except Vite exposes everything with that prefix and nothing without it, so it flips the rule around. Every `fetch` call you write today runs inside a Server Component or a Server Action, never in the browser, so `API_BASE_URL` deliberately has no `NEXT_PUBLIC_` prefix. If a Client Component ever needed this value directly, that would be the moment to add the prefix, and not before.

> Add `.env.local` to your `.gitignore` file. It is not a secret in this case, but the habit is worth building.

Restart the dev server after creating the file:

```bash
npm run dev
```

### Fetch the Customer List

Update `app/crm/customers/page.js` to fetch real data:

```jsx
// app/crm/customers/page.js
import Link from 'next/link';

export default async function CustomersPage() {
  const res = await fetch(`${process.env.API_BASE_URL}/customers`);
  const customers = await res.json();

  return (
    <main>
      <h1>Customers</h1>
      <ul>
        {customers.map(c => (
          <li key={c.id}>
            <Link href={`/crm/customers/${c.id}`}>{c.firstName} {c.lastName}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

This is a plain list for now, you will replace it with the real `CustomerCard`-style grid in Part 4.

**Browser check:** The customer list loads from json-server. Open the Network tab in DevTools, you will not see the `fetch` request to `localhost:3001` there. The request was made on the server; the browser only received the rendered HTML.

### Route-Level Loading and Error Files

In the Vite CRM, every component that fetched data managed its own loading and error state manually:

```jsx
// What you wrote in the Vite CRM — in every component that fetches
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch('/customers')
    .then(r => r.json())
    .then(data => { setCustomers(data); setIsLoading(false); })
    .catch(err => { setError(err.message); setIsLoading(false); });
}, []);

if (isLoading) return <p>Loading...</p>;
if (error) return <p>Error: {error}</p>;
```

The App Router handles this through special filenames instead. Now that `app/crm/customers/page.js` makes a real network call, you have something for `loading.js` and `error.js` to actually respond to.

Create `app/components/Spinner.js`:

```jsx
// app/components/Spinner.js
export default function Spinner() {
  return <div className="spinner"></div>;
}
```

> No `'use client'` here. Unlike `Sidebar` or `SpecialOffer`, `Spinner` holds no state and attaches no event handlers, it is markup and a CSS animation, both of which render fine on the server. `loading.js` and `error.js` can render it as-is.

Create `app/crm/customers/loading.js`, shown automatically while the page is fetching data:

```jsx
// app/crm/customers/loading.js
import Spinner from '../../components/Spinner';

export default function Loading() {
  return <Spinner />;
}
```

**Browser check:** Open DevTools, go to the Network tab, and set throttling to "Slow 3G". Refresh `/crm/customers`. The `Spinner` appears while the server fetches the data, then the real list replaces it once the response arrives.

Create `app/crm/customers/error.js`, shown automatically if the page throws an unhandled error:

```jsx
// app/crm/customers/error.js
'use client';

export default function CustomersError({ error, reset }) {
  return (
    <main>
      <p>Something went wrong loading customers.</p>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
```

Notice the `'use client'` directive at the top of `error.js`. Error boundaries must be Client Components because they use the `reset` callback, which responds to user interaction.

> `layout.js`, `loading.js`, and `error.js` are **special filenames** that the App Router recognises automatically. You do not import them anywhere, Next.js wires them up based on their location. Any unhandled error thrown by `app/crm/customers/page.js` will render `error.js` instead of crashing the whole page.

**Browser check:** Stop json-server (`Ctrl+C` in its terminal), then reload `/crm/customers`. The `fetch` call fails, `page.js` throws, and `error.js` renders with the actual error message instead of the customer list. Restart json-server (`npm run server`), then click "Try again", the page re-fetches and the real list returns.

### Build the Dashboard

In the Vite CRM, `/app` was the index route inside the protected area, a Dashboard showing at-a-glance stats: total customers, and how many are active versus inactive. `app/crm/page.js` is its Next.js equivalent, the same Server Component pattern you just used for the customer list, applied to a second page. You will replace the placeholder from Part 2 with the real version now.

Create `app/crm/page.module.css`:

```css
/* app/crm/page.module.css */
.page {
  max-width: 720px;
}

.heading {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--text-strong);
  margin-bottom: var(--space-1);
}

.subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-4);
}

.statCard {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-6);
  box-shadow: var(--shadow-sm);
}

.statLabel {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.statValue {
  font-size: 2rem;
  font-weight: var(--weight-semibold);
  color: var(--text-strong);
  line-height: 1;
}

.statSuccess {
  color: var(--success-700);
}

.statMuted {
  color: var(--text-muted);
}
```

Replace `app/crm/page.js`:

```jsx
// app/crm/page.js
import styles from './page.module.css';

export const metadata = {
  title: 'Dashboard · Simple CRM',
};

export default async function DashboardPage() {
  const res = await fetch(`${process.env.API_BASE_URL}/customers`);
  const customers = await res.json();

  const activeCount = customers.filter(c => c.status === 'active').length;
  const inactiveCount = customers.filter(c => c.status === 'inactive').length;

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>
      <p className={styles.subtitle}>Overview of your workspace</p>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Customers</div>
          <div className={styles.statValue}>{customers.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active</div>
          <div className={`${styles.statValue} ${styles.statSuccess}`}>{activeCount}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Inactive</div>
          <div className={`${styles.statValue} ${styles.statMuted}`}>{inactiveCount}</div>
        </div>
      </div>
    </main>
  );
}
```

**Browser check:** Visit `http://localhost:3000/crm`. The three stat cards show real counts computed from your json-server data, and "Dashboard" in the sidebar is now highlighted instead of "Customers". Nothing here uses `useState` or `useEffect`, this page fetches, filters, and renders in one pass on the server, the exact same shape as `CustomersPage`, just with derived numbers instead of a list.

> Notice this page has no loading spinner of its own. Since `app/crm/` does not have its own `loading.js`, Next.js walks up to the nearest ancestor with one; today that means none is shown while this specific page fetches. Adding a `loading.js` here follows the same pattern as `app/crm/customers/loading.js` above, reusing the same `Spinner` component, and is Bonus Challenge 4 below.

### Fetch the Customer Detail

Create `app/crm/customers/[id]/page.module.css`, ported from the Vite CRM's `CustomerDetailPage.module.css`, the card panel every customer's details render inside:

```css
/* app/crm/customers/[id]/page.module.css */
.panel {
  max-width: 480px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
}

.backLink {
  display: inline-block;
  margin-bottom: var(--space-4);
  color: var(--text-muted);
  font-size: var(--text-sm);
  text-decoration: none;
}

.backLink:hover {
  color: var(--text-strong);
}

.name {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--text-strong);
  margin-bottom: var(--space-1);
}

.company {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}

.contactRow {
  font-size: var(--text-sm);
  color: var(--text-body);
  margin-bottom: var(--space-2);
}

.section {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

.sectionLabel {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

.badgeActive {
  background: var(--success-50);
  color: var(--success-700);
}

.badgeInactive {
  background: var(--neutral-100);
  color: var(--text-muted);
}

.tag {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--primary-700);
  background: var(--primary-100);
  border-radius: var(--radius-pill);
  padding: 2px 8px;
}
```

> This omits `.editButton` and `.deleteButton` from the original file, since building an Edit page and a Delete action are Bonus Challenges 7 and 8, not part of the core lesson.

Update `app/crm/customers/[id]/page.js` to fetch a single customer:

```jsx
// app/crm/customers/[id]/page.js
import Link from 'next/link';
import styles from './page.module.css';

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;

  const res = await fetch(`${process.env.API_BASE_URL}/customers/${id}`);
  const customer = await res.json();

  return (
    <div className={styles.panel}>
      <Link href="/crm/customers" className={styles.backLink}>← Back to customers</Link>
      <h1 className={styles.name}>{customer.firstName} {customer.lastName}</h1>
      {customer.company && <p className={styles.company}>{customer.company}</p>}

      <p className={styles.contactRow}>{customer.email}</p>
      {customer.phone && <p className={styles.contactRow}>{customer.phone}</p>}

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Status</p>
        <div className={styles.tags}>
          <span className={`${styles.badge} ${customer.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
            {customer.status}
          </span>
        </div>
      </div>
    </div>
  );
}
```

**Browser check:** Click a customer in the list. The detail page shows real data inside a card, with a status badge and a link back to the list. Notice how fast the navigation feels compared to the Vite CRM, each detail route's code was already prefetched in the background by `<Link>` while its card was visible in the list, only the data fetch itself happens fresh on click.

> **Why does server-side fetching matter for security?** If your API required a private API key, you could store it in a variable *without* the `NEXT_PUBLIC_` prefix. The key would only exist on the server and would never appear in the browser's Network tab or JavaScript bundle. In the Vite CRM, every API call is visible to anyone who opens DevTools. Server Components give you a way to call private APIs without exposing credentials to the browser.

---

## Activity: Fetch and Display Interactions (15 minutes, optional / take-home)

> This activity is not required to continue the lesson, nothing later depends on it. If time is short, skip it live and work through it afterward, on your own time; if there is room, do it live as originally planned.

The customer detail page currently shows the customer's name, email, and company. Your task is to add a section below the customer info that fetches and displays the customer's interactions.

**Task:** Update `app/crm/customers/[id]/page.js` so that:

1. It fetches the customer's interactions from `/interactions?customerId=:id` alongside the customer data
2. It displays each interaction's `type`, `notes`, and `date` in a list below the customer info
3. If there are no interactions, it shows a "No interactions yet." message

**Hints:**

1. You can make two `fetch` calls in the same `async` component. To fetch both at the same time rather than one after the other, use `Promise.all`.
2. The `date` field is an ISO date string. `new Date(date).toLocaleDateString()` formats it as a readable date.
3. Interactions live in their own flat collection in `db.json`, the same way you filtered them in Lesson 2.11: `?customerId=` is a json-server query filter that returns only interactions whose `customerId` field matches. Customer `c1` in the seed data already has two interactions to try this against.
4. Your `fetch` calls run on the server. You do not need `useEffect` or `useState`, just `await` the responses directly in the component function body.

<details>
<summary>Reference solution</summary>

Add to `app/crm/customers/[id]/page.module.css`. The interactions list sits inside a `.section`, the same divider style already used for the status badge above it:

```css
.interactionList {
  margin-top: var(--space-2);
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.interactionCard {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  font-size: var(--text-sm);
}

.interactionMeta {
  color: var(--text-muted);
}
```

```jsx
// app/crm/customers/[id]/page.js
import Link from 'next/link';
import styles from './page.module.css';

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;

  // Promise.all fetches both the customer and their interactions in parallel
  const [customerRes, interactionsRes] = await Promise.all([
    fetch(`${process.env.API_BASE_URL}/customers/${id}`),
    fetch(`${process.env.API_BASE_URL}/interactions?customerId=${id}`),
  ]);

  const customer = await customerRes.json();
  const interactions = await interactionsRes.json();

  return (
    <div className={styles.panel}>
      <Link href="/crm/customers" className={styles.backLink}>← Back to customers</Link>
      <h1 className={styles.name}>{customer.firstName} {customer.lastName}</h1>
      {customer.company && <p className={styles.company}>{customer.company}</p>}

      <p className={styles.contactRow}>{customer.email}</p>
      {customer.phone && <p className={styles.contactRow}>{customer.phone}</p>}

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Status</p>
        <div className={styles.tags}>
          <span className={`${styles.badge} ${customer.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
            {customer.status}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Interactions</p>
        {interactions.length === 0 ? (
          <p>No interactions yet.</p>
        ) : (
          <ul className={styles.interactionList}>
            {interactions.map(i => (
              <li key={i.id} className={styles.interactionCard}>
                <span>{i.type}</span>
                <span className={styles.interactionMeta}> · {new Date(i.date).toLocaleDateString()}</span>
                <p>{i.notes}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

</details>

---

## Part 4: Client Components and Interactivity (25 minutes)

### The Constraint: Server Components Cannot Have State

Everything you have built so far is a Server Component. Server Components are powerful for data fetching, but they have one firm constraint: they cannot hold state or respond to user events.

If you try to add `useState` to `CustomersPage`, Next.js will throw an error:

```
You're importing a component that needs useState. It only works in a Client Component,
but none of its parents are marked with 'use client'.
```

Any component that uses React hooks (`useState`, `useEffect`, `useRef`, etc.) or attaches event handlers (`onClick`, `onChange`, etc.) must be a **Client Component**. You declare this by adding `'use client'` as the very first line of the file.

### The Pattern: Server Component Fetches, Client Component Interacts

The recommended approach in Next.js is to keep the data fetching in the Server Component and extract only the interactive parts into a separate Client Component. The Server Component passes data down as props.

You will implement this pattern by adding a search box to the customer list. The search filters the list in the browser without making a new network request.

### Create the CustomerSearch Client Component

`Sidebar` and `SpecialOffer` live in `app/components/` because they are reusable UI, `Sidebar` wraps every page under `/crm`, and `SpecialOffer` was written without any single page in mind. `CustomerSearch` is different: it belongs to exactly one page and always will, so it is co-located directly inside `app/crm/customers/` instead, next to the `page.js` that renders it. Both are normal Next.js conventions; the choice is about whether a component is shared or tied to one specific route.

The Vite CRM renders each customer as a card, `CustomerCard.jsx`, with an avatar, a status badge, tags, and contact icons from `lucide-react`, the same icon library `Sidebar` already uses, laid out in a responsive grid, `.customers` in `App.css`.

Create `app/crm/customers/CustomerSearch.module.css`, combining `App.css`'s `.customers` grid with `CustomerCard.module.css`'s card styling:

```css
/* app/crm/customers/CustomerSearch.module.css */
.input {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--ring);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.empty {
  color: var(--text-muted);
  font-size: var(--text-sm);
  padding: var(--space-6) 0;
}

.card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  text-decoration: none;
  transition:
    box-shadow var(--duration-base) var(--ease-standard),
    background var(--duration-fast) var(--ease-standard);
}

.card:hover {
  background: var(--surface-hover);
  box-shadow: var(--shadow-md);
}

.cardHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  flex: none;
}

.name {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--text-strong);
  line-height: var(--leading-snug);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  flex: none;
}

.badgeActive {
  background: var(--success-50);
  color: var(--success-700);
}

.badgeInactive {
  background: var(--neutral-100);
  color: var(--text-muted);
}

.meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.metaRow {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-body);
}

.metaRow svg {
  color: var(--text-muted);
  flex: none;
}

.tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
}

.tag {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--primary-700);
  background: var(--primary-100);
  border-radius: var(--radius-pill);
  padding: 2px 8px;
}
```

> The Vite CRM's `CustomerCard` also renders a Delete button in the card footer, calling `deleteCustomer` from `CustomerContext`. Building that as a Server Action is Bonus Challenge 8, so it is left out here.

Create `app/crm/customers/CustomerSearch.js`:

```jsx
// app/crm/customers/CustomerSearch.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import styles from './CustomerSearch.module.css';

function initials(firstName, lastName) {
  return (firstName[0] + lastName[0]).toUpperCase();
}

export default function CustomerSearch({ customers }) {
  const [query, setQuery] = useState('');

  const filtered = customers.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    return fullName.includes(query.toLowerCase());
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className={styles.input}
      />
      {filtered.length === 0 ? (
        <p className={styles.empty}>No customers match your search.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(c => (
            <Link key={c.id} href={`/crm/customers/${c.id}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{initials(c.firstName, c.lastName)}</div>
                <span className={`${styles.badge} ${c.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                  {c.status}
                </span>
              </div>
              <p className={styles.name}>{c.firstName} {c.lastName}</p>
              <div className={styles.meta}>
                <div className={styles.metaRow}>
                  <Mail size={14} />
                  {c.email}
                </div>
                {c.phone && (
                  <div className={styles.metaRow}>
                    <Phone size={14} />
                    {c.phone}
                  </div>
                )}
              </div>
              {c.tags?.length > 0 && (
                <div className={styles.tags}>
                  {c.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Update the Customers Page to Use the Client Component

Add a `.pageHeader` rule to `app/crm/customers/page.module.css`, ported from `App.css`'s `.page-header`, used to place the "Customers" heading and an "Add Customer" link side by side:

```css
/* app/crm/customers/page.module.css */
.pageHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

Update `app/crm/customers/page.js` to fetch the data on the server and pass it to `CustomerSearch` as a prop:

```jsx
// app/crm/customers/page.js
import styles from './page.module.css';
import CustomerSearch from './CustomerSearch';

export const metadata = {
  title: 'Customers · Simple CRM',
};

export default async function CustomersPage() {
  const res = await fetch(`${process.env.API_BASE_URL}/customers`);
  const customers = await res.json();

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Customers</h1>
      </div>
      <CustomerSearch customers={customers} />
    </div>
  );
}
```

**Browser check:** The customer list loads from the server. Type in the search box, the list filters immediately without any network request, because `CustomerSearch` is running in the browser with the data already in memory.

### Understanding the Boundary

Take a moment to trace what happened:

1. The browser requests `/crm/customers`
2. Next.js runs `CustomersPage` on the server, it calls `fetch`, gets the customer list, and renders HTML
3. The HTML includes the `CustomerSearch` component's initial render (an empty search box and the full list)
4. The browser receives the HTML and displays it immediately
5. Next.js then "hydrates" `CustomerSearch` in the browser, attaches the `useState` and event listener so the search box becomes interactive

The `fetch` call never ran in the browser. The customer list data was passed from server to client as serialised JSON props.

> **Common mistake:** Adding `'use client'` to `CustomersPage` because you need the search box inside it. Do not do this, it would move the `fetch` call to the browser and send extra JavaScript to the user. The correct approach is to keep `CustomersPage` as a Server Component and extract only the interactive part (`CustomerSearch`) into a separate Client Component.

---

## Part 5: Gating a Route with Middleware (16 minutes, instructor demo)

> **Format for this part:** the instructor builds this live, screen-shared, narrating each step, rather than everyone typing along in real time. Watch first; copy the same steps into your own project afterward, at your own pace, once the demo is done. This keeps the room moving instead of waiting on individual typos across the whole login flow, and everything here is still exactly what you will build yourself right after.

### Why the Vite CRM Approach Does Not Carry Over Directly

In the Vite CRM, `ProtectedRoute` is a component that checks whether a user is logged in and, if not, redirects to `/login`:

```jsx
// Vite CRM — client-side route guard
function ProtectedRoute() {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

This works because in a Vite SPA, every route already runs entirely in the browser, so a component-level check is enough. In the App Router, `app/crm/customers/page.js` is a Server Component that runs on the server and fetches data *before* anything reaches the browser. A client-side check cannot stop that from happening, by the time a `ProtectedRoute`-style component could run in the browser, the server has already done the work of rendering the page.

Next.js solves this with **Middleware**: a function that runs on the server for every matching request, before any route handler or page component executes. It is the correct place to check "is this visitor allowed to see this page at all?"

### The Plan

You will build a simplified version of the CRM's login flow:

1. A `/login` page (Client Component) with a form for email and password.
2. A Server Action that checks the credentials against a hardcoded value and, if they match, sets a cookie.
3. `middleware.js` at the project root, which reads that cookie on every request to `/crm` and its subroutes, and redirects to `/login` if the cookie is missing.

This mirrors the shape of the CRM's existing `AuthContext` + `ProtectedRoute` pair, but moves the check to the server, which is the same pattern a real JWT-based login would use.

### Create the Login Page

Port the Vite CRM's `LoginPage.module.css`, a centered card with a logo mark:

```css
/* app/login/page.module.css */
.page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-page);
  padding: var(--space-6);
}

.card {
  width: 100%;
  max-width: 384px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  box-shadow: var(--shadow-md);
}

.logoWrap {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-6);
}

.logoMark {
  width: 40px;
  height: 40px;
  background: var(--primary-500);
  border-radius: var(--radius-md);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 7px;
}

.logoMark span {
  display: block;
  background: var(--neutral-0);
  border-radius: 2px;
}

.heading {
  font-size: 1.375rem;
  font-weight: var(--weight-semibold);
  text-align: center;
  color: var(--text-strong);
  margin-bottom: var(--space-2);
}

.lead {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-6);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-strong);
}

.input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--surface-card);
  font-family: var(--font-sans);
  font-size: var(--text-md);
  color: var(--text-strong);
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--ring);
}

.error {
  background: var(--danger-50, #f9eeed);
  border: 1px solid var(--danger-100, #f1d6d3);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  color: var(--danger-600);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
}

.submit {
  width: 100%;
  padding: var(--space-3);
  background: var(--action-primary);
  color: var(--text-on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  cursor: pointer;
  margin-top: var(--space-2);
  transition: background var(--duration-fast) var(--ease-standard);
}

.submit:hover {
  background: var(--action-primary-hover);
}
```

Create `app/login/actions.js`. This is a **Server Action**, a function marked `'use server'` that runs only on the server, even though it is called directly from a Client Component form:

```js
// app/login/actions.js
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const VALID_EMAIL = 'daniel@simplesystems.io';
const VALID_PASSWORD = 'password123';
const FAKE_TOKEN = 'not-a-real-jwt'; // stand-in for a JWT retrieved from an auth server

export async function login(previousState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
    return { error: 'Incorrect email or password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('access_token', FAKE_TOKEN, {
    httpOnly: true,
    path: '/',
  });

  redirect('/crm');
}
```

> `VALID_EMAIL`, `VALID_PASSWORD`, and `FAKE_TOKEN` are hardcoded here as a stand-in for a real check, using the same email and password the Vite CRM's `data/users.js` has used since Lesson 2.8. Everything below the credential check, the `cookies().set(...)` call and the Middleware that reads it, stays exactly the same whether the token is fake or real, only the value stored in `access_token` changes. The `httpOnly` option means the cookie cannot be read by client-side JavaScript, which is the same protection a real JWT cookie would need.

Create `app/login/LoginForm.js`, a Client Component holding the form itself:

```jsx
// app/login/LoginForm.js
'use client';

import { useActionState } from 'react';
import { login } from './actions';
import styles from './page.module.css';

export default function LoginForm() {
  const [state, formAction] = useActionState(login, null);

  return (
    <form action={formAction}>
      {state?.error && <div className={styles.error}>{state.error}</div>}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className={styles.input} required />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className={styles.input} required />
      </div>
      <button type="submit" className={styles.submit}>Sign in</button>
    </form>
  );
}
```

Create `app/login/page.js`, a Server Component that provides the page's `metadata` and renders the form:

```jsx
// app/login/page.js
import LoginForm from './LoginForm';
import styles from './page.module.css';

export const metadata = {
  title: 'Sign In · Simple CRM',
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <div className={styles.logoMark}>
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
        <h1 className={styles.heading}>Sign in</h1>
        <p className={styles.lead}>Welcome back to Simple CRM.</p>
        <LoginForm />
      </div>
    </main>
  );
}
```

> `metadata` exports are only allowed in Server Components. `LoginForm` needs `'use client'` because `useActionState` is a hook, so the `metadata` export has to live one level up, in a Server Component page that renders the form rather than being the form. This is the same Server-renders/Client-interacts split from Part 4's `CustomerSearch`, applied here for a different reason: not to keep a `fetch` off the browser, but to keep `metadata` in a file allowed to export it.

Two new pieces here:

1. `'use server'` in `actions.js` marks `login` as a Server Action. Next.js generates a network endpoint for it automatically; calling `login(...)` from the browser sends a request to the server and runs the real function there.
2. `useActionState` is a React hook that wires a Server Action up to a `<form>`. It tracks the state returned by the action (here, an `{ error }` object) across submissions, so you can show a validation message without writing your own `fetch` call or `onSubmit` handler.

> **Why does `login` take a `previousState` parameter it never uses?** `useActionState` always calls the action with the current state first, then `formData`, that positional order is fixed by the hook, not a choice `login` makes. Even a Server Action that never reads the previous state, like this one, still has to declare the parameter in first position so `formData` lands in the right place; leaving it out would shift `formData` into `previousState`'s slot and break `formData.get(...)` on every submission after the first.

**Browser check:** Visit `http://localhost:3000/login`. Submit the form with the wrong credentials, the error message appears. Submit with `daniel@simplesystems.io` / `password123`, you are redirected to `/crm`. Open DevTools, Application tab, Cookies, you will see an `access_token` cookie has been set.

### Gate the Customers Routes with Middleware

`middleware.js` is another special filename, like `page.js` or `layout.js`, but it lives at the **project root**, next to `package.json`, not inside `app/`, because it is not tied to one route or folder. A single `middleware.js` file can intercept any request to the app, which routes it actually runs on is controlled separately, by `config.matcher` below.

The file exports a function named `middleware` that takes the incoming `request` and returns a `NextResponse`: either `NextResponse.next()`, meaning "let this request through," or `NextResponse.redirect(url)`, meaning "send the visitor elsewhere instead." Next.js runs this function before any matched route's `page.js` or layout even starts rendering.

Create `middleware.js` in the project root (the same folder as `package.json`, not inside `app/`):

```js
// middleware.js
import { NextResponse } from 'next/server';

// Next.js calls this function for every request that matches `config.matcher` below,
// before any page.js or layout.js on that route runs.
export function middleware(request) {
  // Read the cookie the login Server Action set. This does not verify the token
  // is genuine, only that the cookie exists, see the caveat earlier in this lesson.
  const accessToken = request.cookies.get('access_token');

  if (!accessToken) {
    // No token: build the /login URL relative to this request, then redirect there
    // instead of letting the original request continue to its destination.
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Access token present: let the request continue to the route it asked for.
  return NextResponse.next();
}

// Restricts which requests middleware() runs for. Without this, it would run on
// every request to the app, including the public homepage and /login itself.
export const config = {
  matcher: ['/crm', '/crm/:path*'],
};
```

`config.matcher` tells Next.js which paths this Middleware should run for. `/crm` matches the Dashboard itself, and `/crm/:path*` matches every route beneath it, including `/crm/customers` and `/crm/customers/5`. Middleware runs before any Server Component on the matched route, so an unauthenticated request never reaches `app/crm/page.js` or `app/crm/customers/page.js` at all, no data is fetched and no HTML is rendered. This is the payoff of grouping every logged-in page under one `crm` folder back in Part 2: one matcher entry protects the whole area, rather than needing a separate line per route.

**Browser check:** Open DevTools, delete the `access_token` cookie, and visit `http://localhost:3000/crm` directly. You are redirected to `/login` before the page has a chance to load. Log in again and confirm you can reach `/crm` and `/crm/customers` normally.

> **Compare this to `ProtectedRoute`:** the Vite CRM's guard runs *after* the SPA has already loaded and React has mounted. Middleware runs *before* the server does any work for the request. This is a stronger guarantee: no data is fetched, no HTML is generated, and no JavaScript for the protected page is ever sent to an unauthenticated visitor.

---

## Self-Study: Mutating Data with a Server Action (20 minutes)

You have already used a Server Action once in the live session, `login` in Part 5. This section is a second, reinforcing example of the exact same pattern, applied to a different kind of mutation, creating a record instead of authenticating one. Nothing here introduces a new concept beyond what Part 5 already covered, so it does not need to be walked through live; work through it on your own, at your own pace, using the code below.

### Server Actions Are Not Just for Login

You have already used a Server Action once, `login` in `app/login/actions.js`. That same pattern, a `'use server'` function called directly from a `<form>`, is how Next.js handles every kind of data mutation: creating, updating, and deleting records. There is no separate "API client" to write and no `fetch` call in the browser.

Compare this to the Vite CRM, where `CustomerContext` held an `addCustomer` function that called `fetch` with a `POST` request from inside the browser:

```jsx
// Vite CRM — CustomerContext.jsx, runs in the browser
const addCustomer = async (customerData) => {
  const response = await fetch(`${API_BASE}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });
  const createdCustomer = await response.json();
  dispatch({ type: "ADD_CUSTOMER", payload: createdCustomer });
  return createdCustomer;
};
```

You will rebuild this as a Server Action instead. The form still lives in a Client Component, but the actual `POST` request now runs on the server.

### Validating Inside the Server Action

In Lesson 2.11, `NewCustomerPage` validated the form with a Yup schema, both on every `onBlur` and again on submit, both running in the browser, client-side validation. Today's version keeps the validation itself simple, plain `if` checks on the fields that matter, so the lesson can stay focused on the new concept: *where* that validation runs. Because the check lives inside the Server Action, it runs on the server instead, server-side validation, even though the form itself is still rendered by a Client Component.

`onBlur` validation in the browser is a UX nicety, a visitor could submit the form with browser JavaScript disabled, or send a request straight to the Server Action's endpoint with a tool like curl, bypassing any client-side check entirely. The Server Action is the boundary that cannot be skipped, so that is where the required-field check belongs today.

### Create the Add Customer Server Action

Create `app/crm/customers/new/actions.js`:

```js
// app/crm/customers/new/actions.js
'use server';

import { redirect } from 'next/navigation';

export async function addCustomer(previousState, formData) {
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const email = formData.get('email');

  if (!firstName || !lastName || !email) {
    return { error: 'First name, last name, and email are required.' };
  }

  const res = await fetch(`${process.env.API_BASE_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      phone: formData.get('phone') || '',
      status: formData.get('status'),
    }),
  });

  if (!res.ok) {
    return { error: `Server error: ${res.status}` };
  }

  const newCustomer = await res.json();
  redirect(`/crm/customers/${newCustomer.id}`);
}
```

> This mirrors `login` closely: a function that reads `formData`, does some validation, and either returns an `{ error }` object or redirects. The only new piece is the `fetch` call, which is identical in shape to a Server Component's `fetch`, just running in response to a form submission rather than a page load.

> **What about Yup and `onBlur` validation in the browser?** Lesson 2.11's form used a Yup schema and validated each field as the learner tabbed away from it, giving immediate feedback before submit. Both still work exactly the same way inside a Next.js Client Component or Server Action, nothing about Server Actions forbids a schema library. Today's version keeps things to a plain required-field check to keep the example focused on the server-side mutation pattern; bringing back Yup and wiring up `onBlur` validation on top of it is Bonus Challenge 9 below.

### Create the Add Customer Page

Port the Vite CRM's form styling for this page, `.add-customer-form` and `.form-field` came from `App.css` there, a stylesheet shared across every page; here they become this page's own CSS Module:

```css
/* app/crm/customers/new/page.module.css */
.backLink {
  display: inline-block;
  margin-bottom: var(--space-4);
  color: var(--text-muted);
  font-size: var(--text-sm);
  text-decoration: none;
}

.backLink:hover {
  color: var(--text-strong);
}

.form {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  max-width: 480px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-strong);
}

.input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-md);
  color: var(--text-strong);
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--ring);
}

.submit {
  padding: var(--space-2) var(--space-5);
  background: var(--action-primary);
  color: var(--text-on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}

.submit:hover {
  background: var(--action-primary-hover);
}

.error {
  margin-top: var(--space-4);
  color: var(--danger-600);
  font-size: var(--text-sm);
}
```

Create `app/crm/customers/new/page.js`:

```jsx
// app/crm/customers/new/page.js
'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { addCustomer } from './actions';
import styles from './page.module.css';

export default function NewCustomerPage() {
  const [state, formAction] = useActionState(addCustomer, null);

  return (
    <div>
      <Link href="/crm/customers" className={styles.backLink}>← Back to customers</Link>
      <h1>Add Customer</h1>
      <form action={formAction} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="firstName">First name</label>
          <input id="firstName" name="firstName" className={styles.input} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="lastName">Last name</label>
          <input id="lastName" name="lastName" className={styles.input} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className={styles.input} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="status">Status</label>
          <select id="status" name="status" className={styles.input} defaultValue="active">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button type="submit" className={styles.submit}>Add Customer</button>
        {state?.error && <p className={styles.error}>{state.error}</p>}
      </form>
    </div>
  );
}
```

Add a `.btnPrimaryLink` rule to `app/crm/customers/page.module.css`, ported from `App.css`'s `.btn-primary-link`:

```css
/* add to app/crm/customers/page.module.css */
.btnPrimaryLink {
  padding: var(--space-2) var(--space-5);
  background: var(--action-primary);
  color: var(--text-on-primary);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  text-decoration: none;
  transition: background var(--duration-fast) var(--ease-standard);
}

.btnPrimaryLink:hover {
  background: var(--action-primary-hover);
}
```

Add the link inside `.pageHeader`, alongside the `<h1>`:

```jsx
// app/crm/customers/page.js — add this import and link
import Link from 'next/link';
// ...
<div className={styles.pageHeader}>
  <h1>Customers</h1>
  <Link href="/crm/customers/new" className={styles.btnPrimaryLink}>Add Customer</Link>
</div>
```

**Browser check:** Visit `/crm/customers/new`. The `required` attribute on the `firstName`, `lastName`, and `email` inputs stops the browser from submitting an empty form at all, try removing `required` temporarily in DevTools' Elements panel and submitting with a field blank to see the Server Action's own error message appear instead. Submit with all fields filled in correctly, confirm you land on the new customer's detail page and the customer appears in the list.

> **Why no `useState` for the form fields themselves?** The Vite CRM's `NewCustomerPage` tracked every field in a `form` state object so it could validate `onBlur`, before the form was even submitted. That pattern still works fine in Next.js inside a Client Component, nothing about Server Actions forbids it. This lesson uses uncontrolled inputs (`defaultValue`, `formData.get(...)`) and validates only on submit, to keep the example focused on the server-side mutation pattern. Wiring `useActionState` together with per-field `onBlur` validation, optionally backed by Yup as Lesson 2.11 did, is Bonus Challenge 9 below.

---

## Bonus Challenges

These challenges have no provided solution. They are for learners who finish the lab early. They are ordered roughly by difficulty, and the later ones assume you have completed the "Mutating Data with a Server Action" self-study section.

1. Add `app/crm/customers/[id]/not-found.js` that renders a friendly "Customer not found" message. In the detail page, call `notFound()` from `next/navigation` if the API returns a 404 status.
2. Add a second filter to `CustomerSearch`: a `<select>` dropdown that filters by the customer's status (`active` / `inactive`). Both the name search and the status filter should work together.
3. Add a `loading.js` file inside `app/crm/customers/[id]/` so the detail page also shows a loading state while it fetches. Throttle the network to observe it.
4. Add a `loading.js` file inside `app/crm/` so the Dashboard also shows a loading state while it fetches. Throttle the network to observe it.
5. In `CustomerSearch`, add a "Sort A-Z / Z-A" toggle button that sorts the filtered results alphabetically by last name.
6. Wire up the "Sign out" button in `Sidebar` to call a Server Action that deletes the `access_token` cookie, then redirects to `/login`.
7. Build an Edit Customer page at `app/crm/customers/[id]/edit/page.js`, following the same pattern as the Add Customer Server Action: a Client Component form calling a `'use server'` action that sends a `PUT` request, then redirects back to the detail page.
8. Add a Delete Customer button to the detail page that calls a Server Action to send a `DELETE` request, then redirects to `/crm/customers`. Consider what should happen if the delete fails.
9. Add per-field validation to the Add Customer form using `onBlur` and `useState`, the way `NewCustomerPage` did in the Vite CRM, in addition to the server-side check in the Server Action. Note that both are needed: the client-side check improves the experience, but the server-side check is the one that cannot be bypassed.
10. In the Vite CRM, Delete Customer was restricted to users with the `admin` role. Sketch out, in comments or a short writeup, how you would extend today's single-user login to carry a role, and where in the Delete Customer Server Action you would check it. You do not need to implement it.

---

## Self-Study: Route Handlers as an API Layer

Everything in this lesson has called json-server directly from a Server Component or a Server Action. That is a reasonable choice for a small app talking to a single API, and it is what you built today.

There is a second option worth knowing about: **Route Handlers**. A file at `app/api/customers/route.js` defines an API endpoint at `/api/customers`, served by your own Next.js app. Instead of a Server Component calling the data API directly, it would call `/api/customers` on your own server, which in turn calls the data API. This pattern matters most once that data API is a hosted third-party service, MockAPI.io in Lesson 2.11, for example, rather than the local json-server you used today.

```js
// app/api/customers/route.js — read this, no need to build it today
import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch(`${process.env.API_BASE_URL}/customers`);
  const customers = await res.json();
  return NextResponse.json(customers);
}

export async function POST(request) {
  const body = await request.json();
  const res = await fetch(`${process.env.API_BASE_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const created = await res.json();
  return NextResponse.json(created, { status: res.status });
}
```

```js
// app/api/customers/[id]/route.js — read this, no need to build it today
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = await params;
  const res = await fetch(`${process.env.API_BASE_URL}/customers/${id}`);
  const customer = await res.json();
  return NextResponse.json(customer, { status: res.status });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(`${process.env.API_BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const updated = await res.json();
  return NextResponse.json(updated, { status: res.status });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const res = await fetch(`${process.env.API_BASE_URL}/customers/${id}`, {
    method: 'DELETE',
  });
  return new NextResponse(null, { status: res.status });
}
```

A page or Server Action would then call `fetch('/api/customers')` instead of calling the data API's URL directly.

**Why this matters, and why it is not in today's build:**

- **Hiding secrets.** If your data API required a private API key, a Route Handler is where you would attach it, using a server-only environment variable without the `NEXT_PUBLIC_` prefix. The key would never reach the browser. json-server does not require a key, so this benefit does not apply today, but it will the moment any hosted API you call, MockAPI.io included, does need one.
- **Hiding the real endpoint.** A Route Handler means the browser's Network tab shows requests to your own domain, not to a third party's. This is a minor benefit today, since Server Components already keep the API call off the browser entirely, but it matters more once Client Components need to trigger requests too, or once the data API is a hosted service with a public URL worth hiding.
- **Matching the shape of a real backend.** A real backend exposes REST endpoints that your Next.js app would call, most likely through Route Handlers like the ones above, so this pattern is closer to what a production integration looks like than a direct `fetch` to a local data file.

This lesson does not build Route Handlers because a Server Component or Server Action calling json-server directly already satisfies every requirement in today's lab. Read through the code above, and optionally try wiring `app/crm/customers/page.js` to call `/api/customers` instead of json-server directly, as practice for connecting a Next.js frontend to a real backend later.

---

## Summary

| Concept | What it does |
|---------|-------------|
| App Router | Folder-based routing, `app/crm/customers/page.js` is the `/crm/customers` route; no `<Routes>` config needed |
| Shared route grouping | Every logged-in page lives under `app/crm/`, the equivalent of the Vite CRM's `/app` prefix; one Middleware matcher entry protects the whole area |
| `layout.js` | Shared wrapper rendered around every page in the same folder and its subfolders |
| `loading.js` | Automatic Suspense fallback shown while a Server Component awaits data |
| `error.js` | Route-level error boundary shown when a page throws an unhandled error; must be a Client Component |
| Dynamic segment | Folder named `[id]`, the value is passed to the page as `params.id` |
| Server Component | Runs on the server; can be `async`; no `useState`, `useEffect`, or event handlers; sends zero JS to the browser |
| Client Component | Runs in the browser; requires `'use client'`; supports hooks and event handlers |
| Server-to-client data flow | Server Component fetches data and passes it as props to a Client Component |
| `NEXT_PUBLIC_` prefix | Makes a Next.js environment variable available to client-side code |
| CSS Modules | `Component.module.css` scopes class names to the component that imports them, same as in the Vite CRM |
| Server Action | A `'use server'` function callable directly from a Client Component form; runs only on the server; used here for login and for creating a customer |
| `useActionState` | React hook that wires a Server Action to a `<form>` and tracks the state it returns across submissions |
| Validation inside a Server Action | A Server Action is the trustworthy validation boundary, since it can be called even if client-side checks are bypassed; the same schema-based validation from Lesson 2.11 (Yup) would work unchanged on the server if you brought it back |
| Middleware | A `middleware.js` function that runs on the server before a matched route renders; used here to gate `/crm` and everything beneath it behind a login check |
| Route Handler | A `route.js` file under `app/api/` that defines a REST endpoint served by your own Next.js app; covered as self-study, not built in the lab |

---

## Additional Resources

- [Next.js — App Router Introduction](https://nextjs.org/docs/app)
- [Next.js — Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js — Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching)
- [Next.js — Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js — Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js — Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
