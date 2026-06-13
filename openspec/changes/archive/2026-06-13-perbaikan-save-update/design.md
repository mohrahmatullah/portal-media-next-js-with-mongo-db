## Context

The app uses Prisma 5.22 with the `mongodb` provider. Prisma's MongoDB connector compiles every `update`/`updateMany` (and the `@updatedAt`/`$set` machinery behind upserts) into the **aggregation‑pipeline update** form, where the wire command's `update.updates.u` is an **array** of pipeline stages. MongoDB only accepts an array `u` starting in **4.2**; on 4.0.x the server expects `u` to be an object and returns `Error code 14 (TypeMismatch)`.

The currently running server is `C:\laragon\bin\mongodb\mongodb-4.0.3\mongod.exe` (two instances observed), and `.env` points `DATABASE_URL` to `mongodb://127.0.0.1:27018/portal_media?replicaSet=rs0`. Even though that is a replica set, **4.0.3 is below the 4.2 floor**, so updates fail. The README already documents this limitation; this change makes the environment compliant and makes the failure mode self‑explanatory.

Constraint: there is **no Prisma‑side switch** to avoid pipeline updates on v5, so a code workaround at the query layer is not viable — the fix is the database version + a guard.

## Goals / Non-Goals

**Goals:**
- Make create/update/upsert succeed by running against MongoDB **4.2+** as a replica set.
- Fail fast with an actionable message when the database is non‑compliant, instead of leaking the raw `TypeMismatch` from deep in a request/seed.
- Give developers a documented, reproducible path to a local 4.2+ replica set.

**Non-Goals:**
- No changes to the Prisma schema, models, or query/server‑action code.
- No automatic download/installation of MongoDB binaries from the app (the helper assumes a 4.2+ `mongod` is available on PATH or via a provided path).
- No production deployment/hosting decisions beyond stating Atlas is an acceptable target.

## Decisions

**1. Require MongoDB 4.2+ replica set; drop 4.0.x.**
Rationale: it is the root cause and the only reliable fix. Alternatives considered:
- *Downgrade Prisma to avoid pipeline updates* — rejected: no released Prisma version supports MongoDB 4.0 for updates; 4.2 is Prisma's documented minimum.
- *Raw `$runCommandRaw` updates with object `u`* — rejected: would mean re‑implementing every write by hand, losing Prisma typing/validation, and is unmaintainable.

**2. Recommend MongoDB Atlas free tier OR a local single‑node replica set.**
Atlas is already a 4.2+ replica set and needs only a `DATABASE_URL` swap — the lowest‑effort path. For fully local/offline dev, document a single‑node `rs0` started from a 4.2+ `mongod` (Laragon's 4.0.3 stays installed but unused for this project).

**3. Add a TypeScript preflight (`src/lib/db-preflight.ts`) run before `dev` and `db:seed`.**
It calls `db.runCommand({ buildInfo: 1 })` (or `serverStatus`) and `replSetGetStatus` via Prisma's `$runCommandRaw` (or a thin Mongo connection), parses `versionArray`, asserts `major>4 || (major===4 && minor>=2)`, and asserts a replica‑set primary exists. On failure it prints remediation and exits non‑zero.
- Wire it as a `predev`/`db:seed` step in `package.json` (e.g. `predev` script, and prepend to the seed command) so it runs without changing app runtime hot paths.
- Rationale: turns a confusing mid‑operation error into a single clear gate. Alternative — checking only at first failed query — rejected: too late and too cryptic.

**4. Provide a helper + README steps for the local replica set.**
A small script (e.g. `scripts/mongo-dev.ps1` / documented `mongod --replSet rs0 ... && rs.initiate(...)`) so a fresh machine reaches a working `rs0`. Keep it documentation‑first; the script is a convenience.

**5. Update `.env`, `.env.example`, `README.md`.**
Point `DATABASE_URL` at a 4.2+ replica set, and make the version requirement and setup steps unambiguous and copy‑pasteable.

## Risks / Trade-offs

- **Developer must install/run a newer MongoDB** → Mitigation: document Atlas as a zero‑install option and provide the local helper; keep ports configurable.
- **Preflight adds startup latency / could false‑positive offline** → Mitigation: short connection timeout, clear "server not started" message, and the check is cheap (single admin command).
- **Two stray 4.0.3 `mongod` processes are running** → Mitigation: setup docs note stopping/ignoring Laragon's bundled mongod and pointing `DATABASE_URL` at the new instance/port to avoid confusion.
- **Atlas requires network access** → Mitigation: local replica set remains the offline path.

## Migration Plan

1. Stand up MongoDB 4.2+ (Atlas cluster or local `rs0` single‑node replica set).
2. Update `DATABASE_URL` in `.env` to the new deployment.
3. Run `npx prisma db push` then `npm run db:seed` against the new database.
4. Verify an update path (e.g. publish toggle) succeeds — no `TypeMismatch`.
5. Rollback: revert `DATABASE_URL`; note that updates remain broken on 4.0.x (rollback only restores read/insert behavior).

## Open Questions

- Keep `27018` as the dev port, or move to `27017`? (Cosmetic; default to documenting `27017` for a fresh 4.2+ instance and leaving `27018` as an example.)
- Preflight implemented purely via Prisma `$runCommandRaw`, or a lightweight direct driver connection? (Lean Prisma‑only to avoid adding a dependency.)
