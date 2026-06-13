# database-runtime Specification

## Purpose

Defines the database runtime requirements for the application: which MongoDB deployment topology and version are supported, the startup preflight check that enforces them, and a reproducible local setup so a fresh environment can reach a working state from the README alone.

## Requirements

### Requirement: MongoDB 4.2+ replica set required

The application SHALL run against a MongoDB deployment that is version **4.2 or higher** and configured as a **replica set**. MongoDB 4.0.x and standalone (non‑replica‑set) deployments SHALL NOT be considered supported, because Prisma's MongoDB connector emits `update` operations as aggregation pipelines (`update.updates.u` as an array) which are only valid on MongoDB 4.2+ replica sets.

#### Scenario: Update succeeds on a compliant server

- **WHEN** the app performs a Prisma `update`/`updateMany` (e.g. publish toggle, edit article, moderate comment, change role, or a seed upsert) against a MongoDB 4.2+ replica set
- **THEN** the write completes successfully and no `TypeMismatch` / `update.updates.u` error is raised

#### Scenario: The documented connection string targets a replica set

- **WHEN** a developer reads `.env.example` / `README.md` and configures `DATABASE_URL`
- **THEN** the value points to a MongoDB 4.2+ deployment and includes a `replicaSet` parameter (local replica set or MongoDB Atlas)

### Requirement: Startup database preflight check

The system SHALL provide a preflight check that runs before the development server and before seeding. The preflight SHALL connect to the configured database, determine the server version and replica‑set state, and:

- pass silently when the server is MongoDB **4.2+** and a replica‑set primary is reachable; and
- abort with a **non‑zero exit / clear failure** carrying an actionable remediation message when the server is unreachable, below 4.2, or not a replica set.

The remediation message SHALL name the detected condition (e.g. version, standalone vs replica set) and point to the README database‑setup section.

#### Scenario: Preflight passes on a compliant deployment

- **WHEN** the preflight runs and the server reports version ≥ 4.2 with a reachable replica‑set primary
- **THEN** the preflight exits successfully and startup/seeding continues

#### Scenario: Preflight blocks an outdated server

- **WHEN** the preflight runs against MongoDB 4.0.x (or any version < 4.2)
- **THEN** the preflight fails fast before any application query and prints a message stating the detected version is too old and that MongoDB 4.2+ is required, referencing the README setup steps

#### Scenario: Preflight blocks a standalone server

- **WHEN** the preflight runs against a server that is not part of a replica set
- **THEN** the preflight fails fast with a message stating that a replica set is required and how to initiate one

#### Scenario: Preflight reports an unreachable server

- **WHEN** the configured `DATABASE_URL` cannot be reached within a short timeout
- **THEN** the preflight fails fast with a connection error that names the host/port and the likely cause (server not started)

### Requirement: Reproducible local replica set setup

The project SHALL document and provide a helper to start a local MongoDB 4.2+ single‑node replica set for development, including initiating the `rs0` replica set, so a fresh environment can reach a working state from the README alone.

#### Scenario: Following the README yields a working database

- **WHEN** a developer follows the README database‑setup steps (or runs the provided helper) on a machine with MongoDB 4.2+ installed
- **THEN** a single‑node replica set `rs0` is running and reachable at the `DATABASE_URL`, and the preflight check passes
