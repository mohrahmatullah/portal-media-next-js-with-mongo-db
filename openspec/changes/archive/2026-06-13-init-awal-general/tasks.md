## 1. Project Setup & Infrastructure

- [x] 1.1 Initialize Next.js (App Router, TypeScript) monolith project
- [x] 1.2 Add and configure Tailwind CSS with mobile-first breakpoints and base design tokens
- [x] 1.3 Add dependencies: Prisma, MongoDB driver, Redis client, auth library, charting library (Recharts), password hashing
- [x] 1.4 Create `.env`/env config for `DATABASE_URL` (MongoDB), `REDIS_URL`, and auth/session secrets
- [x] 1.5 Set up Redis client module with connection helper and graceful-degradation wrapper
- [x] 1.6 Define route group structure: `(public)`, `(auth)`, `dashboard/`, and API/route handlers

## 2. Data Layer (Prisma + MongoDB)

- [x] 2.1 Define Prisma schema with MongoDB provider
- [x] 2.2 Add `User` model (email, passwordHash, displayName, `photoUrl`, role, timestamps)
- [x] 2.3 Add `Article`, `Category`, `Tag` models with slug uniqueness, status, publishedAt, isHeadline, isFeatured, SEO override fields, `coverImage`, `relatedImages[]` (url/caption/alt/order), and `Category.image`
- [x] 2.4 Add `Comment` model (articleId, userId, body, status, createdAt)
- [x] 2.5 Add `StaticPage` model (title, slug, body, status, SEO fields)
- [x] 2.6 Add `SeoSettings` singleton and `VisitAggregate` model for analytics
- [x] 2.7 Add indexes (article slug, status+publishedAt, category/page slug, comment articleId)
- [x] 2.8 Add `role` enum field to `User` (`superadmin`, `admin`, `publisher`, `seo`, `user`) and run `prisma generate`

## 3. Authentication & Authorization

- [x] 3.1 Implement Redis-backed session store with namespaced cookies (`reader_session`, `admin_session`)
- [x] 3.2 Implement password hashing and verification helpers
- [x] 3.3 Build reader registration (`/register`) creating accounts with `reader` role
- [x] 3.4 Build reader login (`/login`) and logout establishing/invalidating the reader session
- [x] 3.5 Build dashboard login (`/dashboard/login`) with independent admin/editor session
- [x] 3.3a Build frontend user login (`/login`) accepting only the `user` role
- [x] 3.5a Restrict dashboard login to dashboard roles (`superadmin`, `admin`, `publisher`, `seo`); reject `user`
- [x] 3.6 Implement role-permission matrix (superadmin/admin/publisher/seo/user) and reusable `requireRole` guards
- [x] 3.7 Add `middleware.ts` protecting `dashboard/*` and preventing `user` sessions from reaching the dashboard (and vice versa)
- [x] 3.8 Add server-side role/session guards in dashboard route handlers (defense in depth), incl. admin-cannot-manage-superadmin rule

## 4. Media & Image Handling (shared)

- [x] 4.1 Configure image storage (external object store/CDN with local `public/uploads` dev fallback) and env vars
- [x] 4.2 Build shared image upload endpoint with server-side content-type and size validation and safe filename generation
- [x] 4.3 Store image metadata (url, alt, width, height, contentType) for reuse by articles, categories, and profiles
- [x] 4.4 Add a reusable image-picker/uploader UI component for the dashboard
- [x] 4.5 Configure `next/image` for responsive, optimized delivery from the storage origin

## 5. Article Management (Dashboard)

- [x] 5.1 Build article create/edit form (title, slug, cover image, related-images gallery with caption/alt/order, optional video (embed URL or upload), body via rich-text editor, excerpt, category, tags)
- [x] 5.1a Validate optional video on save (provider/format allowlist); accept articles with no video
- [x] 5.2 Implement draft save and unique-slug generation/validation
- [x] 5.3 Implement publish/unpublish workflow setting status and publishedAt; block publish when no cover image
- [x] 5.4 Implement headline/featured controls with single-headline invariant enforced on write
- [x] 5.5 Build category and tag management (create/rename/delete) with assignment to articles; require a category image on save
- [x] 5.6 Add related-images add/remove/reorder management on the article editor
- [x] 5.7 Build dashboard user profile editor (display name + profile photo) for authors/publishers
- [x] 5.8 Invalidate relevant Redis cache keys on article/category mutations

## 6. Public Frontend

- [x] 6.1 Build shared public layout, responsive header/nav with category links, and footer
- [x] 6.2 Build homepage composing headline, featured, and latest published articles (Redis-cached)
- [x] 6.3 Build article detail page (404 for draft/missing) with metadata, author byline (name + photo), related-images gallery, optional responsive video player/embed (only when present), and comment section slot
- [x] 6.4 Display category images in navigation and on category pages
- [x] 6.5 Build category listing pages with pagination
- [x] 6.6 Build search over published articles (title/content)
- [x] 6.7 Apply responsive, accessible, image-optimized styling across public pages

## 7. Comments

- [x] 7.1 Build comment form for authenticated readers on article pages
- [x] 7.2 Implement comment submission API rejecting anonymous users
- [x] 7.3 Render approved comments chronologically with author and timestamp
- [x] 7.4 Build dashboard comment moderation (approve/hide/delete) and reflect on frontend

## 8. SEO Management

- [x] 8.1 Build dashboard form for site-wide SEO defaults (title template, description, site name, OG image, indexing toggle)
- [x] 8.2 Implement per-article and per-static-page SEO override fields in editors
- [x] 8.3 Wire Next.js Metadata API to merge overrides over site defaults
- [x] 8.4 Implement dynamic `sitemap.xml` (published articles + static pages, exclude drafts)
- [x] 8.5 Implement `robots` route honoring the indexing setting

## 9. Static Pages

- [x] 9.1 Build dashboard CRUD for static pages (title, slug, rich body, status)
- [x] 9.2 Render published static pages on the public frontend within the site layout (404 for unpublished/missing)

## 10. Analytics & Visitor Tracking

- [x] 10.1 Implement non-blocking visit recording with Redis counters per public page load
- [x] 10.2 Implement periodic flush of Redis counters into `VisitAggregate`
- [x] 10.3 Build analytics API endpoints (posting activity time-series, user metrics by role, visitor counts, article volume by status/category)
- [x] 10.4 Build dashboard analytics page with charts (Recharts) and selectable time ranges

## 11. Database Seeders

- [x] 11.1 Add seed-credential env vars (per-role dashboard emails/passwords + sample user creds) with safe local-dev fallbacks
- [x] 11.2 Implement dashboard-account seeder creating one account per role (`superadmin`, `admin`, `publisher`, `seo`) with profile photos, passwords hashed, upsert-by-email (idempotent)
- [x] 11.3 Implement frontend-user seeder creating sample `user`-role accounts (idempotent)
- [x] 11.4 Seed sample categories (with images) and articles (with cover + related images) for demo/dev
- [x] 11.5 Ensure default `SeoSettings` singleton is created during seeding
- [x] 11.6 Wire `prisma/seed.ts` to `prisma db seed` and add an npm script to run it
- [x] 11.7 Verify each seeded dashboard role logs in via dashboard login and each `user` logs in via frontend login and can comment

## 12. Finalization

- [x] 12.1 Add user management screen (view users, manage roles) gated to `superadmin`/`admin`
- [x] 12.2 Verify user/dashboard session isolation and per-role permissions end-to-end
- [x] 12.3 Verify responsive behavior across mobile/tablet/desktop and run accessibility checks
- [x] 12.4 Write README/setup docs (MongoDB, Redis, env vars, seed command + seeded credentials, run instructions)
