# seo-management Specification

## Purpose

Allow authorized users to configure site-wide SEO defaults and per-article overrides, and generate sitemap/robots reflecting indexing settings.

## Requirements

### Requirement: Site-Wide SEO Defaults
The system SHALL allow authorized dashboard users to configure site-wide SEO defaults including default meta title template, meta description, site name, and default Open Graph image.

#### Scenario: Configuring site defaults
- **WHEN** an authorized user saves site-wide SEO settings
- **THEN** the system applies those defaults to pages that do not override them

### Requirement: Per-Article SEO Overrides
The system SHALL allow authorized users to set per-article SEO fields including meta title, meta description, canonical URL, and Open Graph image, overriding site defaults.

#### Scenario: Article with custom SEO
- **WHEN** an article defines custom SEO fields
- **THEN** the public article page renders those values in its meta and Open Graph tags instead of the defaults

#### Scenario: Article without custom SEO
- **WHEN** an article has no custom SEO fields
- **THEN** the system derives meta tags from the article content and site defaults

### Requirement: Sitemap and Robots
The system SHALL generate a sitemap of published content and serve a robots directive reflecting indexing settings.

#### Scenario: Sitemap reflects published articles
- **WHEN** the sitemap is requested
- **THEN** it includes published articles and managed static pages and excludes drafts

#### Scenario: Robots respects indexing setting
- **WHEN** site indexing is disabled in settings
- **THEN** the robots response instructs crawlers not to index the site
