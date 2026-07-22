# Pre-Reading: Lesson 2.12, Introduction to Next.js

Timebox **1.5-2 hours** across these resources before the lesson. You do not need to read every linked page in full detail; the goal is to arrive with a mental model of why Next.js exists, how its folder-based routing works, what it means for a component to run on the server rather than in the browser, and how a route can be gated or a form submitted without writing client-side `fetch` calls.

---

## 1. Why Next.js Exists

**Read (10 min)**

- [Next.js Docs: Introduction](https://nextjs.org/docs): Read the short introduction page. Pay attention to the list of built-in features, particularly server-side rendering, image optimization, and the App Router. You do not need to understand all of them yet; the goal is to see the scope of what Next.js adds on top of React.

**Key idea to take away:** React is a UI library that renders in the browser. Next.js is a framework that wraps React and adds a server layer. Pages can be rendered on the server before any HTML reaches the browser, which improves both perceived load time and search engine indexability.

**Quick check:** In a standard Vite React app, what does the browser receive when it requests `https://myapp.com/customers`? What does it receive from a Next.js app serving the same route?

---

## 2. The App Router

**Read (15 min)**

- [Next.js Docs: Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages): Read the full page. The key file conventions to understand before the lesson are `page.js`, `layout.js`, and dynamic segments (`[id]`).

**Key ideas:**

- Routes come from the folder structure inside `app/`. Creating `app/customers/page.js` makes `/customers` a valid route, no configuration required.
- `layout.js` wraps every page in the same folder and its subfolders. It is the correct place for a navigation bar.
- Dynamic segments use square brackets: `app/customers/[id]/page.js` matches `/customers/1`, `/customers/42`, etc.
- `loading.js` and `error.js` are sibling file conventions covered in the lesson itself: `loading.js` is shown automatically while a page is waiting for data, and `error.js` is a route-level error boundary. You do not need to read about these two before class.

**Quick check:** If you wanted a route at `/settings/profile`, what folder structure and filename would you create inside `app/`?

---

## 3. Server Components and Client Components

**Read (20 min)**

- [Next.js Docs: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components): Read the full page. Focus on the "When to use Server and Client Components?" section and the "Using Client Components" example.

**Key ideas:**

- All components in `app/` are Server Components by default. They run on the server, can `async/await` data directly, and send no JavaScript to the browser.
- Client Components are declared by adding `'use client'` as the first line of the file. They run in the browser and support React hooks and event handlers.
- Server Components cannot hold state or respond to events. Client Components cannot `async/await` at the top level (they must use `useEffect` for data fetching triggered after the initial render).
- The recommended pattern: a Server Component fetches data and passes it as props to a Client Component that handles interactivity.

**Key idea to take away:** The default in Next.js is the opposite of the default in a Vite SPA. In a Vite app, everything runs in the browser unless you build a separate backend. In Next.js, everything runs on the server unless you explicitly opt into client-side behaviour with `'use client'`.

---

## 4. Data Fetching in Server Components

**Read (15 min)**

- [Next.js Docs: Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data): Read the "Server Components" section, in particular "With the fetch API". You do not need the Streaming or Client Components sections for this lesson.

**Key ideas:**

- A Server Component can be declared as `async` and use `await fetch(...)` directly in the function body. No `useEffect`, no `useState`, no loading flag.
- The `fetch` call runs on the server. The browser never sees the request, it only receives the rendered HTML with the data already present.
- Client-side fetching (with `useEffect`) is still valid in Client Components when you need to fetch data in response to user interaction after the initial render.

**Quick check:** Can you explain to a colleague why there is no `useState` or `useEffect` in a Next.js Server Component that fetches and displays a list of customers?

---

## 5. The Link Component and Navigation

**Read (10 min)**

- [Next.js Docs: Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating): Read the "How navigation works" section, in particular "Prefetching" and "Client-side transitions".

**Key ideas:**

- `<Link href="/customers">` from `next/link` enables client-side navigation, the browser does not reload when the user clicks.
- Next.js automatically prefetches the target page when a `<Link>` becomes visible in the viewport. Navigation often feels instant because the data is already cached before the user clicks.
- Use `<Link>` for all internal navigation in a Next.js app. Use a plain `<a>` tag only for external links.

---

## 6. Image Optimization and Metadata

**Read (10 min)**

- [Next.js Docs: `next/image`](https://nextjs.org/docs/app/api-reference/components/image): Skim the introduction and the "Required Props" section (`src`, `alt`, `width`, `height`, or `fill`).

**Key ideas:**

- A plain `<img>` tag has no reserved space until the image loads, which causes a layout shift as surrounding content jumps once the image appears. `next/image` requires `width` and `height` (or `fill`) up front, so the browser reserves the correct space immediately.
- `next/image` also lazy-loads images below the fold by default. The `priority` prop opts an image out of that for above-the-fold content, such as a hero image, so it loads immediately instead.
- Every page can export a `metadata` object (`title`, `description`) that Next.js renders into the page's `<head>` on the server. A page-level `metadata` export overrides the layout's default, field by field.

**Key idea to take away:** Both features exist for the same underlying reason: content that is correct and complete on the very first server-rendered response, without waiting for client-side JavaScript, is what actually moves Core Web Vitals (LCP, CLS) and search engine indexing. This is the concrete, measurable version of the "server rendering helps SEO" claim from section 1.

---

## 7. Middleware

**Read (15 min)**

> **A note on the docs site:** The live Next.js documentation site only publishes the current release (16.x at the time of writing) and no longer keeps a 15.x version online. In 16.x, `middleware.js` has been renamed to `proxy.js` and is described there as deprecated, with a recommendation to avoid it "unless no other options exist." This course targets Next.js 15.x, where `middleware.js` is the standard, recommended way to gate a route, not a deprecated one. Rather than read the 16.x page against that grain, use the summary below and the worked example in `lesson.md` Part 5 as your reference for this topic.

**Key ideas (from this course's Next.js 15.x, no external reading required):**

- A single `middleware.js` file at the project root runs on the server before a matched route is allowed to render.
- The `config.matcher` export decides which paths trigger it, for example every route under `/crm`.
- Middleware can read cookies from the incoming request and issue a redirect, which is how a route is gated behind a login check without every page having to check auth itself.
- This replaces the client-side pattern from the Vite CRM, where a `ProtectedRoute` component checked `AuthContext` in the browser and redirected. Middleware runs on the server, before any page component executes.

**Quick check:** In the Vite CRM, `ProtectedRoute` ran in the browser after the page had already started rendering. Where does the equivalent check happen in a Next.js app, and why is that a meaningful difference?

---

## 8. Server Actions

**Read (15 min)**

> **A note on the docs site:** As with Middleware above, the live Next.js docs only publish the current release. The [`use server` reference page](https://nextjs.org/docs/app/api-reference/directives/use-server) is a reasonable skim for the shape of the directive (read the introduction and the "Using `use server` at the top of a file" example only), but its inline-action example reads `params.id` directly, which is 16.x syntax; this course's Next.js 15.x requires `await params` first, exactly as `lesson.md` Part 5 and the self-study section demonstrate. Treat `lesson.md` as the authoritative reference for the exact syntax, and the docs page only as background on the general idea of the directive.

**Key ideas (from this course's Next.js 15.x):**

- A function marked with `'use server'` is a Server Action: it always runs on the server, even when called from a `<form action={...}>` in a Client Component.
- Passing a Server Action to a form's `action` prop lets the form submit and mutate data without the learner writing a client-side `fetch` call or an API route by hand.
- Because a Server Action runs on the server, it is a trustworthy place to validate input, the same way a schema-based validator like Yup would, since it cannot be bypassed by disabling JavaScript in the browser.
- Server Actions are not limited to login. The same convention is used any time a form needs to create, update, or delete data, for example adding a new customer.

**Key idea to take away:** A Server Action and Middleware solve two different halves of the same problem. Middleware checks whether a request is allowed to reach a page at all. A Server Action is what runs once a user, already past that check, submits a form.

---

## Reflection (5 min)

Before the lesson, write down answers to these four questions:

1. What is one concrete advantage of rendering a page on the server rather than in the browser?
2. A component needs `useState` to track a search query. Should it be a Server Component or a Client Component? What determines the answer?
3. Where does Middleware run relative to a page component, and what is one thing it is well suited to check before that page renders?
4. What is one thing you are still unclear about after the pre-reading?

Bring question 4 to class.
