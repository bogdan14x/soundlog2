# Public Artist Page Mock Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first public artist page at `/[slug]` using mocked data to validate the release-first layout.

**Architecture:** Route orchestration with typed mock data, split into small presentational components. We validate UI shape now; swapping mock data for DB/API will be a later task.

**Tech Stack:** Nuxt 3, TypeScript, TailwindCSS, Zod

---
### Task 1: Create Mock Data Module

**Files:**
- Create: `app/mocks/artist-page.ts`

- [ ] **Step 1: Write the failing test**

```ts
// test/mocks/artist-page.test.ts
import { describe, it, expect } from 'vitest'
import { getArtistBySlug, MockArtist } from '../../app/mocks/artist-page'

describe('getArtistBySlug', () => {
  it('returns artist for known slug', () => {
    const artist = getArtistBySlug('test-artist')
    expect(artist?.name).toBe('Test Artist')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/mocks/artist-page.test.ts`
Expected: FAIL with "getArtistBySlug is not a function" or similar

- [ ] **Step 3: Write minimal implementation**

Create `app/mocks/artist-page.ts` with:
- `MockArtist` interface matching the design spec (slug, name, bio, heroImage, socialLinks, featuredRelease, moreReleases, tourDates?, radioShows?, newsletterUrl?)
- `mockArtists` array with at least one entry matching the interface
- `getArtistBySlug(slug: string): MockArtist | undefined`
- Zod validation for runtime safety: define `MockArtistSchema` and validate data in `getArtistBySlug`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/mocks/artist-page.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/mocks/artist-page.ts test/mocks/artist-page.test.ts
git commit -m "feat: add mock artist data module with Zod validation"
```

### Task 2: Create Hero Section Component

**Files:**
- Create: `app/components/artist/HeroSection.vue`

- [ ] **Step 1: Write the failing test**

```ts
// test/components/artist/HeroSection.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '../../app/components/artist/HeroSection.vue'

describe('HeroSection', () => {
  it('renders artist name', () => {
    const wrapper = mount(HeroSection, {
      props: {
        name: 'Test Artist',
        bio: 'Test bio',
        heroImage: 'https://example.com/image.jpg'
      }
    })
    expect(wrapper.text()).toContain('Test Artist')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/components/artist/HeroSection.test.ts`
Expected: FAIL with "Component not found" or similar

- [ ] **Step 3: Write minimal implementation**

Create `app/components/artist/HeroSection.vue` with:
- Props: `name`, `bio`, `heroImage`
- Template: hero image background, centered name and bio, tagline

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/components/artist/HeroSection.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/artist/HeroSection.vue test/components/artist/HeroSection.test.ts
git commit -m "feat: add HeroSection component"
```

### Task 3: Create Featured Release Component

**Files:**
- Create: `app/components/artist/FeaturedRelease.vue`

- [ ] **Step 1: Write the failing test**

```ts
// test/components/artist/FeaturedRelease.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FeaturedRelease from '../../app/components/artist/FeaturedRelease.vue'

describe('FeaturedRelease', () => {
  it('renders release title', () => {
    const wrapper = mount(FeaturedRelease, {
      props: {
        title: 'Test Album',
        date: '2026-01-01',
        coverImage: 'https://example.com/cover.jpg',
        platformLinks: { spotify: 'https://...' }
      }
    })
    expect(wrapper.text()).toContain('Test Album')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/components/artist/FeaturedRelease.test.ts`
Expected: FAIL with "Component not found" or similar

- [ ] **Step 3: Write minimal implementation**

Create `app/components/artist/FeaturedRelease.vue` with:
- Props: `title`, `date`, `coverImage`, `platformLinks`
- Template: cover image, title/date, "Listen Now" buttons per platform

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/components/artist/FeaturedRelease.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/artist/FeaturedRelease.vue test/components/artist/FeaturedRelease.test.ts
git commit -m "feat: add FeaturedRelease component"
```

### Task 4: Create Releases Grid Component

**Files:**
- Create: `app/components/artist/ReleasesGrid.vue`

- [ ] **Step 1: Write the failing test**

```ts
// test/components/artist/ReleasesGrid.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReleasesGrid from '../../app/components/artist/ReleasesGrid.vue'

describe('ReleasesGrid', () => {
  it('renders grid of releases', () => {
    const releases = [
      { title: 'Release 1', date: '2026-01-01', coverImage: 'https://...', platformLinks: {} }
    ]
    const wrapper = mount(ReleasesGrid, { props: { releases } })
    expect(wrapper.text()).toContain('Release 1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/components/artist/ReleasesGrid.test.ts`
Expected: FAIL with "Component not found" or similar

- [ ] **Step 3: Write minimal implementation**

Create `app/components/artist/ReleasesGrid.vue` with:
- Props: `releases` array
- Template: grid of album covers, click opens modal with tracklist

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/components/artist/ReleasesGrid.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/artist/ReleasesGrid.vue test/components/artist/ReleasesGrid.test.ts
git commit -m "feat: add ReleasesGrid component"
```

### Task 5: Create Additional Components

**Files:**
- Create: `app/components/artist/TourDates.vue`
- Create: `app/components/artist/RadioShows.vue`
- Create: `app/components/artist/NewsletterCTA.vue`
- Create: `app/components/artist/SocialLinks.vue`
- Create: `app/components/artist/PageFooter.vue`

- [ ] **Step 1: Write minimal implementations**

1. **TourDates.vue**: Props: `dates` (array of `{ date, venue, location, ticketLink? }`); render only if data present
2. **RadioShows.vue**: Props: `shows` (array of `{ title, episode, playLink }`); render only if data present
3. **NewsletterCTA.vue**: Props: `url` (string optional); render "Stay Updated" heading, email input, subscribe button
4. **SocialLinks.vue**: Props: `links` (Record of platform -> url); render icons for Facebook, X, Instagram, TikTok, YouTube, SoundCloud, Apple Music, Tidal
5. **PageFooter.vue**: Render "Powered by SoundLog" branding and "Upgrade to Pro" link

- [ ] **Step 2: Commit all components together**

```bash
git add app/components/artist/*.vue
git commit -m "feat: add artist page supporting components"
```

### Task 6: Create Main Artist Page Route

**Files:**
- Create: `app/pages/[slug].vue`

- [ ] **Step 1: Write the failing test**

```ts
// test/pages/[slug].test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ArtistPage from '../../app/pages/[slug].vue'

describe('ArtistPage', () => {
  it('renders artist components', () => {
    // Mock route params
    const wrapper = mount(ArtistPage, {
      global: {
        mocks: {
          $route: { params: { slug: 'test-artist' } }
        }
      }
    })
    expect(wrapper.text()).toContain('Test Artist')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/[slug].test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Create `app/pages/[slug].vue` with:
- Use `useRoute()` to get `slug`
- Call `getArtistBySlug(slug)`
- If not found, throw 404 or show not found
- Render all components with mock data

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/[slug].test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/[slug].vue test/pages/[slug].test.ts
git commit -m "feat: add public artist page route"
```

### Task 7: Verification

**Files:**
- All files touched in previous tasks

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit verification results**

```bash
git add .
git commit -m "chore: verify public artist page slice"
```

---

### Plan Review

I will now dispatch a plan-document-reviewer subagent to review this implementation plan.
