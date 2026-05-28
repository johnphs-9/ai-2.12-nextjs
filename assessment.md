# Assessment / Quiz

## Overview

- **Lesson:** Introduction to Next.js I / 2.12
- **Format:** 10 questions (mix MCQ / True-False)
- **Time:** ~10–15 minutes
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
