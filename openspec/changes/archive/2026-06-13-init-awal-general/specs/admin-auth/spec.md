## ADDED Requirements

### Requirement: Separate Dashboard Login Route
The system SHALL authenticate editorial/admin users through a dashboard login route (e.g. `/dashboard/login`) that is completely separate from the reader login route and uses an independent session.

#### Scenario: Successful dashboard login
- **WHEN** a user with a dashboard role (`superadmin`, `admin`, `publisher`, or `seo`) submits valid credentials on the dashboard login route
- **THEN** the system establishes a dashboard session and grants access to the dashboard
- **AND** the dashboard session is independent from any frontend `user` session

#### Scenario: Frontend user cannot use dashboard login
- **WHEN** an account with only the `user` role attempts to log in via the dashboard login route
- **THEN** the system denies access

### Requirement: Role-Based Access Control
The system SHALL support the roles `superadmin`, `admin`, `publisher`, `seo`, and `user`, and SHALL restrict dashboard actions according to role:
- `superadmin`: full access, including managing users and roles and all settings.
- `admin`: manage content, comments, static pages, and users; cannot manage `superadmin` accounts.
- `publisher`: create, edit, and publish articles and moderate comments; no access to user management or SEO settings.
- `seo`: manage SEO settings (site-wide and per-article) and sitemap/robots; no access to user management.
- `user`: frontend commenter only; SHALL NOT have any dashboard access.

#### Scenario: Superadmin manages users and roles
- **WHEN** a `superadmin` accesses user management
- **THEN** the system permits viewing and managing user accounts and assigning roles

#### Scenario: Publisher restricted from user management
- **WHEN** a `publisher` attempts to manage users or roles
- **THEN** the system denies the action

#### Scenario: SEO role scoped to SEO settings
- **WHEN** a `seo` user accesses the dashboard
- **THEN** the system permits managing SEO settings
- **AND** denies access to user management and the publish workflow controls

#### Scenario: Admin cannot manage superadmin
- **WHEN** an `admin` attempts to modify or delete a `superadmin` account
- **THEN** the system denies the action

### Requirement: Dashboard User Profile
The system SHALL allow dashboard users to maintain a profile that includes a display name and a profile photo, so that authorship is identifiable on the public frontend. Publisher accounts SHALL have a profile photo.

#### Scenario: Setting a profile photo
- **WHEN** a dashboard user uploads or updates their profile photo
- **THEN** the system stores the photo and uses it as the author photo on articles they authored

#### Scenario: Author photo shown on frontend
- **WHEN** a visitor views an article authored by a dashboard user with a profile photo
- **THEN** the frontend displays that author's photo and name

### Requirement: Dashboard Route Protection
The system SHALL protect all dashboard routes with middleware that requires a valid dashboard session.

#### Scenario: Unauthenticated dashboard access
- **WHEN** an unauthenticated request targets any protected dashboard route
- **THEN** the system redirects to the dashboard login route
