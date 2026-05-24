# 2.12 Introduction to Next.js I

## Lesson Overview

This lesson introduces Next.js by rebuilding the CRM inside a new Next.js project. Learners start with `create-next-app`, tour the App Router file conventions, and progressively add routes, a shared layout, and route-level loading and error files. The second half focuses on data fetching: learners replace the `useEffect`-based pattern from the Vite CRM with `async` Server Components that fetch data on the server. The lesson closes by introducing Client Components through a search box, demonstrating the recommended pattern of keeping data fetching on the server and extracting only interactive UI into client-side code.

## Dependencies

- [Lesson](./lesson.md)
- [Assessment](./assessment.md)

## Lesson Objectives

- Explain the difference between a React SPA rendered in the browser and a Next.js application that renders on the server
- Build a multi-page Next.js application using the App Router file conventions
- Distinguish between Server Components and Client Components and apply the correct pattern for data fetching and interactivity

## Lesson Plan

| Duration  | What                                              | How or Why                                                                                                                                                          |
| --------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10 min    | Warm up and recap                                 | Recap Lesson 2.11: MockAPI.io, Yup validation, Netlify deployment; surface the SPA limitation — every page starts from an empty HTML shell                          |
| 8 min     | What is Next.js and why it exists                 | Slides: the SPA rendering model vs server rendering; performance and SEO benefits; ASCII diagram comparing the two request flows                                     |
| 6 min     | App Router file conventions                       | Slides: `app/` directory; `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`; routing comparison table vs React Router                                            |
| 7 min     | Server vs Client Components                       | Slides: the capability table; default is server; `'use client'` declares a Client Component; data fetching before-and-after comparison                              |
| 4 min     | What is not covered today                         | Slides: Server Actions, caching, Middleware, TypeScript, Vercel deployment — deferred to Lesson 2.13                                                                |
| 5 min     | Break                                             |                                                                                                                                                                     |
| 15 min    | Code-along: scaffold and tour                     | `npx create-next-app@latest crm-next`; walk through generated files; replace home page; observe hot reload                                                          |
| 35 min    | Code-along: routes, layout, error handling        | Create `/customers` route; `NavBar` with Link comparison; root `layout.tsx`; dynamic `[id]` route; `loading.tsx` and `error.tsx` with side-by-side Vite contrast    |
| 5 min     | Break                                             |                                                                                                                                                                     |
| 30 min    | Code-along: Server Component data fetching        | `.env.local` setup; `async` customer list page; observe missing Network request in DevTools; `async` customer detail page; throttle network to observe loading state |
| 15 min    | Activity: fetch interactions with Promise.all     | Learners update the detail page to fetch and display interactions in parallel; debrief covers `Promise.all` and the "no useEffect" observation                       |
| 25 min    | Code-along: Client Component search box           | `CustomerSearch.tsx` with `'use client'`; update `page.tsx` to pass data as props; walk through the server/client boundary; common mistake slide                    |
| 15 min    | Wrap up and Q&A                                   | Summary table; exit ticket questions; preview Lesson 2.13 — TypeScript and Vercel deployment                                                                        |
| **Total** |                                                   | **~180 min**                                                                                                                                                        |
