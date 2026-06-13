## Context

This is the initial build of a media/news portal. The platform serves two distinct audiences from a single Next.js monolith: the public reading audience (browse, read, comment) and the editorial team (publish content, configure SEO, manage static pages, and monitor analytics). The required stack is fixed: **Next.js (App Router) monolith, Prisma ORM with MongoDB, and Redis**. A hard requirement is that reader login and dashboard login are separate routes with independent sessions.

There is no existing codebase or specs — this change establishes all foundational capabilities (`public-frontend`, `reader-auth`, `admin-auth`, `article-management`, `comments`, `seo-management`, `static-pages`, `admin-analytics`).

## Goals / Non-Goals

**Goals:**
- A single Next.js monolith hosting public site, dashboard, and API (route handlers).
- Cleanly separated route groups: public site, reader auth, and dashboard (separate login + middleware-protected).
- Two independent authentication contexts (reader vs admin/editor) backed by distinct sessions.
- Prisma data model on MongoDB covering users, articles, categories, tags, comments, static pages, SEO settings, and visit aggregates.
- Redis for session storage, caching of hot public queries, and fast visitor counters.
- A professional, modern, fully responsive frontend.
- A dashboard with charts for posting activity, users, visitors, and article volume.

**Non-Goals:**
- Multi-tenant or multi-publication support.
- Real-time/live features (websockets, live comment streaming).
- Native mobile apps.
- Advanced editorial features beyond draft/publish (e.g. revision history, multi-step approval workflows) — may come later.
- Paid subscriptions / paywall.

## Decisions

### Single Next.js App Router monolith with route groups
Use App Router route groups to separate concerns within one app:
- `(public)` — homepage, category, article detail, static pages, search.
- `(auth)` — reader `/login`, `/register`.
- `dashboard/` — dashboard with its own `dashboard/login` and protected sub-routes.
- `app/api/...` (or route handlers within groups) — API endpoints and sitemap/robots.

Rationale: the requirement is explicitly a monolith; route groups give clear separation and per-group layouts/middleware without separate deployments. *Alternative considered:* separate apps for site and dashboard — rejected as it contradicts the monolith requirement and adds deployment overhead.

### Two independent auth contexts via separate session cookies
Reader and admin sessions use **distinct, namespaced session cookies** (e.g. `reader_session` vs `admin_session`) stored server-side in Redis. Middleware enforces that dashboard routes require a valid admin session and that the reader cookie never authorizes dashboard access (and vice versa).

Rationale: directly satisfies "login user dan login dashboard route-nya berbeda" with strong isolation — a compromised or present reader session cannot reach the dashboard. *Alternative considered:* a single session with a role flag — rejected because it blurs the separation the user explicitly required and risks privilege confusion.

### Auth implementation
Use a session-based approach with credentials (email + password hashed with bcrypt/argon2), sessions persisted in Redis with an opaque cookie. Auth.js (NextAuth) may be used with a Credentials provider and separate configurations per context, or a lightweight custom session layer. Middleware (`middleware.ts`) gates `dashboard/*`.

Roles form a single enum on `User.role`:
| Role | Context | Permissions |
|------|---------|-------------|
| `superadmin` | Dashboard | Full access — users/roles, content, SEO, settings; only role that can manage other `superadmin`s |
| `admin` | Dashboard | Manage content, comments, static pages, users; cannot manage `superadmin` accounts |
| `publisher` | Dashboard | Author/edit/publish articles, moderate comments; no user management or SEO settings |
| `seo` | Dashboard | Manage site-wide & per-article SEO, sitemap/robots; no user management or publishing |
| `user` | Frontend | Public reader who can comment; no dashboard access |

Dashboard login accepts only the four dashboard roles; the public login accepts only `user`. Authorization is enforced both in middleware (context gate) and per-action in dashboard route handlers (role gate).

Rationale: server-side sessions in Redis make logout/invalidation immediate and keep the two contexts cleanly separable. *Alternative considered:* stateless JWT — rejected because immediate invalidation and clean dual-context separation are simpler with server-side sessions.

### Data layer: Prisma + MongoDB
Prisma with the MongoDB provider. Core models:
- `User` (email, passwordHash, displayName, **photoUrl**, role, timestamps)
- `Article` (title, slug unique, excerpt, body, **coverImage (required for publish)**, **relatedImages: [{ url, caption, alt, order }]**, **video?: { type [embed|upload], url, provider? } (optional)**, status [draft|published], publishedAt, authorId, categoryId, tagIds, isHeadline, isFeatured, SEO override fields)
- `Category` (name, slug, **image (required)**)
- `Image`/media reference (url, alt, width, height, contentType) — embedded or referenced as needed
- `Tag` (name, slug)
- `Comment` (articleId, userId, body, status [visible|hidden], createdAt)
- `StaticPage` (title, slug, body, status, SEO fields)
- `SeoSettings` (singleton: site name, default title template, default description, default OG image, indexingEnabled)
- `VisitAggregate` (date/bucket, pageType, count) for persisted analytics

Indexes on `Article.slug`, `Article.status + publishedAt`, `Category.slug`, `StaticPage.slug`, `Comment.articleId`.

Rationale: stack is mandated. Headline/featured flags on `Article` drive frontend display control. *Alternative considered:* storing only the headline as a settings reference — using a boolean flag with a "single headline" invariant enforced at write time is simpler to query.

### Redis usage
Three roles: (1) session store, (2) cache for hot public reads (homepage composition, article detail, category listings) with explicit invalidation on publish/edit, (3) visitor counters — increment fast counters per page load, periodically flush aggregates into `VisitAggregate` for historical charts.

Rationale: stack is mandated; this keeps the public site fast under read-heavy traffic and makes visitor counting cheap and non-blocking. *Alternative considered:* counting visits directly in MongoDB on every request — rejected as it adds write load on the hot path.

### Frontend & styling
Server Components for content pages (SEO + performance), Client Components for interactive pieces (comment form, dashboard charts, search box). Tailwind CSS for the responsive design system; `next/image` for optimized responsive images; mobile-first breakpoints.

Rationale: aligns with App Router strengths and the "professional, modern, responsive" requirement. *Alternative considered:* a component-library-first approach — Tailwind gives more design control for a custom, modern look.

### Charts
A React charting library (e.g. Recharts) rendered in client components fed by dashboard analytics API endpoints that read from `VisitAggregate` and aggregate Prisma queries.

Rationale: Recharts integrates cleanly with React/Next and covers time-series and categorical charts needed (posting activity, users, visitors, article volume).

### SEO
Per-page metadata via Next.js Metadata API, merging per-article/page overrides over `SeoSettings` defaults. Dynamic `sitemap.xml` and `robots` route handlers driven by published content and the indexing flag.

### Images & media handling
A shared upload endpoint accepts images (validated by content type and size), stores them, and returns stable URLs reused by article cover/related images, category images, and author photos. All images carry alt text for accessibility, and the frontend renders them via `next/image` for responsive, optimized delivery. Required-image rules are enforced on write: an article cannot be published without a cover image, and a category cannot be saved without an image. `relatedImages` is an ordered list with per-image caption and alt text.

Storage resolves the earlier open question: default to an external object store / CDN (e.g. S3-compatible bucket) for uploads, with a local `public/uploads` fallback for development. Author photos make article authorship visible on the frontend byline.

Video is **optional** per article and is stored as a small reference object: either an embed/URL (YouTube/Vimeo — preferred, no storage cost, rendered via a provider embed) or an uploaded file URL (served from the same object store/CDN and played with the native `<video>` element). The video URL/embed is validated against an allowlist of providers/formats on save; an invalid video is rejected without blocking the rest of the article.

Rationale: most newsrooms paste a hosting-provider link, so an embed-first approach keeps storage and bandwidth low while still allowing direct uploads when needed. *Alternative considered:* requiring uploads only — rejected as costlier and less convenient than embeds.

Rationale: a single media path keeps validation/optimization consistent across all four image use-cases and avoids per-feature upload code. *Alternative considered:* storing image binaries in MongoDB/GridFS — rejected for cost and CDN-delivery reasons; URLs to an object store are simpler and faster to serve.

### Seeding
A Prisma seed script (`prisma/seed.ts`, wired to `prisma db seed`) creates: one dashboard account per dashboard role (`superadmin`, `admin`, `publisher`, `seo`), a set of sample `user` accounts for the frontend, and the default `SeoSettings` singleton. Passwords are hashed at seed time; default credentials are read from environment variables with safe fallbacks for local dev. The seeder is **idempotent** — it upserts by email so re-running never creates duplicates.

Rationale: lets both login flows (dashboard and frontend) and the comment flow be exercised immediately after setup, and gives every role a ready test account. *Alternative considered:* manual account creation via a setup wizard — rejected as slower for development and not reproducible across environments.

## Risks / Trade-offs

- **Session/cookie isolation bugs could let a reader reach the dashboard** → Enforce context in middleware AND in each dashboard route handler (defense in depth); use distinct cookie names and validate session role server-side.
- **Cache staleness on the public site after publish/edit** → Invalidate/evict affected Redis keys on every article/static-page mutation; keep TTLs modest as a backstop.
- **MongoDB + Prisma relation constraints are weaker than SQL** → Enforce invariants (unique slug, single headline, referential cleanup of comments) in application/service code and with unique indexes.
- **Visitor counting can be inflated by bots** → Treat counts as approximate; optionally filter known bots and dedupe by session within a window when flushing aggregates.
- **Redis unavailability** → Sessions and counters degrade; design caching as best-effort (fall back to DB reads) and surface auth errors gracefully if the session store is down.
- **Scope is large for an initial build** → tasks.md sequences foundation (infra, data, auth) before features so the project can be built and validated incrementally.
- **Seeded default credentials are a security risk if they reach production** → Source seed passwords from env vars, document them as dev-only, and require rotation/disable before production launch; never commit real secrets.
- **Image uploads are an abuse/security surface** → Validate content type and size server-side, constrain accepted formats, generate safe stored filenames, and serve from an isolated bucket/CDN origin.
- **Required-image rules could block legitimate drafts** → Enforce the cover-image requirement only at publish time (drafts may be incomplete); enforce the category-image requirement at save.

## Migration Plan

Greenfield — no data migration. Deploy order: provision MongoDB and Redis → set environment variables (including seed-account credentials) → `prisma generate` and push schema → run the idempotent seeder (dashboard accounts per role, sample `user` accounts, default `SeoSettings`) → deploy the app. Rotate or disable seeded default credentials before/at production launch. Rollback is redeploying the previous build; since this is the initial release there is no prior data state to preserve.

## Open Questions

- Auth: adopt Auth.js (NextAuth) Credentials provider with two configs, or a lightweight custom Redis session layer? (Both satisfy the separation requirement; pick during implementation.)
- Rich text: which editor for article/static-page body (e.g. TipTap vs Markdown)? Default assumption: a rich-text editor storing HTML/JSON.
- Image storage: **resolved** — external object store/CDN by default, with a local `public/uploads` fallback for development (see *Images & media handling*). Remaining detail: which specific provider/bucket per environment.
