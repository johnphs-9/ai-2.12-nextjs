# Pre-Reading: Lesson 2.12, Introduction to Next.js I

Timebox **1.5–2 hours** across these resources before the lesson. You do not need to read every linked page in full detail; the goal is to arrive with a mental model of why Next.js exists, how its folder-based routing works, and what it means for a component to run on the server rather than in the browser.

---

## 1. Why Next.js Exists

**Read (10 min)**

- [Next.js Docs: Introduction](https://nextjs.org/docs): Read the short introduction page. Pay attention to the list of built-in features — particularly server-side rendering, static site generation, and the App Router. You do not need to understand all of them yet; the goal is to see the scope of what Next.js adds on top of React.

**Key idea to take away:** React is a UI library that renders in the browser. Next.js is a framework that wraps React and adds a server layer. Pages can be rendered on the server before any HTML reaches the browser, which improves both perceived load time and search engine indexability.

**Quick check:** In a standard Vite React app, what does the browser receive when it requests `https://myapp.com/customers`? What does it receive from a Next.js app serving the same route?

---

## 2. The App Router

**Read (15 min)**

- [Next.js Docs: Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing): Read the "Terminology", "The `app` Directory", and "File Conventions" sections. The key file conventions to understand before the lesson are `page.tsx`, `layout.tsx`, `loading.tsx`, and `error.tsx`.

**Key ideas:**

- Routes come from the folder structure inside `app/`. Creating `app/customers/page.tsx` makes `/customers` a valid route — no configuration required.
- `layout.tsx` wraps every page in the same folder and its subfolders. It is the correct place for a navigation bar.
- `loading.tsx` is shown automatically while a page is waiting for data. It replaces the manual `if (isLoading) return <p>Loading...</p>` pattern.
- Dynamic segments use square brackets: `app/customers/[id]/page.tsx` matches `/customers/1`, `/customers/42`, etc.

**Quick check:** If you wanted a route at `/settings/profile`, what folder structure and filename would you create inside `app/`?

---

## 3. Server Components and Client Components

**Read (20 min)**

- [Next.js Docs: Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components): Read the full page. Focus on the "Benefits of Server Rendering" section and the "Using Server Components in Next.js" section.
- [Next.js Docs: Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components): Read the "Benefits of Client Rendering" section and the "`'use client'` directive" section.

**Key ideas:**

- All components in `app/` are Server Components by default. They run on the server, can `async/await` data directly, and send no JavaScript to the browser.
- Client Components are declared by adding `'use client'` as the first line of the file. They run in the browser and support React hooks and event handlers.
- Server Components cannot hold state or respond to events. Client Components cannot `async/await` at the top level (they must use `useEffect` for data fetching).
- The recommended pattern: Server Component fetches data and passes it as props to a Client Component that handles interactivity.

**Key idea to take away:** The default in Next.js is the opposite of the default in a Vite SPA. In a Vite app, everything runs in the browser unless you build a separate backend. In Next.js, everything runs on the server unless you explicitly opt into client-side behaviour with `'use client'`.

---

## 4. Data Fetching in Server Components

**Read (15 min)**

- [Next.js Docs: Data Fetching — Fetching Data](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching): Read the "Fetching Data on the Server" section and the "Fetching Data on the Client" section. Compare the two approaches.

**Key ideas:**

- A Server Component can be declared as `async` and use `await fetch(...)` directly in the function body. No `useEffect`, no `useState`, no loading flag.
- The `fetch` call runs on the server. The browser never sees the request — it only receives the rendered HTML with the data already present.
- Client-side fetching (with `useEffect`) is still valid in Client Components when you need to fetch data in response to user interaction after the initial render.

**Quick check:** Can you explain to a colleague why there is no `useState` or `useEffect` in a Next.js Server Component that fetches and displays a list of customers?

---

## 5. The Link Component and Navigation

**Read (10 min)**

- [Next.js Docs: Linking and Navigating](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating): Read the "`<Link>` Component" section and the "How Navigation Works" section.

**Key ideas:**

- `<Link href="/customers">` from `next/link` enables client-side navigation — the browser does not reload when the user clicks.
- Next.js automatically prefetches the target page when a `<Link>` becomes visible in the viewport. Navigation often feels instant because the data is already cached before the user clicks.
- Use `<Link>` for all internal navigation in a Next.js app. Use a plain `<a>` tag only for external links.

---

## 6. Environment Variables in Next.js

**Read (10 min)**

- [Next.js Docs: Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables): Read the "Loading Environment Variables", "Bundling Environment Variables for the Browser", and "Default Environment Variables" sections.

**Key ideas:**

- Next.js reads `.env.local`, `.env.development`, and `.env.production` files automatically.
- Variables prefixed with `NEXT_PUBLIC_` are included in the browser bundle and accessible in both Server and Client Components.
- Variables without the prefix are server-only and never reach the browser. This is the correct choice for secrets like private API keys.
- Access variables in code via `process.env.NEXT_PUBLIC_API_BASE_URL`.

**Key idea to take away:** The `NEXT_PUBLIC_` prefix in Next.js serves the same purpose as the `VITE_` prefix in the Vite CRM — it is an explicit opt-in to exposing a variable to the browser. Any variable you do not want in the browser bundle simply omits the prefix.

---

## Reflection (5 min)

Before the lesson, write down answers to these three questions:

1. What is one concrete advantage of rendering a page on the server rather than in the browser?
2. A component needs `useState` to track a search query. Should it be a Server Component or a Client Component? What determines the answer?
3. What is one thing you are still unclear about after the pre-reading?

Bring question 3 to class.
