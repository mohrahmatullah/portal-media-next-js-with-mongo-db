## 1. Global progress bar

- [x] 1.1 Add the progress-bar dependency (`nextjs-toploader`) to `package.json`, or create a zero-dependency hand-rolled client component as the fallback — chose the **zero-dependency hand-rolled** component (no `npm install` needed)
- [x] 1.2 Create `src/components/ui/NavigationProgress.tsx` (`"use client"`) configured with the `brand` color, sensible height, and no spinner clutter
- [x] 1.3 Mount `NavigationProgress` once in `src/app/layout.tsx` so it covers every route group
- [ ] 1.4 Verify the bar appears on link clicks and on browser back/forward, and completes cleanly on fast navigations — _needs manual in-browser check_

## 2. Shared loading UI

- [x] 2.1 Create a reusable `src/components/ui/Spinner.tsx` (accessible: `role="status"`, screen-reader label)
- [x] 2.2 Create a reusable `src/components/ui/PageSkeleton.tsx` for content-area placeholders

## 3. Per-segment loading states

- [x] 3.1 Add `src/app/(public)/loading.tsx` rendering `PageSkeleton` inside the public shell
- [x] 3.2 Add `src/app/dashboard/(panel)/loading.tsx` rendering a panel skeleton (sidebar + header live in the layout, so they stay visible)
- [x] 3.3 Add `src/app/(auth)/loading.tsx` rendering a centered `Spinner`
- [x] 3.4 Spot-check whether any deep segment (e.g. `(public)/berita/[slug]`) needs a tailored `loading.tsx` — generic group-level skeleton is sufficient; no extra files added

## 4. Content fade-in transition

- [x] 4.1 Add a `.page-fade-in` keyframe + utility class in `src/app/globals.css`
- [x] 4.2 Apply `.page-fade-in` to the main content wrapper in each route group's layout (`(public)`, `dashboard/(panel)`, `(auth)`) — via the `PageTransition` client wrapper (keyed by pathname so it re-triggers per navigation)

## 5. Accessibility & polish

- [x] 5.1 Add a `@media (prefers-reduced-motion: reduce)` block in `globals.css` that disables the fade-in and any non-essential motion
- [x] 5.2 Confirm the fixed progress bar overlays content with no layout shift/reflow — bar is `position: fixed` (out of document flow), so it overlays without reflow

## 6. Verification

- [ ] 6.1 Run the dev server and manually navigate public pages (home → article → category → search) confirming bar + skeleton + fade on each — _needs manual in-browser check_
- [ ] 6.2 Navigate dashboard panel pages confirming chrome persistence and feedback — _needs manual in-browser check_
- [ ] 6.3 Navigate auth pages and back/forward; verify reduced-motion behavior with the OS setting enabled — _needs manual in-browser check_
- [x] 6.4 Run `npm run build` (or lint) to ensure no type/build errors were introduced — ran `tsc --noEmit`; all new files type-check cleanly (one pre-existing unrelated error in `src/lib/db-preflight.ts:89`)
