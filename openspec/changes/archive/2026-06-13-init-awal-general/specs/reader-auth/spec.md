## ADDED Requirements

### Requirement: Reader Registration
The system SHALL allow visitors to create a reader account using email and password on the public user route, distinct from the dashboard route.

#### Scenario: Successful registration
- **WHEN** a visitor submits a valid email, password, and display name on `/register`
- **THEN** the system creates an account with the `user` role and stores the password as a secure hash
- **AND** the reader is authenticated and redirected back to the public site

#### Scenario: Duplicate email
- **WHEN** a visitor registers with an email that already exists
- **THEN** the system rejects the registration with a validation error and does not create a duplicate account

### Requirement: Reader Login on Dedicated Route
The system SHALL authenticate readers through a dedicated public login route (e.g. `/login`) that is separate from the dashboard login route.

#### Scenario: Successful reader login
- **WHEN** a reader submits valid credentials on `/login`
- **THEN** the system establishes a reader session and redirects to the public site
- **AND** the reader session does NOT grant access to the dashboard

#### Scenario: Invalid credentials
- **WHEN** a reader submits an incorrect email or password
- **THEN** the system rejects the login and shows an error without revealing which field was wrong

### Requirement: Reader Session and Logout
The system SHALL maintain reader sessions and allow readers to log out.

#### Scenario: Logout
- **WHEN** an authenticated reader logs out
- **THEN** the system invalidates the reader session and subsequent requests are treated as anonymous

#### Scenario: Reader cannot reach dashboard
- **WHEN** an authenticated reader requests any dashboard route
- **THEN** the system denies access and redirects to the dashboard login route
