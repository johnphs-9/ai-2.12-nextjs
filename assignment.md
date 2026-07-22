# Optional Assignment: Event Feedback Board

## Overview

- **Lesson:** Introduction to Next.js / 2.12
- **Type:** Optional Take-Home Assignment
- **Estimated Time:** 2 to 3 hours
- **Submission:** GitHub repository link (or ZIP file)

## Learning Objectives Covered

This assignment reinforces:

- Creating routes and shared layouts with the App Router's file-based conventions
- Fetching data inside an `async` Server Component
- Using route-level `loading.js` and `error.js` files instead of manual loading and error state
- Splitting a page into a Server Component that fetches data and a Client Component that adds interactivity

## Assignment Description

Build an **Event Feedback Board**: a small app where visitors can browse a list of talks from a conference, open a detail page for each talk, and filter the talk list by track. Data comes from a local json-server instance, the same tool used in the lesson.

This project is intentionally separate from the CRM so you can apply the Server Component and routing patterns to a different domain without copying the lab code directly.

### What You Will Build

A multi-page Next.js application that:

- Lists all talks at `/talks`, fetched from json-server inside a Server Component
- Shows a talk detail page at `/talks/:id` using a dynamic route segment
- Shows a loading spinner while each page's data is being fetched
- Shows an error page with a retry button if json-server is unreachable
- Lets a visitor filter the talk list by track using a Client Component, without a new network request

## Requirements

### Core Requirements

#### 1. Project Setup

- [ ] Scaffold the project: `npx create-next-app@15 feedback-board`, answering the prompts the same way as the lesson (No TypeScript, Yes ESLint, No Tailwind, No `src/` directory, Yes App Router, Yes Turbopack, No import alias)
- [ ] Install json-server as a dev dependency: `npm install --save-dev json-server`
- [ ] No other data-fetching or state-management libraries; use plain `fetch` and `useState`, the same as the lesson

#### 2. Mock Data

Create `data/db.json` with the following shape:

```json
{
  "talks": [
    { "id": "1", "title": "Server Components in Practice", "speaker": "Mei Ling", "track": "Frontend", "abstract": "A tour of what changes when data fetching moves to the server." },
    { "id": "2", "title": "Designing REST APIs That Last", "speaker": "Arjun Patel", "track": "Backend", "abstract": "Lessons from ten years of versioning APIs without breaking clients." },
    { "id": "3", "title": "State Management Without the Ceremony", "speaker": "Farah Osman", "track": "Frontend", "abstract": "When Context is enough, and when it is not." },
    { "id": "4", "title": "Zero-Downtime Database Migrations", "speaker": "Wei Jie Tan", "track": "Backend", "abstract": "A practical checklist for changing schema under live traffic." },
    { "id": "5", "title": "Accessible by Default", "speaker": "Priya Nair", "track": "Design", "abstract": "Building components that pass an audit without a separate accessibility pass." },
    { "id": "6", "title": "Design Tokens Across Platforms", "speaker": "Daniel Goh", "track": "Design", "abstract": "Keeping a single source of truth for colour and spacing across web and mobile." }
  ]
}
```

Add a `server` script alongside `dev` in `package.json`, the same as the lesson:

```json
"scripts": {
  "dev": "next dev",
  "server": "json-server --watch data/db.json --port 3001",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

#### 3. Environment Variable

- [ ] Create `.env.local` with `API_BASE_URL=http://localhost:3001`, no `NEXT_PUBLIC_` prefix, since every `fetch` call runs on the server
- [ ] Add `.env.local` to `.gitignore`

#### 4. Routes to Create

| Path | File | Behaviour |
|------|------|-----------|
| `/` | `app/page.js` | Short homepage with a heading and a link to `/talks` |
| `/talks` | `app/talks/page.js` | Server Component; fetches all talks; renders `TrackFilter` |
| `/talks/:id` | `app/talks/[id]/page.js` | Server Component; fetches one talk by `id` |
| n/a | `app/talks/loading.js` | Shown while `/talks` or `/talks/:id` is fetching |
| n/a | `app/talks/error.js` | Shown if a fetch throws; includes a "Try again" button using `reset` |

`loading.js` and `error.js` placed directly inside `app/talks/` apply to both `/talks` and `/talks/:id`, since the App Router walks up to the nearest ancestor with one; a nested `error.js` under `app/talks/[id]/` is only needed if the two routes should show different error messages, which this assignment does not require.

#### 5. Shared Layout

- [ ] Create `app/talks/layout.js` with a simple header (site title, a link back to `/`) that wraps both `/talks` and `/talks/:id`
- [ ] The root layout (`app/layout.js`) should only set the `metadata` title and description; the talks-specific header belongs in the nested layout, not the root, the same reasoning the lesson used for keeping `CrmLayout` out of `app/layout.js`

#### 6. The Talk List Page

- [ ] `app/talks/page.js` fetches `${process.env.API_BASE_URL}/talks` and passes the array to a Client Component, `TrackFilter`
- [ ] `TrackFilter` (`'use client'`) holds the selected track in `useState`, defaulting to "All"
- [ ] Render a row of buttons or a `<select>` for the distinct tracks found in the data, plus an "All" option
- [ ] Filtering happens against the data already in memory; no new `fetch` call runs when the track changes
- [ ] Each talk in the filtered list links to `/talks/:id`

#### 7. The Talk Detail Page

- [ ] `app/talks/[id]/page.js` reads the `id` from `params` (remember: `params` is a `Promise` in Next.js 15, `await` it)
- [ ] Fetches `${process.env.API_BASE_URL}/talks/${id}` and displays the title, speaker, track, and abstract
- [ ] Includes a link back to `/talks`

#### 8. Loading and Error States

- [ ] `app/talks/loading.js` renders a simple spinner or "Loading talks..." message
- [ ] `app/talks/error.js` is a Client Component (`'use client'`) that receives `error` and `reset` as props, displays `error.message`, and calls `reset` from a button
- [ ] Verify the loading state by throttling the Network tab to "Slow 3G" and reloading `/talks`
- [ ] Verify the error state by stopping json-server, reloading `/talks`, confirming the error page appears, then restarting json-server and clicking "Try again"

### Stretch Goals

- [ ] Add a search input to `TrackFilter` (or a sibling Client Component) that filters by title or speaker name, combined with the track filter
- [ ] Add `app/talks/[id]/loading.js` and give it a different message than `app/talks/loading.js`, to see the App Router pick the more specific one
- [ ] Add a `favouriteCount` field to each talk in `db.json` and a "Most popular" sort option in `TrackFilter`
- [ ] Add `next/image` for a speaker photo on the detail page, supplying `width` and `height`
- [ ] Add page-specific `metadata` (`title`, `description`) to `app/talks/page.js` and `app/talks/[id]/page.js`, generated from the talk's own title

## Deliverables

- GitHub repository link (or ZIP file) submitted to the course platform
- A `README.md` in the project root explaining how to install and run the project locally, including the reminder that `npm run server` and `npm run dev` must both be running at the same time
- Screenshots or a short screen recording demonstrating:
  - The talk list loading from json-server
  - The loading spinner appearing under throttled network conditions
  - The error page appearing when json-server is stopped, and recovering after "Try again"
  - Filtering the talk list by track without a page reload

## AI and Tools

If you use an AI coding assistant:

- Document which parts were AI-assisted in your `README.md`
- Review and understand any generated code before submitting; you may be asked to explain your implementation choices
- Validate the application manually against the requirements checklist above

## Collaboration

Discuss ideas and approaches with classmates, but submit your own implementation, and credit any classmates or external sources whose ideas you used.

## References

- [Next.js: App Router](https://nextjs.org/docs/app)
- [Next.js: Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Next.js: Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [json-server: GitHub](https://github.com/typicode/json-server)
