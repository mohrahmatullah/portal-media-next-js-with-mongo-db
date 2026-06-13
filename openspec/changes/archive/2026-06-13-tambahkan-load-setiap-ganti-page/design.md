## Context

The project is a Next.js App Router application (`src/app`) with three route groups:
- `(public)` — public media portal (home, article, category, search, static pages) wrapped by `PublicLayout`.
- `dashboard/(panel)` — admin panel (articles, categories, comments, seo, pages, users, profile) wrapped by `PanelLayout` with a sidebar + header.
- `(auth)` — reader login/register.

Pages are async server components that fetch from Prisma. During navigation Next.js waits for the server component to resolve before swapping content; with no `loading.tsx` and no client navigation indicator, the UI gives no feedback and can appear frozen. Styling uses Tailwind CSS with a `brand` color scale; global styles live in `src/app/globals.css`. The root layout (`src/app/layout.tsx`) is a server component rendering `<html><body>`.

## Goals / Non-Goals

**Goals:**
- Consistent, professional navigation feedback on every page change across all route groups.
- A global top progress bar for client navigations (links + back/forward).
- Instant per-segment loading placeholders via App Router `loading.tsx`.
- Subtle content fade-in, accessible (`prefers-reduced-motion`) and free of layout shift.
- Minimal footprint: presentational only, no changes to data fetching, routing, or auth.

**Non-Goals:**
- No full-screen route transition animations or shared-element/morph transitions.
- No skeleton design system; placeholders are simple and reusable, not pixel-perfect per page.
- No changes to API routes, server actions, or data models.
- No SPA/view-transition rewrite of the navigation model.

## Decisions

### Decision 1: Top progress bar via a client component mounted in the root layout

Use a small client component (e.g. `NavigationProgress`) rendered once in `src/app/layout.tsx`. It listens for navigation using `usePathname()` / `useSearchParams()` from `next/navigation`: when the path/params change, drive a progress bar to completion.

- **Library vs. hand-rolled**: Prefer a lightweight, well-known bar. Options: (a) `nextjs-toploader` (drop-in, App Router aware), (b) `nprogress` wrapped in a small effect, (c) fully hand-rolled CSS bar. **Choose `nextjs-toploader`** as the default — it is purpose-built for App Router, configurable (color, height, shadow), and avoids the known gap where `nprogress` cannot detect navigation start in App Router without patching link clicks. Set its color to the `brand` palette. If adding a dependency is undesirable, fall back to a hand-rolled component using a global click handler on anchors + `pathname` change to finish.
- **Why mount in root layout**: a single instance covers all route groups automatically, satisfying "all pages" without per-group wiring. Root layout is a server component, so the bar must be a `"use client"` component imported into it.

### Decision 2: Per-segment `loading.tsx` for streaming feedback

Add `loading.tsx` files at the route-group/segment level so Next.js shows them via Suspense while server components resolve:
- `src/app/(public)/loading.tsx` — content-area skeleton inside the public shell.
- `src/app/dashboard/(panel)/loading.tsx` — panel content skeleton (sidebar/header stay rendered because they live in the layout).
- `src/app/(auth)/loading.tsx` — simple centered spinner.
- Optionally a few deeper segment-level `loading.tsx` (e.g. `(public)/berita/[slug]`) if the generic one is insufficient; start with group-level files and add more only if needed.

A shared presentational component (`src/components/ui/PageSkeleton.tsx` or `Spinner.tsx`) backs these so the look is consistent and DRY.

- **Why group-level placement**: one file per route group covers all child pages in that group, matching "di semua page" with the fewest files. The dashboard placeholder renders inside `(panel)/layout.tsx`, so the chrome persists — a deliberately better UX than a full-page spinner.

### Decision 3: Fade-in via CSS, scoped and reduced-motion aware

Add a `.page-fade-in` utility (keyframe + animation) in `globals.css` applied to the main content wrapper, gated behind `@media (prefers-reduced-motion: reduce)` to disable animation. Avoid JS-driven transition libraries to keep server components untouched and prevent hydration complexity.

- **Why CSS over a transition library** (e.g. `framer-motion` `AnimatePresence`): App Router server components don't expose an easy exit-animation hook without converting pages to client components. CSS fade-in on mount is zero-dependency, SSR-safe, and sufficient for a professional feel.

## Risks / Trade-offs

- **Progress bar can't always detect true navigation start in App Router** → Using a purpose-built loader (`nextjs-toploader`) that hooks link clicks and history mitigates this; the `loading.tsx` placeholders provide a second, reliable feedback channel even if the bar timing is imperfect.
- **New dependency adds bundle weight** → Chosen library is tiny (~a few KB) and client-only; acceptable. Hand-rolled fallback documented if the team prefers zero deps.
- **Skeletons may briefly flash on very fast navigations** → Keep placeholders minimal and visually calm; rely on the bar for sub-perceptual loads. No artificial delay is added.
- **Layout shift from the fixed progress bar** → Bar is `position: fixed` at top with no document flow impact; verify it overlays rather than pushes content.
- **Fade-in on every render could feel repetitive** → Keep duration short (~150–250ms) and subtle; disabled entirely under reduced-motion.

## Migration Plan

1. Add the progress-bar dependency (or hand-rolled component) and mount it in `src/app/layout.tsx`.
2. Add shared `PageSkeleton`/`Spinner` UI component(s).
3. Add `loading.tsx` to each route group; verify chrome persistence in the dashboard.
4. Add `.page-fade-in` + reduced-motion rules to `globals.css` and apply to content wrappers.
5. Manually verify on public, dashboard, and auth navigations including back/forward.

Rollback: remove the `loading.tsx` files, the bar component import from the root layout, and the CSS — purely additive and presentational, so removal is clean with no data/behavior impact.

## Open Questions

- Use the `nextjs-toploader` dependency or the zero-dependency hand-rolled bar? (Default: `nextjs-toploader`; confirm during apply if the team wants to avoid new deps.)
- Do any specific pages need a custom skeleton beyond the generic group-level placeholder? (Defer; add later if a page looks bare.)
