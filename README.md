# 2.12 Introduction to Next.js

## Lesson Overview

This lesson introduces Next.js by rebuilding the CRM inside a new Next.js project. Learners start with `create-next-app` and build a public marketing homepage that demonstrates SSR's SEO and performance advantages over the Vite CRM, including per-page `metadata`, `next/image`, and a Lighthouse comparison, then confirm that adding a real interactive Client Component does not undo those wins. From there, learners tour the App Router file conventions and progressively add routes, a shared layout, and route-level loading and error files. The middle of the lesson focuses on data fetching: learners replace the `useEffect`-based pattern from the Vite CRM with `async` Server Components that fetch data on the server, then extract an interactive search box into a Client Component. The lesson closes with an instructor-led demo of Middleware gating a route behind a simulated login, and Server Actions for form submission and mutation.

## Dependencies

- [Lesson](./lesson.md)
- [Assignment](./assignment.md)
- [Pre-reading](./studies.md)

## Lesson Objectives

- Explain the difference between a React SPA rendered in the browser and a Next.js application that renders on the server
- Build a multi-page Next.js application using the App Router's file-based routing conventions, including dynamic segments, shared layouts, and route-level loading and error states
- Distinguish between Server Components and Client Components and apply the correct pattern for data fetching and interactivity
- Describe how Middleware can gate access to a route before a page ever renders
- Use a Server Action to submit a form and mutate data without writing a client-side `fetch` call

## Lesson Plan

| Duration | What | How or Why |
| --- | --- | --- |
| 10 min | Warm up and recap | Recap Lesson 2.11; surface the SPA limitation, every page starts from an empty HTML shell |
| ~35 min | Lecture (slides) | SSR vs CSR and hydration; App Router special files (`page.js`, `layout.js`, `loading.js`, `error.js`); Server vs Client Components; SEO via SSR, `next/image`, and per-page `metadata`; Middleware and Server Actions previewed |
| 5 min | Break | |
| 30 min | Code-along: Part 1, bootstrap and homepage | `create-next-app`; build a public marketing homepage; diagnose a plain `<img>`, compare against the Vite CRM with Lighthouse (LCP, CLS), fix with `next/image`; per-page `metadata`; add a Client Component stepper and confirm interactivity does not cost the SSR win |
| 40 min | Code-along: Part 2, routes and layout | `/customers` route; `NavBar` with Link comparison; root `layout.js`; dynamic `[id]` route; `loading.js` and `error.js` |
| 5 min | Break | |
| 30 min | Code-along: Part 3, Server Component data fetching | `async` customer list and detail pages fetching from a local json-server; observe the missing Network request in DevTools; throttled loading state. The interactions activity (`Promise.all`) is optional/take-home. |
| 25 min | Code-along: Part 4, Client Components | `CustomerSearch` with `'use client'`; Server Component fetches, Client Component handles interaction; common mistake |
| 16 min | Instructor demo: Part 5, Middleware | Login Server Action sets a cookie; `middleware.js` gates `/customers` before any page renders. Built live by the instructor; learners replicate afterward at their own pace. |
| 15 min | Wrap up and Q&A | Summary table; preview what's next |
| **Total** | | **~3 hours**, including lecture; "Mutating Data with a Server Action" and "Route Handlers" are self-study and do not count against lab time |

See the instructor timing note at the top of `lesson.md` for the release valve if a session runs behind.
