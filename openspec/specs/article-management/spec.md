# article-management Specification

## Purpose

Enable authorized dashboard users to author, publish, and organize articles including media, categories, tags, and frontend display controls.

## Requirements

### Requirement: Article Authoring
The system SHALL allow authorized dashboard users to create and edit articles with a title, slug, cover image, related images, body content, excerpt, category, and tags.

#### Scenario: Create a draft article
- **WHEN** an authorized user saves a new article
- **THEN** the system stores the article with status `draft` and a unique slug
- **AND** the article does not appear on the public frontend

#### Scenario: Edit an existing article
- **WHEN** an authorized user updates an article's fields
- **THEN** the system persists the changes and records the updated timestamp

### Requirement: Publish Workflow
The system SHALL support a draft/publish workflow controlling whether an article is visible on the public frontend.

#### Scenario: Publishing an article
- **WHEN** an authorized user publishes a draft article
- **THEN** the system sets its status to `published` and records the publish date
- **AND** the article becomes visible on the public frontend

#### Scenario: Unpublishing an article
- **WHEN** an authorized user reverts a published article to draft
- **THEN** the article is removed from public listings and its detail page returns 404

### Requirement: Optional Article Video
The system SHALL allow authorized users to optionally associate a single video with an article (via an embed/URL such as YouTube/Vimeo, or an uploaded video file). The video is NOT required to save or publish an article.

#### Scenario: Adding a video to an article
- **WHEN** an authorized user provides a valid video for an article
- **THEN** the system stores the video reference with the article
- **AND** the video is displayed on the public article detail page

#### Scenario: Publishing without a video
- **WHEN** an authorized user saves or publishes an article with no video
- **THEN** the system accepts it without requiring a video

#### Scenario: Invalid video reference
- **WHEN** an authorized user provides an unsupported or malformed video URL/file
- **THEN** the system rejects the video and reports the reason without blocking the rest of the article

### Requirement: Required Article Cover Image
The system SHALL require every article to have a cover image before it can be published.

#### Scenario: Publishing without a cover image
- **WHEN** an authorized user attempts to publish an article that has no cover image
- **THEN** the system blocks publishing and reports that a cover image is required

#### Scenario: Publishing with a cover image
- **WHEN** an authorized user publishes an article that has a valid cover image
- **THEN** the system publishes the article and the cover image is shown on listings and the detail page

### Requirement: Article Related Images
The system SHALL allow authorized users to attach one or more related images (a gallery) to an article, each with optional caption and alt text.

#### Scenario: Adding related images
- **WHEN** an authorized user adds related images to an article
- **THEN** the system stores the ordered list of related images with their captions and alt text
- **AND** the related images are displayed on the public article detail page

#### Scenario: Removing a related image
- **WHEN** an authorized user removes a related image from an article
- **THEN** the system updates the article so that image no longer appears on the frontend

### Requirement: Categories and Tags
The system SHALL allow managing categories and tags and assigning them to articles. Every category SHALL have an image.

#### Scenario: Managing categories
- **WHEN** an authorized user creates, renames, or deletes a category
- **THEN** the change is reflected in article assignment options and frontend category pages

#### Scenario: Category requires an image
- **WHEN** an authorized user creates or saves a category without an image
- **THEN** the system blocks the save and reports that a category image is required

#### Scenario: Category image on the frontend
- **WHEN** a visitor views category navigation or a category page
- **THEN** the category's image is displayed

### Requirement: Frontend Display Control
The system SHALL allow authorized users to control how articles appear on the frontend, including marking an article as the headline or as featured.

#### Scenario: Setting a headline
- **WHEN** an authorized user marks a published article as the headline
- **THEN** the public homepage displays that article in the headline position
- **AND** any previously set headline is unset
