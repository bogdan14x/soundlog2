# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished homepage at `/` that drives artist signups while giving visitors a clear fan-facing discovery path.

**Architecture:** Add a dedicated `app/pages/index.vue` landing page built from focused landing-page components instead of one large file. Reuse the visual language and module shapes from the public artist experience in `app/pages/[slug].vue`, while keeping CTA behavior simple: artist CTAs go to `/login`, example CTAs go to a stable public example route.

**Tech Stack:** Nuxt 3, Vue 3, Tailwind CSS, Vitest, `@nuxtjs/supabase`

---

## File Structure

### Create

- `app/pages/index.vue` - landing page route for `/`
- `app/components/landing/LandingHeader.vue` - top navigation with CTA links and auth-aware dashboard path
- `app/components/landing/LandingHero.vue` - hero section with dual audience CTAs and product preview area
- `app/components/landing/LandingProofStrip.vue` - concise capability/proof section
- `app/components/landing/LandingFeatureGrid.vue` - artist-benefit feature cards
- `app/components/landing/LandingFanWalkthrough.vue` - fan-facing module walkthrough based on public artist page structure
- `app/components/landing/LandingExamplePreview.vue` - live example preview and CTA block
- `app/components/landing/LandingFinalCta.vue` - closing conversion section
- `app/components/landing/LandingFooter.vue` - footer with product links and trust surface
- `app/components/landing/landingContent.ts` - static copy and CTA destination constants
- `test/pages/index.test.ts` - tests for `/` landing page rendering and CTA content
- `test/components/landing/LandingHero.test.ts` - focused hero tests
- `test/components/landing/LandingHeader.test.ts` - header tests for guest/authenticated state

### Modify

- `app/app.vue` - wrap `NuxtPage` with any shared top-level structure only if needed; avoid reintroducing route breakage
- `app/pages/login.vue` - optional minor copy alignment only if the landing-page messaging requires it
- `app/assets/css/main.css` - only if the landing page needs shared utility-safe custom tokens
- `README.md` - optional note if example route seeding or local preview behavior needs explanation
- `vitest.config.ts` - only if new test aliases or setup are required

### Existing files to reference

- `app/pages/[slug].vue` - source of truth for public artist-page structure
- `app/components/artist/HeroSection.vue`
- `app/components/artist/FeaturedRelease.vue`
- `app/components/artist/ReleasesGrid.vue`
- `app/components/artist/SocialLinks.vue`
- `app/pages/login.vue` - destination and message alignment for artist CTA flow

---

## Task 1: Lock In Route Behavior and Landing Page Entry

**Files:**
- Create: `test/pages/index.test.ts`
- Create: `app/pages/index.vue`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HomePage from '../../app/pages/index.vue'

describe('HomePage', () => {
  it('renders the landing page headline instead of a redirect shell', () => {
    const wrapper = mount(HomePage, {
      global: {
        stubs: {
          LandingHeader: true,
          LandingHero: {
            template: '<section>One page for your music</section>'
          },
          LandingProofStrip: true,
          LandingFeatureGrid: true,
          LandingFanWalkthrough: true,
          LandingExamplePreview: true,
          LandingFinalCta: true,
          LandingFooter: true
        }
      }
    })

    expect(wrapper.text()).toContain('One page for your music')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL because `app/pages/index.vue` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```vue
<template>
  <div class="min-h-screen bg-white text-slate-950">
    <LandingHeader />
    <main>
      <LandingHero />
      <LandingProofStrip />
      <LandingFeatureGrid />
      <LandingFanWalkthrough />
      <LandingExamplePreview />
      <LandingFinalCta />
    </main>
    <LandingFooter />
  </div>
</template>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add test/pages/index.test.ts app/pages/index.vue
git commit -m "feat: add homepage landing page route shell"
```

---

## Task 2: Add Landing Page Content Model and Header

**Files:**
- Create: `app/components/landing/landingContent.ts`
- Create: `app/components/landing/LandingHeader.vue`
- Test: `test/components/landing/LandingHeader.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingHeader from '../../../app/components/landing/LandingHeader.vue'

vi.mock('#imports', async () => {
  const actual = await vi.importActual('../../mocks/imports.ts')
  return actual
})

describe('LandingHeader', () => {
  it('shows create-page and live-example actions for guests', () => {
    const wrapper = mount(LandingHeader)

    expect(wrapper.text()).toContain('Create your page')
    expect(wrapper.text()).toContain('See what fans see')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/components/landing/LandingHeader.test.ts`

Expected: FAIL because component/module do not exist.

- [ ] **Step 3: Write minimal implementation**

Create `landingContent.ts` with constants similar to:

```ts
export const landingContent = {
  nav: {
    brand: 'SoundLog',
    primaryCta: { label: 'Create your page', to: '/login' },
    secondaryCta: { label: 'See what fans see', to: '/example-artist' }
  }
}
```

Create `LandingHeader.vue` that:
- renders brand name
- renders example CTA and signup CTA
- uses `useSupabaseUser()` to conditionally show `Go to dashboard`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/components/landing/LandingHeader.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/landingContent.ts app/components/landing/LandingHeader.vue test/components/landing/LandingHeader.test.ts
git commit -m "feat: add landing page header and content constants"
```

---

## Task 3: Build the Hero With Dual Audience CTAs

**Files:**
- Create: `app/components/landing/LandingHero.vue`
- Test: `test/components/landing/LandingHero.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingHero from '../../../app/components/landing/LandingHero.vue'

describe('LandingHero', () => {
  it('shows both artist signup and fan discovery paths', () => {
    const wrapper = mount(LandingHero)

    expect(wrapper.text()).toContain('Create your page')
    expect(wrapper.text()).toContain('See what fans see')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/components/landing/LandingHero.test.ts`

Expected: FAIL because component does not exist.

- [ ] **Step 3: Write minimal implementation**

Build `LandingHero.vue` using `@frontend-design` principles:
- strong headline and short supporting copy
- left-side copy / right-side preview on desktop
- stacked mobile layout
- two CTAs wired to `/login` and public example route
- preview card that visually echoes `app/pages/[slug].vue` modules

Use concrete copy such as:

```vue
<h1>One page for your music, your links, and the fans discovering both.</h1>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/components/landing/LandingHero.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingHero.vue test/components/landing/LandingHero.test.ts
git commit -m "feat: add landing page hero with dual audience CTAs"
```

---

## Task 4: Build Mid-Page Proof and Feature Sections

**Files:**
- Create: `app/components/landing/LandingProofStrip.vue`
- Create: `app/components/landing/LandingFeatureGrid.vue`

- [ ] **Step 1: Write the failing page test**

Update `test/pages/index.test.ts` to assert the homepage includes proof/feature copy:

```ts
expect(wrapper.text()).toContain('One page for every release link')
expect(wrapper.text()).toContain('Built for discovery, not just redirects')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL because the section content is not present yet.

- [ ] **Step 3: Write minimal implementation**

Create:
- `LandingProofStrip.vue` with 3 short proof bullets
- `LandingFeatureGrid.vue` with 3 artist-benefit cards

Keep responsibilities separate:
- proof = compact credibility
- features = artist benefits

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingProofStrip.vue app/components/landing/LandingFeatureGrid.vue test/pages/index.test.ts
git commit -m "feat: add landing page proof and feature sections"
```

---

## Task 5: Build the Fan Walkthrough and Example Preview

**Files:**
- Create: `app/components/landing/LandingFanWalkthrough.vue`
- Create: `app/components/landing/LandingExamplePreview.vue`
- Modify: `app/components/landing/landingContent.ts`

- [ ] **Step 1: Write the failing page test**

Add expectations to `test/pages/index.test.ts`:

```ts
expect(wrapper.text()).toContain('Artist hero')
expect(wrapper.text()).toContain('Featured release')
expect(wrapper.text()).toContain('Explore an example')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL because the walkthrough/example preview content is missing.

- [ ] **Step 3: Write minimal implementation**

Implement:
- `LandingFanWalkthrough.vue` with product-module labels borrowed from public artist page structure
- `LandingExamplePreview.vue` with a public example CTA using a stable route constant from `landingContent.ts`

Default example route strategy:

```ts
export const exampleArtistRoute = '/example-artist'
```

Do not point the fan CTA at `/login`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingFanWalkthrough.vue app/components/landing/LandingExamplePreview.vue app/components/landing/landingContent.ts test/pages/index.test.ts
git commit -m "feat: add landing page fan walkthrough and example preview"
```

---

## Task 6: Build Final CTA and Footer

**Files:**
- Create: `app/components/landing/LandingFinalCta.vue`
- Create: `app/components/landing/LandingFooter.vue`

- [ ] **Step 1: Write the failing page test**

Add expectations to `test/pages/index.test.ts`:

```ts
expect(wrapper.text()).toContain('Create your page')
expect(wrapper.text()).toContain('Explore an example')
expect(wrapper.text()).toContain('SoundLog')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL because the bottom CTA/footer content is missing.

- [ ] **Step 3: Write minimal implementation**

Create:
- `LandingFinalCta.vue` with repeated signup/example paths
- `LandingFooter.vue` with compact product links and trust/privacy text

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingFinalCta.vue app/components/landing/LandingFooter.vue test/pages/index.test.ts
git commit -m "feat: add landing page footer and closing CTA"
```

---

## Task 7: Polish Auth-Aware Behavior and Copy Alignment

**Files:**
- Modify: `app/components/landing/LandingHeader.vue`
- Modify: `app/pages/login.vue`
- Test: `test/components/landing/LandingHeader.test.ts`

- [ ] **Step 1: Write the failing auth-state test**

Add a test like:

```ts
it('shows Go to dashboard for authenticated users', () => {
  mockSupabaseUser.value = { id: 'user-1' }
  const wrapper = mount(LandingHeader)
  expect(wrapper.text()).toContain('Go to dashboard')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/components/landing/LandingHeader.test.ts`

Expected: FAIL if auth-aware content is not implemented yet.

- [ ] **Step 3: Write minimal implementation**

Ensure:
- guests see signup and example actions
- authenticated users also see a dashboard path
- optional login-page subtitle tweak only if needed to stay aligned with landing-page promise

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/components/landing/LandingHeader.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingHeader.vue app/pages/login.vue test/components/landing/LandingHeader.test.ts
git commit -m "feat: align landing page actions with auth state"
```

---

## Task 8: Use Frontend-Design Quality Pass

**Files:**
- Modify: `app/pages/index.vue`
- Modify: `app/components/landing/*.vue`

- [ ] **Step 1: Review current landing page against the spec build brief**

Check for:
- non-generic hero composition
- visual inheritance from `app/pages/[slug].vue`
- modern product tone
- both audience paths visible above the fold

- [ ] **Step 2: Apply focused polish**

Use `@frontend-design` principles to improve:
- spacing and hierarchy
- section rhythm
- visual depth in preview cards
- mobile layout quality
- CTA prominence

Do not add new sections beyond the approved spec.

- [ ] **Step 3: Verify no test regressions**

Run: `npm test -- test/pages/index.test.ts test/components/landing/LandingHero.test.ts test/components/landing/LandingHeader.test.ts`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/pages/index.vue app/components/landing/
git commit -m "feat: polish landing page design"
```

---

## Task 9: Full Verification

**Files:**
- Test: `test/pages/index.test.ts`
- Test: `test/components/landing/LandingHero.test.ts`
- Test: `test/components/landing/LandingHeader.test.ts`

- [ ] **Step 1: Run the landing page test set**

Run:

```bash
npm test -- test/pages/index.test.ts test/components/landing/LandingHero.test.ts test/components/landing/LandingHeader.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Manual verify the routes**

Check:
- `/` shows the new landing page
- `/login` still shows the login page
- example CTA points to a public route
- authenticated header state shows dashboard path

- [ ] **Step 6: Commit any last documentation or copy-only changes**

```bash
git add README.md app/pages/index.vue app/components/landing/ test/
git commit -m "test: verify landing page implementation"
```

---

## Notes for Implementation

1. Use the `frontend-design` skill during implementation, not while writing the plan.
2. Keep landing-page-specific components in `app/components/landing/`.
3. Reuse structure cues from the artist page, but do not import artist-page components directly unless they truly fit the landing experience.
4. Do not send fan/example traffic to `/login`; keep it public.
5. If a stable live example route does not yet exist, create a clearly named temporary public route constant and wire all example CTAs through that single source of truth.
