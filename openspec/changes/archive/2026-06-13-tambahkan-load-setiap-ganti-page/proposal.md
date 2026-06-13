## Why

When navigating between pages, the site currently shows no visual feedback while the next route's server data is fetched. On slower connections this looks frozen and unprofessional. Adding a consistent loading indicator and smooth transition on every page change gives users immediate feedback and a polished, modern feel across both the public site and the admin dashboard.

## What Changes

- Add a global **top progress bar** that appears on every client-side navigation (link clicks, browser back/forward) and completes when the new page is ready — visible on all pages.
- Add **route-segment loading states** (`loading.tsx`) so each page shows a branded skeleton/spinner instantly while its server component streams in, instead of a blank or frozen screen.
- Apply this to **all route groups**: public frontend (`(public)`), admin dashboard (`dashboard/(panel)`), and auth pages (`(auth)`).
- Add a subtle **page fade-in transition** so newly loaded content eases in rather than popping, reinforcing the professional feel.
- Keep indicators lightweight and accessible (respect `prefers-reduced-motion`, no layout shift).

## Capabilities

### New Capabilities
- `page-transitions`: Cross-cutting navigation feedback — a global top progress bar, per-segment loading skeletons, and a content fade-in transition shown consistently on every page change throughout the site.

### Modified Capabilities
<!-- No existing spec requirements change; this is purely additive UX feedback. -->

## Impact

- **Dependencies**: One small client-side progress library (e.g. `nprogress` or an equivalent) or a hand-rolled hook using `next/navigation`.
- **Code**:
  - `src/app/layout.tsx` — mount the global progress bar provider.
  - New `loading.tsx` files in each route segment under `src/app/(public)`, `src/app/dashboard/(panel)`, and `src/app/(auth)`.
  - New client component(s) under `src/components/` for the progress bar and transition wrapper.
  - `src/app/globals.css` — progress bar + fade-in styles, `prefers-reduced-motion` handling.
- **No** changes to data fetching, routing structure, APIs, or auth behavior — purely presentational.
