# Portal Media

A media/news portal built as a **Next.js (App Router) monolith** with **Prisma + MongoDB** and **Redis**. It has a professional, responsive public frontend with reader accounts and comments, plus a role-based editorial dashboard for publishing, SEO, static pages, and analytics.

## Features

- **Public frontend**: responsive homepage (headline/featured/latest), article detail, category pages with pagination, search, static pages.
- **Two separate logins / sessions**:
  - Readers → `/login`, `/register` (role `user`, can comment).
  - Dashboard → `/dashboard/login` (roles `superadmin`, `admin`, `publisher`, `seo`).
  - Namespaced cookies (`reader_session` / `admin_session`); a reader cookie can never reach the dashboard and vice-versa.
- **Role matrix** (`src/lib/auth/rbac.ts`): superadmin (everything), admin (content + users, not superadmins), publisher (articles + comments), seo (SEO + pages), user (comment only).
- **Articles**: draft/publish workflow, categories & tags, headline/featured control, **required cover image (at publish)**, **related-images gallery**, and an **optional video** (YouTube/Vimeo embed or `.mp4/.webm`).
- **Images**: shared upload endpoint (`/api/upload`) with validation; stored under `public/uploads` in dev (swap for an object store/CDN in prod).
- **Comments**: authenticated readers only; dashboard moderation (hide/show/delete).
- **SEO**: site-wide defaults + per-article/page overrides, dynamic `sitemap.xml` and `robots`.
- **Analytics**: Redis visit counters flushed into `VisitAggregate`; dashboard charts (Recharts) for posting activity, users by role, visitors, and article volume.
- **Seeders**: idempotent dashboard accounts (one per role), sample readers, categories, articles, and static pages.

## Requirements

- Node.js 18+ (developed on 21)
- **MongoDB 4.2+ running as a replica set** — mandatory. Prisma's MongoDB connector
  sends `update` operations as aggregation pipelines (`update.updates.u` as an array),
  which only MongoDB 4.2+ accepts.
  ⚠️ Laragon's bundled MongoDB **4.0.3 is NOT supported** — reads/inserts may work, but
  every update (publish toggle, edits, moderation, role changes, seed upserts) fails with
  `Error code 14 (TypeMismatch): BSON field 'update.updates.u' is the wrong type 'array'`.
  Use MongoDB 4.2+ (MongoDB Atlas or a local replica set). `npm run db:check` verifies
  this before `dev`/`seed` and fails fast with guidance if the server is non-compliant.
- Redis (optional in dev — the app degrades to an in-memory fallback if unreachable).

## Setup

```bash
npm install
cp .env.example .env   # then edit values
npx prisma db push     # create collections + indexes
npm run db:seed        # seed accounts + demo content (idempotent)
npm run dev            # http://localhost:3000
```

### Database setup (MongoDB 4.2+ replica set)

You need MongoDB **4.2+** as a replica set. Pick one:

**Option A — MongoDB Atlas (zero install, recommended).** Create a free cluster
(already a 4.2+ replica set), then set:

```
DATABASE_URL="mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/portal_media?retryWrites=true&w=majority"
```

**Option B — Docker single-node replica set (auth).** Replica set + auth needs a
keyfile for internal auth; generate it inside a Docker volume (avoids Windows
bind-mount permission issues):

```powershell
docker volume create mongodb_key
docker run --rm -v mongodb_key:/key mongo:latest bash -c "openssl rand -base64 756 > /key/keyfile && chmod 400 /key/keyfile && chown 999:999 /key/keyfile"
docker run -d --name mongodb -p 27017:27017 `
  -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=secret `
  -v mongodb_data:/data/db -v mongodb_key:/key:ro `
  mongo:latest --replSet rs0 --keyFile /key/keyfile --auth
docker exec mongodb mongosh -u admin -p secret --authenticationDatabase admin --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})"
```

Then set:

```
DATABASE_URL="mongodb://admin:secret@127.0.0.1:27017/portal_media?replicaSet=rs0&authSource=admin"
```

(For a no-auth dev container, drop the `-e MONGO_INITDB_*`, `--keyFile`, and `--auth`
flags and the keyfile volume, and use a credential-less `DATABASE_URL`.)

**Option C — Local single-node replica set.** Use a MongoDB 4.2+ install (NOT
Laragon's bundled 4.0.3):

```bash
mongod --replSet rs0 --dbpath <data-dir> --port 27017
mongosh --port 27017 --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})"
```

Or use the helper (starts mongod + initiates `rs0`; point it at a 4.2+ install):

```powershell
.\scripts\mongo-dev.ps1 -MongodPath "C:\path\to\mongodb-6.0\bin\mongod.exe"
# options: -Port 27017  -DbPath .\.mongo-data  -ReplSet rs0  -ShellPath <mongosh|mongo>
```

Then set `DATABASE_URL="mongodb://127.0.0.1:27017/portal_media?replicaSet=rs0"`.

### Database preflight (`npm run db:check`)

`db:check` runs automatically before `npm run dev` (via `predev`) and before
`npm run db:seed`. It connects and verifies the server is **MongoDB ≥ 4.2** and a
**replica set with a reachable primary**, then exits silently on success. On failure
it aborts with an actionable message — for example:

- *too old* → "MongoDB ... is version 4.0.3, but >= 4.2 is required."
- *standalone* → "MongoDB ... is a standalone server (not a replica set)."
- *unreachable* → "Could not reach MongoDB at host:port ..." (server not started)

Each message points back to this Database-setup section. Run it manually anytime with
`npm run db:check`.

## Seeded credentials (DEV ONLY — rotate/disable before production)

| Role | Email | Password |
|------|-------|----------|
| superadmin | superadmin@portal.test | superadmin123 |
| admin | admin@portal.test | admin123 |
| publisher | publisher@portal.test | publisher123 |
| seo | seo@portal.test | seo123 |
| user (reader) | reader@portal.test | reader123 |

## Key paths

```
prisma/schema.prisma        Data model (User, Article, Category, Tag, Comment, StaticPage, SeoSettings, VisitAggregate)
prisma/seed.ts              Idempotent seeder
middleware.ts               Edge gate for /dashboard
src/lib/auth/               Sessions (Redis), password hashing, RBAC, context guards
src/lib/actions/            Server actions (articles, categories, comments, seo, pages, users, profile)
src/lib/{redis,cache,analytics,media,video,seo,slug,queries}.ts
src/app/(public)/           Public site (home, berita/[slug], kategori/[slug], cari, [slug] static)
src/app/(auth)/             Reader login/register
src/app/dashboard/          Dashboard login + (panel)/ protected pages
src/app/api/                upload, reader logout, analytics (+ flush)
src/components/              public/ and dashboard/ UI (incl. Recharts charts)
```

## Analytics flush

Visit counters live in Redis and are flushed into `VisitAggregate` by hitting
`/api/analytics/flush` (wire this to a cron/scheduled job in production).

## Notes / known limitations

- Article and static-page bodies are stored/rendered as HTML (the editor is a textarea); a WYSIWYG editor can be dropped in later.
- Image uploads use the local filesystem in dev; point `src/lib/media.ts` at an object store/CDN for production.
- Update/delete operations require MongoDB 4.2+ (see Requirements).
