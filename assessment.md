# Assessment / Quiz

## Overview

- **Lesson:** Introduction to Next.js I / 2.12
- **Format:** 30 questions (mix MCQ / True-False)
- **Time:** ~30 minutes
- **Scoring:** 1 point each

## Questions

### Q1 (True/False)

In a Vite React SPA, every route renders the same empty `index.html` file and React fills in the content using JavaScript in the browser.

A - True

B - False

---

### Q2

What is the primary reason Next.js was created to extend React?

A - To replace JSX with a different templating language

B - To allow React components to use TypeScript

C - To add a server layer so pages can be rendered before the HTML reaches the browser, improving performance and SEO

D - To provide a built-in CSS-in-JS solution for styling React components

---

### Q3

A developer deploys a standard Vite React app to a hosting platform. A search engine crawler visits the site. What does the crawler see?

A - The fully rendered HTML of every page, including all customer data

B - An empty HTML file with a `<div id="root">` and a JavaScript bundle reference

C - A server-side rendered version of each page

D - A cached version of the page rendered during the build step

---

### Q4

Which file in a Next.js App Router project defines the `/customers` route?

A - `pages/customers.tsx`

B - `app/customers/index.tsx`

C - `app/customers/page.tsx`

D - `routes/customers.tsx`

---

### Q5 (True/False)

In the Next.js App Router, you must register routes in a central `<Routes>` component, similar to React Router.

A - True

B - False

---

### Q6

A developer creates the file `app/customers/[id]/page.tsx`. Which URL pattern does this file handle?

A - `/customers/id` (literal string "id")

B - `/customers/:id` where `:id` is any dynamic segment

C - `/customers?id=value` where `id` is a query parameter

D - `/customers/[id]` (literal string "[id]")

---

### Q7

In Next.js 15, a page component receives `params` as a prop. A developer writes:

```jsx
export default async function CustomerDetailPage({ params }) {
  const id = params.id;
}
```

What is wrong with this code?

A - `params` is not a valid prop name in Next.js 15

B - In Next.js 15, `params` is a `Promise` and must be `await`ed before accessing its properties

C - Dynamic segment values are accessed via `useParams()`, not props

D - Nothing is wrong — this is the correct way to access params

---

### Q8

What does `layout.tsx` do in the Next.js App Router?

A - It defines the CSS layout for all components in the folder

B - It is a wrapper component that renders around every page in the same folder and its subfolders

C - It configures the Next.js build settings for the route

D - It generates static HTML for all pages at build time

---

### Q9 (True/False)

The `loading.tsx` file in a Next.js route folder must be manually imported and rendered inside the `page.tsx` file to take effect.

A - True

B - False

---

### Q10

A developer creates `app/customers/loading.tsx`. When does Next.js display this file's component?

A - Only when the user clicks a button labelled "Loading"

B - Whenever the `CustomersPage` component is awaiting a `fetch` call or other asynchronous operation

C - When the user has a slow internet connection, as detected by the browser

D - Only when `isLoading` state is set to `true` inside `page.tsx`

---

### Q11

Why must `error.tsx` include the `'use client'` directive at the top of the file?

A - Error files are always Client Components because Next.js does not support Server Component errors

B - Error boundaries must be Client Components because they use the `reset` callback, which responds to user interaction

C - `'use client'` is required on all files inside the `app/` directory

D - Without `'use client'`, error messages cannot be displayed in the browser

---

### Q12

In the Vite CRM, error handling in a data-fetching component looked like:

```jsx
const [error, setError] = useState(null);
useEffect(() => {
  fetch('/customers').catch(err => setError(err.message));
}, []);
if (error) return <p>Error: {error}</p>;
```

What is the Next.js App Router equivalent that provides the same protection for the `/customers` route?

A - Add a `try/catch` block inside every Server Component

B - Create `app/customers/error.tsx` — any unhandled error in the route is automatically caught and rendered by this file

C - Wrap every `fetch` call in a `<Suspense>` component with a fallback

D - Add an `onError` prop to the root `layout.tsx` component

---

### Q13

What is a Server Component in Next.js?

A - A component that only runs during the build step and generates static HTML

B - A component that runs on the server, can use `async/await` directly, and sends no JavaScript to the browser

C - A component that connects to a database and manages backend logic

D - A component wrapped with `React.memo` to prevent unnecessary re-renders

---

### Q14 (True/False)

By default, all components inside the `app/` directory in Next.js are Server Components.

A - True

B - False

---

### Q15

A developer wants to add a `useState` hook to a component in the `app/` directory. What must they add to the file?

A - `import { useState } from 'react-server'`

B - `export const runtime = 'client'`

C - `'use client'` as the first line of the file

D - Nothing — `useState` works in any Next.js component by default

---

### Q16

In a Next.js Server Component, a developer writes:

```jsx
export default async function CustomersPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`);
  const customers = await res.json();
  return <ul>{customers.map(c => <li key={c.id}>{c.firstName}</li>)}</ul>;
}
```

Where does the `fetch` call execute?

A - In the user's browser, after the page loads

B - On the Next.js server, before any HTML is sent to the browser

C - In a Web Worker thread in the browser

D - During the build step only, not at request time

---

### Q17

Compared to the Vite CRM's `useEffect`-based data fetching, what does Next.js Server Component data fetching eliminate?

A - The need for the `fetch` API entirely

B - The `useState` loading flag, the `useEffect` hook, and any risk of the fetch request being visible in the browser's Network tab

C - The need to handle errors, because Server Components never fail

D - The need for a MockAPI.io project, because data is stored locally

---

### Q18

In Next.js, what is the difference between a variable named `NEXT_PUBLIC_API_BASE_URL` and one named `API_SECRET_KEY` in `.env.local`?

A - `NEXT_PUBLIC_` variables are accessible in both server and browser code; variables without the prefix are server-only and never reach the browser

B - `NEXT_PUBLIC_` variables are only available during `npm run build`; unprefixed variables are available at runtime

C - There is no difference — all variables in `.env.local` behave identically

D - Unprefixed variables are automatically added to `process.env` on the client; `NEXT_PUBLIC_` variables require explicit configuration

---

### Q19

A developer opens the browser DevTools Network tab after loading a Next.js customer list page. They expect to see a request to `https://mockapi.io/customers` but do not find it. What is the most likely explanation?

A - The page has not finished loading yet

B - The `fetch` call runs on the Next.js server and is not visible in the browser's Network tab

C - The browser is blocking requests to external domains

D - MockAPI.io requires authentication that the browser cannot provide

---

### Q20

What does Next.js `<Link>` do that a plain HTML `<a>` tag does not?

A - `<Link>` applies CSS styles to the anchor element automatically

B - `<Link>` enables client-side navigation and prefetches the target page when the link enters the viewport

C - `<Link>` prevents the browser from following the URL if JavaScript is disabled

D - `<Link>` adds an `aria-label` attribute for accessibility

---

### Q21 (True/False)

When a Next.js `<Link>` scrolls into the user's viewport, the browser immediately makes a full page request to the target URL to prefetch its content.

A - True

B - False

---

### Q22

A developer wants to add a real-time search box to the customer list page. The search box uses `useState` to track the query and filters the list on each keystroke. Where should this component be placed in relation to the `CustomersPage` Server Component?

A - Inline inside `CustomersPage`, after adding `'use client'` to `page.tsx`

B - In a separate file (for example `CustomerSearch.tsx`) with `'use client'` at the top, imported and rendered by `CustomersPage`

C - In `layout.tsx` so it is available on all pages

D - In a separate Next.js API route that handles search queries

---

### Q23

A Server Component (`CustomersPage`) fetches customer data and passes it to a Client Component (`CustomerSearch`) as a prop. What happens to the customer data as it crosses the server/client boundary?

A - It is encrypted using the browser's Web Crypto API

B - It is serialised as JSON and embedded in the HTML sent to the browser, then hydrated as props

C - The Client Component makes a second fetch request to retrieve the same data independently

D - It is stored in a server-side session and fetched by the Client Component on demand

---

### Q24

Which of the following accurately describes the `'use client'` directive in Next.js?

A - It tells Next.js to skip server-side rendering for the entire page

B - It marks a component as a Client Component so it can use React hooks and event handlers; it must appear as the first line of the file

C - It enables client-side routing for all links within the component

D - It is required on every component that imports from `next/link`

---

### Q25 (True/False)

A developer adds `'use client'` to a page component because one interactive element is needed inside it. This is the recommended approach in Next.js.

A - True

B - False

---

### Q26

A developer adds `'use client'` to `app/customers/page.tsx` because `CustomerSearch` is rendered inside it. What is the consequence?

A - Only `CustomerSearch` becomes a Client Component; `CustomersPage` remains a Server Component

B - `CustomersPage` becomes a Client Component, so its `fetch` call now runs in the browser and the fetched data is visible in DevTools

C - The `fetch` call is moved to a background thread and the page renders faster

D - Next.js throws a build error because pages cannot be Client Components

---

### Q27

The `app/components/NavBar.tsx` component contains:

```jsx
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/customers">Customers</Link>
    </nav>
  );
}
```

There is no `'use client'` directive. Is this valid, and why?

A - It is invalid — any component that renders `<Link>` must be a Client Component

B - It is valid — `NavBar` does not use any hooks or event handlers, so it can remain a Server Component

C - It is invalid — `NavBar` must be a Client Component because it is used inside `layout.tsx`

D - It is valid, but Next.js will automatically add `'use client'` at build time

---

### Q28

Which command creates a new Next.js project with the App Router?

A - `npm create vite@latest myapp -- --template next`

B - `npx create-next-app@latest myapp`

C - `npx next init myapp`

D - `npm install next react react-dom`

---

### Q29 (True/False)

`loading.tsx` replaces the manual `if (isLoading) return <p>Loading...</p>` pattern by acting as an automatic Suspense fallback for the entire route segment.

A - True

B - False

---

### Q30

A developer has the following file structure:

```
app/
├── layout.tsx
├── page.tsx
└── customers/
    ├── page.tsx
    ├── loading.tsx
    └── [id]/
        └── page.tsx
```

The user navigates to `/customers/5` and the `fetch` call inside `app/customers/[id]/page.tsx` is slow. Which loading UI appears?

A - The `loading.tsx` from `app/customers/` covers the detail page as well

B - No loading UI appears because there is no `loading.tsx` inside `app/customers/[id]/`

C - The root `layout.tsx` renders a loading state automatically

D - The browser shows its own native loading indicator

---
