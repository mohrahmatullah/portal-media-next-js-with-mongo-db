# admin-analytics Specification

## Purpose

Provide editorial/admin users with dashboard analytics covering visitor activity, posting activity, user metrics, and article volume so they can monitor site performance.

## Requirements

### Requirement: Visitor Tracking
The system SHALL record visits to public pages so that visitor counts can be reported, without blocking page rendering.

#### Scenario: Recording a page visit
- **WHEN** a visitor loads a public page
- **THEN** the system increments visit counters (e.g. in Redis) and persists aggregated visit data for reporting

### Requirement: Posting Activity Chart
The system SHALL present a chart of article publishing activity over a selectable time range on the dashboard.

#### Scenario: Viewing posting activity
- **WHEN** an authorized user opens the analytics dashboard
- **THEN** the system displays a time-series chart of articles published per period

### Requirement: User Metrics
The system SHALL display registered user metrics, including total readers and a breakdown by role, on the dashboard.

#### Scenario: Viewing user metrics
- **WHEN** an authorized user opens the analytics dashboard
- **THEN** the system displays the total number of users and a chart or breakdown of users by role

### Requirement: Visitor Metrics
The system SHALL display visitor counts over a selectable time range on the dashboard.

#### Scenario: Viewing visitor counts
- **WHEN** an authorized user opens the analytics dashboard
- **THEN** the system displays a chart of visitor counts over the selected period

### Requirement: Article Volume Metrics
The system SHALL display article volume metrics, including counts by status and by category, on the dashboard.

#### Scenario: Viewing article volume
- **WHEN** an authorized user opens the analytics dashboard
- **THEN** the system displays charts of article counts grouped by status and by category
