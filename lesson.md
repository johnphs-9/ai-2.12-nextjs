# Lesson 2.12: Introduction to Next.js I

## Overview

- **Duration:** ~2.5 hours (hands-on lab)
- **Prerequisites:** Lesson 2.11 — Form Handling, Validation, and Deployment

## Learning Objectives

By the end of this lesson, you will be able to:

1. **Explain** the difference between a React SPA rendered in the browser and a Next.js application that renders on the server
2. **Build** a multi-page Next.js application using the App Router file conventions
3. **Distinguish** between Server Components and Client Components and apply the correct pattern for data fetching and interactivity

## Introduction

Every lesson so far has used Vite to build a single-page application: the browser downloads an empty `index.html`, loads a JavaScript bundle, and React renders the page in the browser. This works well, but it has trade-offs: search engines see an empty page until the JavaScript runs, and users on slow connections wait for the bundle to download before anything appears.

Next.js solves this by adding a server layer. Pages are rendered on the server before they reach the browser, so users see real HTML immediately and search engines can index the content. In this lesson you will create a new Next.js project and progressively rebuild the CRM inside it, mapping each familiar concept from the Vite CRM to its Next.js equivalent.

By the end of the lab, you will have a working Next.js CRM with a customer list page, a customer detail page, live data from MockAPI.io, a route-level error boundary, and an interactive client-side search box.

---

## Part 1: Bootstrap the Next.js Project (15 minutes)

### Scaffolding with create-next-app

`create-next-app` is the official CLI for creating a new Next.js project. It generates the App Router file structure, installs dependencies, and configures Tailwind CSS — the same styling library you have been using in the Vite CRM.

Open a terminal, navigate to the folder where you keep your projects, and run:

```bash
npx create-next-app@latest crm-next
```

You will be prompted with a series of questions. Answer them exactly as shown:

```
Would you like to use TypeScript?              No
Would you like to use ESLint?                  Yes
Would you like to use Tailwind CSS?            Yes
Would you like your code inside a `src/` directory?  No
Would you like to use App Router?              Yes
Would you like to use Turbopack for next dev?  Yes
Would you like to customize the import alias?  No
```

> We are opting out of TypeScript for now. Next.js uses TypeScript by default, which is why you will see `.tsx` and `.ts` file extensions in the generated project even though we selected No. You will learn TypeScript properly in Lesson 2.13 when you can focus on the language itself rather than juggling two new topics at once.

Once the scaffold completes, open the project in your editor:

```bash
cd crm-next
code .
```

### Touring the Generated Files

Before writing any code, spend a few minutes reading through what was generated. The most important files are:

| File | What it does |
|------|-------------|
| `app/layout.tsx` | Root layout — wraps every page in the app |
| `app/page.tsx` | The home route `/` |
| `app/globals.css` | Global styles imported by the root layout |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind configuration |

Notice that there is no `main.jsx`, no `ReactDOM.createRoot`, and no `<Router>` component. Next.js handles all of that internally.

### Start the Dev Server and Replace the Home Page

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`. You will see the default Next.js welcome page.

Now replace the contents of `app/page.tsx` with a minimal home page for the CRM:

```jsx
export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">CRM</h1>
      <p className="mt-2 text-gray-600">Welcome. Select Customers to get started.</p>
    </main>
  );
}
```

**Browser check:** Save the file. The page updates immediately — no manual refresh needed. Note that there is no Vite dev server here; Next.js has its own development server with the same hot-reload behaviour.

---

## Part 2: Routes, Layout, and Error Handling (35 minutes)

### How the App Router Creates Pages

In the Vite CRM, routes were defined in a `<Routes>` component:

```jsx
// Vite CRM — you had to declare every route explicitly
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/customers" element={<CustomerList />} />
  <Route path="/customers/:id" element={<CustomerDetail />} />
</Routes>
```

In the App Router, routes come from the folder structure. Create a file at `app/customers/page.tsx` and the `/customers` route exists automatically. No configuration required.

Create `app/customers/page.tsx`:

```jsx
export default function CustomersPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Customers</h1>
    </main>
  );
}
```

**Browser check:** Visit `http://localhost:3000/customers`. The page renders. You did not register a route anywhere.

### Navigation with the Next.js Link Component

Next.js provides its own `Link` component from `next/link`. Before using it, it helps to understand how it compares to the alternatives you already know:

| Approach | Code | What happens on click |
|----------|------|-----------------------|
| Plain HTML anchor | `<a href="/customers">` | Full page reload — the browser discards all JS state and downloads the page from scratch |
| React Router `<Link>` (Vite CRM) | `<Link to="/customers">` | Client-side navigation — React swaps the component without a reload |
| Next.js `<Link>` | `<Link href="/customers">` | Client-side navigation, same as React Router — plus Next.js **prefetches** the target page when the link appears in the viewport |

The prefetching behaviour is worth noting. When a `<Link>` scrolls into view, Next.js quietly fetches the data for the linked page in the background. By the time the user clicks, the page is likely already cached and navigation feels instant. You get this for free without any configuration.

Create `app/components/NavBar.tsx`:

```jsx
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="flex gap-6 border-b px-8 py-4 text-sm font-medium">
      <Link href="/" className="hover:underline">Home</Link>
      <Link href="/customers" className="hover:underline">Customers</Link>
    </nav>
  );
}
```

### Adding a Shared Layout

In the Vite CRM, you placed the navigation bar inside the top-level `App.jsx` so it appeared on every page. In Next.js, shared UI belongs in `layout.tsx`. The root layout at `app/layout.tsx` wraps every page in the application.

Open `app/layout.tsx` and add the `NavBar` import and render it inside `<body>`:

```jsx
import type { Metadata } from 'next';
import './globals.css';
import NavBar from './components/NavBar';

export const metadata: Metadata = {
  title: 'Simple CRM',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
```

**Browser check:** The navigation bar now appears on both the home page and the customers page. Clicking the links navigates between them without a full page reload.

### Dynamic Routes

The customer detail page has a URL like `/customers/5` where `5` is a dynamic segment. In React Router you wrote `:id`. In the App Router you create a folder with the segment name wrapped in square brackets.

Create `app/customers/[id]/page.tsx`:

```jsx
export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Customer {id}</h1>
    </main>
  );
}
```

Two things to notice here:

1. The component is `async`. Server Components can be asynchronous functions — this is not something you can do in a Vite React component.
2. `params` is a `Promise` in Next.js 15. You must `await` it to get the segment values.

**Browser check:** Visit `http://localhost:3000/customers/42`. The page renders "Customer 42". Visit `/customers/abc` and confirm it also renders. The segment value is just a string.

Update `app/customers/page.tsx` to link to a few hardcoded IDs so you can navigate to the detail page:

```jsx
import Link from 'next/link';

const PLACEHOLDER_CUSTOMERS = [
  { id: '1', name: 'Alice Tan' },
  { id: '2', name: 'Ben Lim' },
  { id: '3', name: 'Carol Wong' },
];

export default function CustomersPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <ul className="space-y-2">
        {PLACEHOLDER_CUSTOMERS.map(c => (
          <li key={c.id}>
            <Link href={`/customers/${c.id}`} className="text-blue-600 hover:underline">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

You will replace the hardcoded data with a real API call in Part 3.

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

The App Router handles this through special filenames instead. Create two files in `app/customers/`:

**`app/customers/loading.tsx`** — shown automatically while the page is fetching data:

```jsx
export default function Loading() {
  return (
    <main className="p-8">
      <p className="text-gray-500">Loading customers...</p>
    </main>
  );
}
```

**`app/customers/error.tsx`** — shown automatically if the page throws an unhandled error:

```jsx
'use client';

export default function CustomersError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="p-8">
      <p className="text-red-600 font-medium">Something went wrong loading customers.</p>
      <p className="mt-1 text-sm text-gray-500">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </main>
  );
}
```

Notice the `'use client'` directive at the top of `error.tsx`. Error boundaries must be Client Components because they use the `reset` callback, which responds to user interaction. You will learn more about `'use client'` in Part 4.

> `layout.tsx`, `loading.tsx`, and `error.tsx` are **special filenames** that the App Router recognises automatically. You do not import them anywhere — Next.js wires them up based on their location. Any unhandled error thrown by `app/customers/page.tsx` will render `error.tsx` instead of crashing the whole page. You will see `loading.tsx` in action in the next part when the page makes a real network request.

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
NEXT_PUBLIC_API_BASE_URL=https://YOUR-PROJECT-ID.mockapi.io/api/v1
```

Replace the URL with the MockAPI.io base URL from your Lesson 2.11 project. If you no longer have it, log in to MockAPI.io and copy it from the project page.

In Next.js, variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Variables without this prefix are server-only — the browser never sees them. This is the same concept as the `VITE_` prefix in the Vite CRM.

> Add `.env.local` to your `.gitignore` file. It is not a secret in this case, but the habit is worth building.

Restart the dev server after creating the file:

```bash
npm run dev
```

### Fetch the Customer List

Update `app/customers/page.tsx` to fetch real data:

```jsx
import Link from 'next/link';

export default async function CustomersPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`);
  const customers = await res.json();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <ul className="space-y-2">
        {customers.map((c: { id: string; firstName: string; lastName: string }) => (
          <li key={c.id}>
            <Link href={`/customers/${c.id}`} className="text-blue-600 hover:underline">
              {c.firstName} {c.lastName}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

**Browser check:** The customer list loads from MockAPI.io. Open the Network tab in DevTools — you will not see the `fetch` request to MockAPI.io there. The request was made on the server; the browser only received the rendered HTML.

To observe `loading.tsx` in action, open DevTools, go to the Network tab, and set throttling to "Slow 3G". Refresh the page. The "Loading customers..." message appears while the server fetches the data.

### Fetch the Customer Detail

Update `app/customers/[id]/page.tsx` to fetch a single customer:

```jsx
export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers/${id}`);
  const customer = await res.json();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{customer.firstName} {customer.lastName}</h1>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-medium text-gray-500">Email</dt>
          <dd>{customer.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Job Title</dt>
          <dd>{customer.jobTitle}</dd>
        </div>
      </dl>
    </main>
  );
}
```

**Browser check:** Click a customer in the list. The detail page shows real data. Notice how fast the navigation feels compared to the Vite CRM — the customer list page was prefetched in the background by `<Link>` while you were looking at the list.

> **Why does server-side fetching matter for security?** If MockAPI.io required a private API key, you could store it in a variable *without* the `NEXT_PUBLIC_` prefix. The key would only exist on the server and would never appear in the browser's Network tab or JavaScript bundle. In the Vite CRM, every API call is visible to anyone who opens DevTools. Server Components give you a way to call private APIs without exposing credentials to the browser.

---

## Activity: Fetch and Display Interactions (15 minutes)

The customer detail page currently shows the customer's name, email, and job title. Your task is to add a section below the customer info that fetches and displays the customer's interactions.

**Task:** Update `app/customers/[id]/page.tsx` so that:

1. It fetches the customer's interactions from `/customers/:id/interactions` alongside the customer data
2. It displays each interaction's `type`, `notes`, and `date` in a list below the customer info
3. If there are no interactions, it shows a "No interactions yet." message

**Hints:**

1. You can make two `fetch` calls in the same `async` component. To fetch both at the same time rather than one after the other, use `Promise.all`.
2. The `date` field from MockAPI.io is an ISO date string. `new Date(date).toLocaleDateString()` formats it as a readable date.
3. If your MockAPI.io project does not have any interaction records, add a few manually via the MockAPI.io data table, using a `customerId` that matches one of your customers.
4. Your `fetch` calls run on the server. You do not need `useEffect` or `useState` — just `await` the responses directly in the component function body.

<details>
<summary>Reference solution</summary>

```jsx
export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [customerRes, interactionsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers/${id}`),
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/interactions?customerId=${id}`),
  ]);

  const customer = await customerRes.json();
  const interactions = await interactionsRes.json();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{customer.firstName} {customer.lastName}</h1>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-medium text-gray-500">Email</dt>
          <dd>{customer.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Job Title</dt>
          <dd>{customer.jobTitle}</dd>
        </div>
      </dl>

      <h2 className="mt-8 text-lg font-semibold">Interactions</h2>
      {interactions.length === 0 ? (
        <p className="mt-2 text-gray-500">No interactions yet.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {interactions.map((i: { id: string; type: string; notes: string; date: string }) => (
            <li key={i.id} className="rounded border p-3 text-sm">
              <span className="font-medium capitalize">{i.type}</span>
              <span className="mx-2 text-gray-400">·</span>
              <span className="text-gray-500">{new Date(i.date).toLocaleDateString()}</span>
              <p className="mt-1 text-gray-700">{i.notes}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
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

Create `app/customers/CustomerSearch.tsx`:

```jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function CustomerSearch({ customers }: { customers: Customer[] }) {
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
        className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <ul className="mt-4 space-y-2">
        {filtered.map(c => (
          <li key={c.id}>
            <Link href={`/customers/${c.id}`} className="text-blue-600 hover:underline text-sm">
              {c.firstName} {c.lastName}
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-sm text-gray-500">No customers match your search.</li>
        )}
      </ul>
    </div>
  );
}
```

### Update the Customers Page to Use the Client Component

Update `app/customers/page.tsx` to fetch the data on the server and pass it to `CustomerSearch` as a prop:

```jsx
import CustomerSearch from './CustomerSearch';

export default async function CustomersPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`);
  const customers = await res.json();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <CustomerSearch customers={customers} />
    </main>
  );
}
```

**Browser check:** The customer list loads from the server. Type in the search box — the list filters immediately without any network request, because `CustomerSearch` is running in the browser with the data already in memory.

### Understanding the Boundary

Take a moment to trace what happened:

1. The browser requests `/customers`
2. Next.js runs `CustomersPage` on the server — it calls `fetch`, gets the customer list, and renders HTML
3. The HTML includes the `CustomerSearch` component's initial render (an empty search box and the full list)
4. The browser receives the HTML and displays it immediately
5. Next.js then "hydrates" `CustomerSearch` in the browser — attaches the `useState` and event listener so the search box becomes interactive

The `fetch` call never ran in the browser. The customer list data was passed from server to client as serialised JSON props.

> **Common mistake:** Adding `'use client'` to `CustomersPage` because you need the search box inside it. Do not do this — it would move the `fetch` call to the browser and send extra JavaScript to the user. The correct approach is to keep `CustomersPage` as a Server Component and extract only the interactive part (`CustomerSearch`) into a separate Client Component.

---

## Bonus Challenges

These challenges have no provided solution. They are for learners who finish the lab early.

1. Add `app/customers/[id]/not-found.tsx` that renders a friendly "Customer not found" message. In the detail page, call `notFound()` from `next/navigation` if the API returns a 404 status.
2. Add a second filter to `CustomerSearch`: a `<select>` dropdown that filters by the customer's job title. Both the name search and the job title filter should work together.
3. Add a `loading.tsx` file inside `app/customers/[id]/` so the detail page also shows a loading state while it fetches. Throttle the network to observe it.
4. In `CustomerSearch`, add a "Sort A–Z / Z–A" toggle button that sorts the filtered results alphabetically by last name.

---

## Summary

| Concept | What it does |
|---------|-------------|
| App Router | Folder-based routing — `app/customers/page.tsx` is the `/customers` route; no `<Routes>` config needed |
| `layout.tsx` | Shared wrapper rendered around every page in the same folder and its subfolders |
| `loading.tsx` | Automatic Suspense fallback shown while a Server Component awaits data |
| `error.tsx` | Route-level error boundary shown when a page throws an unhandled error; must be a Client Component |
| Dynamic segment | Folder named `[id]` — the value is passed to the page as `params.id` |
| Server Component | Runs on the server; can be `async`; no `useState`, `useEffect`, or event handlers; sends zero JS to the browser |
| Client Component | Runs in the browser; requires `'use client'`; supports hooks and event handlers |
| Server-to-client data flow | Server Component fetches data and passes it as props to a Client Component |
| `NEXT_PUBLIC_` prefix | Makes a Next.js environment variable available to client-side code |

---

## Additional Resources

- [Next.js — App Router Introduction](https://nextjs.org/docs/app)
- [Next.js — Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js — Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching)
- [Next.js — Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
