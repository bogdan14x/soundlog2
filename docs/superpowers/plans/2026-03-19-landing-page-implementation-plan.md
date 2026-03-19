# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished homepage at `/` that drives artist signups while giving visitors a clear fan-facing discovery path.

**Architecture:** Create a dedicated `app/pages/index.vue` composed from focused landing-page components under `app/components/landing/`. Keep artist CTAs pointed at `/login`, keep fan/example CTAs public, and visually borrow from the existing public artist page structure in `app/pages/[slug].vue` without turning the landing page into a copy of that route.

**Tech Stack:** Nuxt 3, Vue 3, Tailwind CSS, Vitest, `@nuxtjs/supabase`

---

## File Structure

### Create

- `app/pages/index.vue` - landing page route for `/`
- `app/components/landing/landingContent.ts` - static copy and canonical/fallback route constants
- `app/components/landing/LandingHeader.vue` - top navigation with guest/auth-aware CTA behavior
- `app/components/landing/LandingHero.vue` - hero section with two audience paths and product preview
- `app/components/landing/LandingProofStrip.vue` - compact credibility/capability strip
- `app/components/landing/LandingFeatureGrid.vue` - artist-benefit feature cards
- `app/components/landing/LandingFanWalkthrough.vue` - fan-facing module walkthrough based on public artist page structure
- `app/components/landing/LandingExamplePreview.vue` - public example preview with stable route behavior
- `app/components/landing/LandingFinalCta.vue` - closing CTA section
- `app/components/landing/LandingFooter.vue` - compact footer with trust/privacy surface
- `test/pages/index.test.ts` - homepage route tests
- `test/components/landing/landingContent.test.ts` - route strategy tests for CTA safety
- `test/components/landing/LandingHeader.test.ts` - header behavior tests
- `test/components/landing/LandingHero.test.ts` - hero CTA/content tests

### Modify

- `app/pages/login.vue` - only if small copy alignment is required
- `app/assets/css/main.css` - only if landing-page tokens or shared utilities are truly needed
- `vitest.config.ts` - only if extra test alias/setup changes are required

### Existing files to reference

- `app/pages/[slug].vue` - source of truth for public artist-page structure
- `app/components/artist/HeroSection.vue`
- `app/components/artist/FeaturedRelease.vue`
- `app/components/artist/ReleasesGrid.vue`
- `app/components/artist/SocialLinks.vue`
- `app/pages/login.vue` - artist CTA destination and copy alignment

---

## Task 1: Lock In the Homepage Route Shell

**Files:**
- Create: `test/pages/index.test.ts`
- Create: `app/pages/index.vue`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HomePage from '../../app/pages/index.vue'

describe('HomePage', () => {
  it('renders landing page content instead of a redirect shell', () => {
    const wrapper = mount(HomePage, {
      global: {
        stubs: {
          LandingHeader: true,
          LandingHero: { template: '<section>One page for your music</section>' },
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

## Task 2: Define Public Example Route Strategy

**Files:**
- Create: `app/components/landing/landingContent.ts`
- Create: `test/components/landing/landingContent.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { landingContent } from '../../../app/components/landing/landingContent'

describe('landingContent', () => {
  it('keeps fan example routes public and separate from signup', () => {
    expect(landingContent.nav.primaryCta.to).toBe('/login')
    expect(landingContent.nav.secondaryCta.to).not.toBe('/login')
    expect(landingContent.example.fallbackRoute).not.toBe('/login')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/components/landing/landingContent.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `landingContent.ts` with a real public route strategy:

```ts
export const landingContent = {
  nav: {
    brand: 'SoundLog',
    primaryCta: { label: 'Create your page', to: '/login' },
    secondaryCta: { label: 'See what fans see', to: '/artists/example' }
  },
  example: {
    primaryRoute: '/artists/example',
    fallbackRoute: '/artists/example-preview'
  }
}
```

Replace those route strings with the real canonical public route and real public fallback chosen during implementation. Do not use `/login` for the fan path.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/components/landing/landingContent.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/landingContent.ts test/components/landing/landingContent.test.ts
git commit -m "feat: define landing page example route strategy"
```

---

## Task 3: Add the Landing Header

**Files:**
- Create: `app/components/landing/LandingHeader.vue`
- Create: `test/components/landing/LandingHeader.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingHeader from '../../../app/components/landing/LandingHeader.vue'

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

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `LandingHeader.vue` that:
- renders brand name
- renders the public example CTA and signup CTA
- uses `useSupabaseUser()` to conditionally show `Go to dashboard`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/components/landing/LandingHeader.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingHeader.vue test/components/landing/LandingHeader.test.ts
git commit -m "feat: add landing page header"
```

---

## Task 4: Build the Hero With Dual Audience CTAs

**Files:**
- Create: `app/components/landing/LandingHero.vue`
- Create: `test/components/landing/LandingHero.test.ts`

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

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Write minimal implementation**

Build `LandingHero.vue` using `@frontend-design` principles:
- strong headline and concise supporting copy
- side-by-side desktop composition
- stacked mobile layout
- two CTAs wired to `/login` and the public example route constant
- preview card that visually echoes `app/pages/[slug].vue`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/components/landing/LandingHero.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingHero.vue test/components/landing/LandingHero.test.ts
git commit -m "feat: add landing page hero"
```

---

## Task 5: Build the Proof Strip

**Files:**
- Create: `app/components/landing/LandingProofStrip.vue`
- Modify: `test/pages/index.test.ts`

- [ ] **Step 1: Write the failing test**

Add expectations to `test/pages/index.test.ts`:

```ts
expect(wrapper.text()).toContain('One page for every release link')
expect(wrapper.text()).toContain('Built for discovery, not just redirects')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL because the proof strip content is missing.

- [ ] **Step 3: Write minimal implementation**

Create `LandingProofStrip.vue` with 3 concise credibility/capability points.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingProofStrip.vue test/pages/index.test.ts
git commit -m "feat: add landing page proof strip"
```

---

## Task 6: Build the Feature Grid

**Files:**
- Create: `app/components/landing/LandingFeatureGrid.vue`
- Modify: `test/pages/index.test.ts`

- [ ] **Step 1: Write the failing test**

Add expectations to `test/pages/index.test.ts`:

```ts
expect(wrapper.text()).toContain('Unified artist profile')
expect(wrapper.text()).toContain('Fast updates without a developer')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL because the feature grid content is missing.

- [ ] **Step 3: Write minimal implementation**

Create `LandingFeatureGrid.vue` with 3 artist-benefit cards.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingFeatureGrid.vue test/pages/index.test.ts
git commit -m "feat: add landing page feature grid"
```

---

## Task 7: Build the Fan Walkthrough

**Files:**
- Create: `app/components/landing/LandingFanWalkthrough.vue`
- Modify: `test/pages/index.test.ts`

- [ ] **Step 1: Write the failing test**

Add expectations to `test/pages/index.test.ts`:

```ts
expect(wrapper.text()).toContain('Artist hero')
expect(wrapper.text()).toContain('Featured release')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL because the fan walkthrough content is missing.

- [ ] **Step 3: Write minimal implementation**

Create `LandingFanWalkthrough.vue` with public-artist-page module labels and preview blocks based on `app/pages/[slug].vue`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingFanWalkthrough.vue test/pages/index.test.ts
git commit -m "feat: add landing page fan walkthrough"
```

---

## Task 8: Build the Example Preview

**Files:**
- Create: `app/components/landing/LandingExamplePreview.vue`
- Modify: `test/pages/index.test.ts`

- [ ] **Step 1: Write the failing test**

Add a destination assertion to `test/pages/index.test.ts`, for example:

```ts
expect(wrapper.find('[data-test="example-cta"]').attributes('href')).toBe('/artists/example')
```

Use the actual route constant chosen in Task 2.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL because the example preview and CTA destination are missing.

- [ ] **Step 3: Write minimal implementation**

Create `LandingExamplePreview.vue` that:
- shows a public example preview
- uses `landingContent.example.primaryRoute`
- degrades to `landingContent.example.fallbackRoute` if the primary route is unavailable in implementation

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingExamplePreview.vue test/pages/index.test.ts
git commit -m "feat: add landing page example preview"
```

---

## Task 9: Build the Final CTA

**Files:**
- Create: `app/components/landing/LandingFinalCta.vue`
- Modify: `test/pages/index.test.ts`

- [ ] **Step 1: Write the failing test**

Add expectations to `test/pages/index.test.ts`:

```ts
expect(wrapper.text()).toContain('Create your page')
expect(wrapper.text()).toContain('Explore an example')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL because the final CTA section is missing.

- [ ] **Step 3: Write minimal implementation**

Create `LandingFinalCta.vue` with a signup CTA and public example CTA.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingFinalCta.vue test/pages/index.test.ts
git commit -m "feat: add landing page final CTA"
```

---

## Task 10: Build the Footer

**Files:**
- Create: `app/components/landing/LandingFooter.vue`
- Modify: `test/pages/index.test.ts`

- [ ] **Step 1: Write the failing test**

Add expectations to `test/pages/index.test.ts`:

```ts
expect(wrapper.text()).toContain('SoundLog')
expect(wrapper.text()).toContain('Privacy')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL because the footer is missing.

- [ ] **Step 3: Write minimal implementation**

Create `LandingFooter.vue` with compact product links and trust/privacy text.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingFooter.vue test/pages/index.test.ts
git commit -m "feat: add landing page footer"
```

---

## Task 11: Add SEO and Accessibility Requirements

**Files:**
- Modify: `app/pages/index.vue`
- Modify: `test/pages/index.test.ts`

- [ ] **Step 1: Write the failing test**

Add assertions such as:

```ts
expect(wrapper.findAll('h1')).toHaveLength(1)
```

If your test harness can support it cleanly, also assert that `useHead` is called with a meaningful title and description.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL because semantic heading / metadata is not fully in place.

- [ ] **Step 3: Write minimal implementation**

Ensure the landing page has:
- exactly one `h1`
- meaningful `useHead({ title, meta })`
- reduced-motion-safe custom motion behavior if motion is added

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/pages/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/pages/index.vue test/pages/index.test.ts
git commit -m "feat: add landing page SEO and accessibility metadata"
```

---

## Task 12: Add Auth-Aware Header Behavior and Copy Alignment

**Files:**
- Modify: `app/components/landing/LandingHeader.vue`
- Modify: `app/pages/login.vue`
- Modify: `test/components/landing/LandingHeader.test.ts`

- [ ] **Step 1: Write the failing auth-state test**

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
- `app/pages/login.vue` copy only changes if needed to stay aligned with the landing page promise

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/components/landing/LandingHeader.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/LandingHeader.vue app/pages/login.vue test/components/landing/LandingHeader.test.ts
git commit -m "feat: align landing page actions with auth state"
```

---

## Task 13: Apply Frontend-Design Polish

**Files:**
- Modify: `app/pages/index.vue`
- Modify: `app/components/landing/*.vue`

- [ ] **Step 1: Write one quality-focused failing assertion**

Extend `test/pages/index.test.ts` so the assembled page explicitly guarantees both audience paths are visible in the final hero.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/pages/index.test.ts`

Expected: FAIL before the polish change you are about to make.

- [ ] **Step 3: Apply focused polish**

Use `@frontend-design` principles to improve:
- spacing and hierarchy
- preview-card depth
- mobile composition
- CTA prominence
- product/artist-page visual continuity

Do not add new sections beyond the approved spec.

- [ ] **Step 4: Verify no test regressions**

Run: `npm test -- test/pages/index.test.ts test/components/landing/LandingHero.test.ts test/components/landing/LandingHeader.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/pages/index.vue app/components/landing/
git commit -m "feat: polish landing page design"
```

---

## Task 14: Full Verification

**Files:**
- Test: `test/pages/index.test.ts`
- Test: `test/components/landing/landingContent.test.ts`
- Test: `test/components/landing/LandingHeader.test.ts`
- Test: `test/components/landing/LandingHero.test.ts`
- Test: `test/pages/login.test.ts`

- [ ] **Step 1: Run the landing page-focused test set**

Run:

```bash
npm test -- test/pages/index.test.ts test/components/landing/landingContent.test.ts test/components/landing/LandingHeader.test.ts test/components/landing/LandingHero.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run explicit login preservation test**

Run:

```bash
npm test -- test/pages/login.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Manually verify routes**

Check:
- `/` shows the new landing page
- `/login` still shows the login page
- example CTA points to a public route
- authenticated header state shows dashboard path

- [ ] **Step 7: Commit only if verification produced changes**

```bash
git add app/pages/index.vue app/components/landing/ test/ README.md
git commit -m "test: verify landing page implementation"
```

Skip this step if no files changed during verification.

---

## Notes for Implementation

1. Use the `frontend-design` skill during implementation, not while writing the plan.
2. Keep landing-page-specific components in `app/components/landing/`.
3. Reuse structure cues from the artist page, but do not import artist-page components directly unless they truly fit the landing experience.
4. Do not send fan/example traffic to `/login`; keep it public.
5. Choose a real canonical public example route and a real public fallback route before wiring CTAs.
