# data-seeding Specification

## Purpose

Provide idempotent seed routines that create dashboard accounts, sample frontend users, and default SEO settings, plus a documented command to run them.

## Requirements

### Requirement: Dashboard Account Seeder
The system SHALL provide a seed routine that creates one dashboard account for each dashboard role (`superadmin`, `admin`, `publisher`, `seo`) with securely hashed passwords sourced from configuration/environment.

#### Scenario: Seeding dashboard accounts
- **WHEN** the dashboard seeder runs against an empty database
- **THEN** the system creates exactly one account for each of `superadmin`, `admin`, `publisher`, and `seo`
- **AND** each account's password is stored as a secure hash
- **AND** each seeded account can log in via the dashboard login route with its assigned role

#### Scenario: Seeder is idempotent
- **WHEN** the dashboard seeder runs again on a database that already contains the seeded accounts
- **THEN** the system does not create duplicate accounts and leaves existing accounts intact

### Requirement: Frontend User Seeder
The system SHALL provide a seed routine that creates sample frontend accounts with the `user` role for exercising the public login and commenting flows.

#### Scenario: Seeding frontend users
- **WHEN** the frontend-user seeder runs against an empty database
- **THEN** the system creates one or more accounts with the `user` role and securely hashed passwords
- **AND** each seeded `user` account can log in via the public login route and post comments

#### Scenario: Frontend seeded user has no dashboard access
- **WHEN** a seeded `user` account attempts to access the dashboard
- **THEN** the system denies access

### Requirement: Seed Execution
The system SHALL expose a documented command to run the seeders (e.g. an npm/prisma seed script) and SHALL ensure default `SeoSettings` exist after seeding.

#### Scenario: Running the seed command
- **WHEN** a developer runs the documented seed command
- **THEN** the dashboard accounts, frontend `user` accounts, and default `SeoSettings` are present in the database
