## Why

Every create/update against MongoDB currently fails with:

```
Raw query failed. Code: `unknown`.
Message: Kind: Command failed: Error code 14 (TypeMismatch):
BSON field 'update.updates.u' is the wrong type 'array', expected type 'object'
```

Prisma 5's MongoDB connector always emits `update` operations in **aggregation‑pipeline form** (the `u` field is an array of pipeline stages, used to apply `@updatedAt` and `$set` semantics). That form is only valid on **MongoDB 4.2+**. The running server is the Laragon‑bundled **MongoDB 4.0.3**, which expects `u` to be an object and rejects the pipeline array — so reads/inserts may pass but **every update, publish‑toggle, moderation, role change, and seed upsert fails**. This is an environment/runtime mismatch, not an application bug: no Prisma‑side flag avoids pipeline updates on v5.

## What Changes

- Replace the runtime database with **MongoDB 4.2+ running as a replica set** (local single‑node replica set or MongoDB Atlas) so Prisma pipeline updates are accepted.
- Add a **database preflight check** (run on dev/seed startup) that connects, verifies server version ≥ 4.2 and that a replica set primary is reachable, and **fails fast with an actionable message** instead of surfacing the cryptic `TypeMismatch` later.
- Provide a **reproducible local setup** (helper script + documented steps) to start a MongoDB 4.2+ single‑node replica set and initiate `rs0`.
- Update `.env`, `.env.example`, and `README.md` so `DATABASE_URL` points to a compliant 4.2+ replica set and the requirement is unambiguous.

## Capabilities

### New Capabilities
- `database-runtime`: Defines the runtime database contract for the app — MongoDB 4.2+ replica set required by Prisma — and a startup preflight that validates version + replica‑set state and fails fast with remediation guidance before any query runs.

### Modified Capabilities
<!-- None: no existing spec's requirements change; data-seeding behavior is unaffected beyond benefiting from the preflight. -->

## Impact

- **Environment/runtime**: requires MongoDB 4.2+ (Atlas or local replica set); MongoDB 4.0.x is no longer supported. Operational, **BREAKING** for anyone still on 4.0.x.
- **Config**: `.env`, `.env.example` (`DATABASE_URL`), `README.md` Requirements/Setup sections.
- **Code**: new preflight module under `src/lib/` (e.g. `src/lib/db-preflight.ts`) and a `scripts/`/`prisma` hook to run it before `dev`/`db:seed`; no schema or query changes.
- **Dependencies**: no new packages required (uses existing Prisma client / `$runCommandRaw`).
