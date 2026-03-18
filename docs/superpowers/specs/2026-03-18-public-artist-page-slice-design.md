# Public Artist Page Slice - Design Document

**Date:** 2026-03-18
**Version:** 1.0
**Status:** Draft

## 1. Overview

Create a public artist page at `/[slug]` using mock data to validate the release-first layout before wiring real API/database logic.

## 2. Route Definition

- **Route:** `pages/[slug].vue` (note: based on `nuxt.config.ts` root-level setup, app source directory is the project root; the spec uses `app/` prefix for clarity in listing files)
- **Behavior:**
  - Extract `slug` from route params
  - Lookup artist in mock data map
  - If not found: return Nuxt 404
  - If found: render artist page with mock data
  - Page title: `"{Artist Name} - SoundLog"`

## 3. Mock Data Structure

Create `app/mocks/artist-page.ts` containing:

```ts
interface MockArtist {
  slug: string
  name: string
  bio: string
  heroImage: string
  socialLinks: Record<string, string> // facebook, x, instagram, etc.
  featuredRelease: {
    title: string
    date: string
    coverImage: string
    platformLinks: Record<string, string>
  }
  moreReleases: Array<{
    title: string
    date: string
    coverImage: string
    platformLinks: Record<string, string>
  }>
  tourDates?: Array<{
    date: string
    venue: string
    location: string
    ticketLink?: string
  }>
  radioShows?: Array<{
    title: string
    episode: string
    playLink: string
  }>
  newsletterUrl?: string
}
```

## 4. Page Structure

`[slug].vue` orchestrates the following sections. Note: Tour Dates and Radio Shows are rendered only if their data is present (conditional rendering).

1. **Hero Section**
   - Full-width hero image
   - Artist name (large, centered)
   - Tagline: "Your music. One link. Always up to date."
   - Artist bio (text block, displayed below the tagline)

2. **Featured Release**
   - Album artwork (large)
   - Release title & date
   - "Listen Now" buttons for platforms (Spotify, Apple Music, YouTube Music, Tidal, Deezer)

3. **More Releases Grid**
   - 6-8 album covers in a grid
   - Each opens a modal with tracklist + platform links

4. **Tour Dates**
   - List of upcoming shows, rendered only if data is present
   - Date, venue, location, ticket link

5. **Radio Shows**
   - Episode list with play buttons, rendered only if data is present

6. **Newsletter CTA**
   - "Stay Updated" heading
   - Email input + subscribe button

7. **Social Links**
   - Icons for Facebook, X, Instagram, TikTok, YouTube, SoundCloud, Apple Music, Tidal

8. **Footer**
   - "Powered by SoundLog" branding
   - "Upgrade to Pro" link

## 5. Component Breakdown

- `app/components/artist/HeroSection.vue`
- `app/components/artist/FeaturedRelease.vue`
- `app/components/artist/ReleasesGrid.vue`
- `app/components/artist/TourDates.vue` (optional)
- `app/components/artist/RadioShows.vue` (optional)
- `app/components/artist/NewsletterCTA.vue`
- `app/components/artist/SocialLinks.vue`
- `app/components/artist/PageFooter.vue`

Each component receives typed props and returns minimal markup with Tailwind classes.

## 6. TypeScript & Zod

- All mock data typed explicitly
- No `any` types
- Use Zod for runtime validation of mock data shape

## 7. Error Handling & Edge Cases

- Unknown slug → 404 (Nuxt default or custom)
- Missing optional sections → simple conditional rendering
- Missing platform links → fewer buttons (no placeholders)

## 8. Verification

- Run `npm run typecheck`
- Run `npm run test`
- Run `npm run build` to ensure production build passes

## 9. Migration Path to Real Data

Once this slice is approved:
1. Replace `app/mocks/artist-page.ts` lookup with DB query
2. Keep components unchanged
3. Use the same data shape in server route `/api/artist/[slug]`
