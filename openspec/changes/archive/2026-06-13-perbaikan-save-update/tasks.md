## 1. Provision a compliant MongoDB 4.2+ replica set

- [x] 1.1 Choose a target: Docker `mongo:8.2` single‑node replica set (auth admin/secret) — chosen over Atlas/local mongod
- [x] 1.2 Install/obtain MongoDB 4.2+ — Docker container `mongodb` running `mongo:8.2.11` (not Laragon's 4.0.3)
- [x] 1.3 Start it as a replica set and initiate `rs0` — recreated container with `--replSet rs0 --keyFile --auth` (keyfile generated in a Docker volume) and ran `rs.initiate(...)`
- [x] 1.4 Confirm the server is reachable and reports version ≥ 4.2 with a replica‑set primary — `rs.status` → `set=rs0 myState=1 (PRIMARY)`, version 8.2.11; `npm run db:check` passes

## 2. Point the app at the new database

- [x] 2.1 Update `DATABASE_URL` in `.env` to the 4.2+ deployment — `mongodb://admin:secret@127.0.0.1:27017/portal_media?replicaSet=rs0&authSource=admin`
- [x] 2.2 Update `.env.example` to show a compliant 4.2+ replica‑set `DATABASE_URL` and remove the 4.0.3/27018 workaround as the default
- [x] 2.3 Run `npx prisma db push` against the new database to create collections + indexes — all 8 collections + indexes created
- [x] 2.4 Run `npm run db:seed` and confirm seed upserts (which use updates) succeed without `TypeMismatch` — seeded accounts/articles; re‑ran to exercise the update branch, succeeded

## 3. Add the database preflight check

- [x] 3.1 Create `src/lib/db-preflight.ts` that connects via Prisma `$runCommandRaw` and reads `buildInfo` (`versionArray`) and `isMaster`/replica‑set state
- [x] 3.2 Assert version ≥ 4.2 and that a replica‑set primary is reachable; on pass, exit 0 silently
- [x] 3.3 On failure, print an actionable message naming the detected condition (too old / standalone / unreachable host:port) and referencing the README setup section, then exit non‑zero
- [x] 3.4 Use a short connection timeout so an unstarted server fails fast rather than hanging
- [x] 3.5 Wire it into `package.json`: add a `predev` script and prepend the preflight to the `db:seed` command so it runs before dev and seeding

## 4. Provide a reproducible local setup helper

- [x] 4.1 Add a helper (e.g. `scripts/mongo-dev.ps1`) that starts a local 4.2+ `rs0` single‑node replica set and initiates it if not already initiated
- [x] 4.2 Make port/dbpath configurable with sensible defaults

## 5. Documentation

- [x] 5.1 Update `README.md` Requirements to state MongoDB 4.2+ replica set is mandatory and 4.0.x is unsupported
- [x] 5.2 Update `README.md` Setup/Database section with the Atlas option and the local replica‑set steps (and the helper)
- [x] 5.3 Document the preflight: what it checks and how to read its failure messages

## 6. Verification

- [x] 6.1 With a compliant server: perform an update and confirm it succeeds — explicit `prisma.article.update` (headline toggle + `@updatedAt`) returned `UPDATE OK -> ekonomi-tumbuh-positif | isHeadline: true => false`
- [x] 6.2 With a non‑compliant server (or stopped server): confirm the preflight blocks startup with the expected actionable message — verified against the running MongoDB 4.0.3: `npm run db:check` exits non‑zero with "version 4.0.3, but >= 4.2 is required"
- [x] 6.3 Confirm no `Error code 14 (TypeMismatch) ... update.updates.u` appears anywhere — db push, seed (×2), and an explicit update all completed without it
