# comments Specification

## Purpose

Allow authenticated readers to comment on published articles, display approved comments, and let dashboard users moderate them.

## Requirements

### Requirement: Authenticated Reader Comments
The system SHALL allow only authenticated readers to post comments on published articles.

#### Scenario: Reader posts a comment
- **WHEN** an authenticated reader submits a comment on a published article
- **THEN** the system stores the comment associated with the reader and the article
- **AND** the comment becomes visible according to the moderation policy

#### Scenario: Anonymous visitor cannot comment
- **WHEN** an unauthenticated visitor attempts to submit a comment
- **THEN** the system rejects the submission and prompts the visitor to log in

### Requirement: Comment Display
The system SHALL display approved comments on the article detail page in chronological order with the author's display name and timestamp.

#### Scenario: Viewing comments
- **WHEN** a visitor opens a published article
- **THEN** the system displays the article's approved comments

### Requirement: Comment Moderation
The system SHALL allow authorized dashboard users to moderate comments, including approving, hiding, or deleting them.

#### Scenario: Hiding a comment
- **WHEN** an authorized dashboard user hides or deletes a comment
- **THEN** the comment is no longer displayed on the public frontend
