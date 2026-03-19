# Landing Page Design

## Overview

This document defines a proper homepage for SoundLog2 that balances two goals:

1. convert artists into signups
2. help fans and curious visitors immediately understand what a SoundLog page feels like

The page should feel like a modern product site, not a generic startup template. It should visually connect to the artist page experience already in the app while making the product value obvious within a few seconds.

## Goals

1. Turn `/` into a real marketing landing page instead of a redirect-only entry point
2. Drive artist signups with clear, repeated calls to action
3. Show the fan-facing discovery experience through realistic product previews
4. Match the product's music context without losing product clarity
5. Preserve the existing login flow at `/login`

## Non-Goals

1. Rebuilding the auth flow
2. Reworking dashboard UX
3. Introducing CMS-driven content
4. Adding analytics, testimonials backend, or pricing flows

## User Audiences

### Artists
- arrive looking for a simple way to present their music, links, releases, and identity in one place
- need immediate evidence that the tool is easy and looks good
- should see a clear signup path above the fold and near the end of the page

### Fans / Industry / Curious Visitors
- arrive through direct traffic, shared links, or product exploration
- need to understand what an artist page contains and why it is better than a generic link list
- should be able to view a live example page without signing up

## Experience Principles

1. **Lead with product clarity** — explain what SoundLog does in one glance
2. **Use believable product previews** — show real-looking artist page modules instead of abstract blobs
3. **Keep the page conversion-oriented** — each section should support either signup confidence or product understanding
4. **Stay modern and premium** — crisp layout, restrained color system, strong spacing, editorial-quality imagery
5. **Reflect the product honestly** — avoid promising features the app does not support yet

## Information Architecture

The landing page should be a single scrollable homepage with this sequence.

### 0. Page Chrome

Purpose: give the page stable navigation and a clear frame.

Content:
- simple header with product mark / name
- primary actions in header:
  - `View a live example`
  - `Create your page`
- for authenticated users, include a visible `Go to dashboard` path
- lightweight footer with product positioning, example link, login/signup link, and basic trust/privacy surface

Mobile behavior:
- header actions may collapse into one primary CTA plus one secondary text link
- footer should stay compact and readable, not become a sitemap dump

### 1. Hero

Purpose: quickly explain the product and offer immediate action.

Content:
- headline focused on artist value
- short supporting copy tying artist control to fan discovery
- primary CTA: `Create your page`
- secondary CTA: `See what fans see`
- right-side or below-fold visual preview showing a polished artist profile layout

Expected message:
"SoundLog gives artists one polished page for releases, socials, shows, and fan conversion."

Dual-audience requirement:
- the hero must explicitly support both audiences
- artist path = make your page
- visitor path = experience an artist page the way a fan would

### 2. Product Proof Strip

Purpose: create quick credibility without needing a long paragraph.

Content:
- 3 concise proof points or capability statements
- examples:
  - `One page for every release link`
  - `Built for discovery, not just redirects`
  - `Update your page without a developer`

### 3. Feature Pillars

Purpose: explain why the product is useful.

Content:
- 3 feature cards with strong labels and brief descriptions
- recommended pillars:
  - unified artist profile
  - release and content discovery
  - fast editing and updates

Boundary:
- this section is artist-benefit-first
- it should not duplicate the walkthrough details from later sections
- each card should feel product-specific, not like generic SaaS marketing

### 4. Fan Experience Walkthrough

Purpose: make the public page experience tangible.

Content:
- a section that visually breaks down what fans see on an artist page
- modules can include:
  - artist hero
  - featured release
  - more releases
  - socials
  - newsletter or conversion block

Boundary:
- this section is fan-experience-first
- it should visually borrow from the current `[slug]` page modules, not restate feature-card marketing copy
- it should reinforce that SoundLog is not just a bio-link list

### 5. Example Artist Preview

Purpose: create a bridge from marketing page to actual product usage.

Content:
- a focused preview panel or mock browser frame
- CTA to open a live example route
- preview should borrow structure from the current `[slug]` artist page design so the experience feels real

Example route rules:
- use one canonical sample artist slug as the primary live example target
- keep a fallback slug or fallback destination if the canonical example is unavailable
- if no stable public example exists yet, route the CTA to a curated placeholder state that does not 404
- the spec assumes product-owned seeded content, not user-generated content chosen at runtime

Link behavior:
- default behavior should be same-tab navigation to keep the product flow cohesive
- opening in a new tab is not the default

### 6. Closing CTA

Purpose: convert interested artists after they understand the product.

Content:
- strong signup prompt
- short reassurance copy
- primary CTA: `Create your page`
- secondary CTA: `Explore an example`

## Content Strategy

### Messaging

Tone: modern product clarity with light music-world personality.

Copy should be:
- short
- specific
- artist-focused
- free of startup cliches like "revolutionize your presence"

Recommended voice characteristics:
- confident
- clean
- direct
- music-aware, but not overly slangy or underground

### CTA Strategy

Use repeated but intentional CTAs:
- hero primary CTA
- mid-page example CTA
- final CTA block

CTA destination defaults:
- `Create your page` → `/login`
- `See what fans see` / `Explore an example` → a known public artist route when available

If there is no stable public artist route yet, use a curated public fallback route or temporary seeded example page.

Login alignment rule:
- landing-page copy should promise the same outcome the login page supports today
- it must not imply pricing plans, team workflows, analytics dashboards, or publishing mechanics that are not present in the current auth/product flow

## Visual Direction

### Overall Style

The page should feel:
- modern
- clean
- product-led
- premium rather than loud

Avoid:
- generic gradient-only SaaS look
- monochrome sterility
- overly dark, moody music-brand aesthetic unless already established elsewhere
- giant blocks of centered marketing text with no product evidence

### Recommended Design Characteristics

- strong typographic hierarchy
- layered neutral background with subtle texture or depth
- restrained accent color(s) tied to the product and music context
- preview cards with depth and polish
- subtle entrance motion or staggered reveal, only where it supports hierarchy

### Responsiveness

The layout must work on:
- desktop with a strong side-by-side hero
- tablet with stacked sections and preserved preview emphasis
- mobile with fast readability, prominent CTA access, and compact product previews

## Routing and Behavior

### `/`
- becomes the landing page
- no longer acts as a simple redirect shell

### `/login`
- remains the authentication page
- is the main signup entry from landing-page CTAs

Authenticated user behavior:
- authenticated users may still access `/login`, but the preferred UX is to redirect them to `/dashboard`
- landing page CTA copy and login-page messaging should stay aligned so users do not feel they entered a different product

### Authenticated Users
- authenticated users may still see the landing page at `/`
- optionally show a lightweight `Go to dashboard` path in the header or hero area
- do not force a redirect away from `/` unless product requirements change later

## Components and Boundaries

The implementation should favor focused landing-page-specific components instead of one oversized page file.

Recommended component split:
- `LandingHero`
- `LandingProofStrip`
- `LandingFeatureGrid`
- `LandingFanWalkthrough`
- `LandingExamplePreview`
- `LandingFinalCta`

Each component should have one purpose and accept simple props if needed.

## Data and Content Sourcing

For the first implementation:
- content can be static in-page or component-local constants
- preview content can be mocked, but it should visually match real product structures
- if a stable example artist exists, prefer linking to that route instead of a purely fake preview

Do not add a CMS or remote content dependency for this first version.

## Error Handling and Edge Cases

1. If there is no sample artist route available, the example CTA should gracefully fall back to a public, non-broken placeholder or seeded example route.
2. If the user is authenticated, CTAs can remain visible, but at least one path to `/dashboard` should be present.
3. The page should not depend on client-only auth to render core content.
4. Motion should degrade cleanly for reduced-motion users.
5. If the example artist route exists but returns incomplete data, the landing page preview should still look polished and the CTA should avoid sending users into a broken state.
6. Header and footer navigation should remain useful on mobile without hiding the primary conversion path.

## Testing Strategy

### Unit / Component Tests
- render tests for the new landing page sections
- CTA destination assertions
- conditional rendering for authenticated vs unauthenticated states if included

### Integration Checks
- `/` renders the landing page content
- `/login` still renders the login page
- public example CTA resolves correctly
- authenticated and unauthenticated header states render the correct primary paths

### Visual / UX Verification
- mobile and desktop layout review
- spacing and hierarchy review
- verify the page does not resemble the Nuxt starter or generic placeholder content
- verify artist CTA and fan CTA are both visible and understandable above the fold
- verify the live-example path feels like a real product journey rather than a dead-end demo

## Success Criteria

1. Visiting `/` shows a polished landing page, not a redirect-only shell
2. The landing page clearly communicates artist signup value and fan discovery value
3. Artists have a clear path to `/login`
4. Visitors have a clear path to a live example artist page
5. The visual design feels modern and product-quality
6. The page is responsive and production-ready

## Frontend Build Brief

When implementation starts, use the `frontend-design` skill for the actual page build.

### Required visual inheritance
- borrow visual cues from `app/pages/[slug].vue` and its related artist components
- make the landing page feel connected to the real product, especially in preview areas
- use realistic artist-page modules rather than abstract dashboard blocks

### Anti-generic constraints
- avoid generic SaaS gradient blobs and empty floating cards
- avoid default-looking startup hero patterns with vague copy and no product proof
- avoid a monochrome layout that strips all music personality from the page
- avoid making the page feel more like a dashboard than a public-facing product story

### Required quality bar
- strong desktop hero composition
- mobile layout that preserves both CTAs clearly
- one clear fan-discovery path that feels co-equal to artist signup
- accessible semantic heading structure
- meaningful page title and meta description
- reduced-motion-safe animation behavior

### Verification checklist for implementation
1. `/` looks like a real landing page, not a placeholder
2. the first screen explains the product and offers both audience paths
3. the example preview visually resembles the actual artist experience
4. the page is visually polished on desktop and mobile
5. the page does not regress `/login` or public artist routes
