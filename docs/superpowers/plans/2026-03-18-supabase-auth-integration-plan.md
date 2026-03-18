# Supabase Authentication Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Supabase authentication with Magic Link and Spotify OAuth, including mandatory onboarding wizard for new users.

**Architecture:** Use `@supa-kit/auth-ui-vue` for pre-built auth components, create onboarding wizard for artist connection, protect dashboard routes with authentication middleware.

**Tech Stack:** Supabase Auth, `@supa-kit/auth-ui-vue`, Vue 3, Nuxt 3, Drizzle ORM

---

## Task 1: Install and Configure Auth UI

**Files:**
- Create: `app/pages/login.vue`
- Create: `app/components/AuthLayout.vue`
- Modify: `package.json` - Add `@supa-kit/auth-ui-vue` dependency

**Steps:**
1. Install auth UI package: `npm install @supa-kit/auth-ui-vue`
2. Verify Nuxt compatibility
3. Create AuthLayout component
4. Create login page with Auth UI
5. Update environment variables
6. Commit changes

---

## Task 2: Create Spotify OAuth Callback Endpoint

**Files:**
- Create: `server/api/auth/spotify/callback.ts`

**Steps:**
1. Create Spotify callback endpoint
2. Update Spotify OAuth configuration in Supabase dashboard
3. Commit changes

---

## Task 3: Add onboardingCompleted field to database and update auth utility

**Files:**
- Modify: `server/db/schema.ts`
- Modify: `server/utils/auth.ts`

**Steps:**
1. Check if onboardingCompleted field exists
2. Add field to artists table if missing
3. Generate and apply database migration
4. Update auth utility to include onboardingCompleted
5. Commit changes

---

## Task 4: Set Up Row-Level Security (RLS) Policies

**Files:**
- No code changes - configuration in Supabase dashboard

**Steps:**
1. Enable RLS on artists table
2. Enable RLS on artist_settings table
3. Enable RLS on artist_integrations table
4. Document RLS setup
5. Commit documentation

---

## Task 5: Create Onboarding Wizard Pages

**Files:**
- Create: `app/pages/onboarding/index.vue`
- Create: `app/pages/onboarding/spotify.vue`
- Create: `app/pages/onboarding/artist.vue`
- Create: `app/pages/onboarding/profile.vue`
- Create: `app/components/OnboardingWizard.vue`

**Steps:**
1. Create OnboardingWizard component
2. Create welcome screen (Step 1)
3. Create Spotify connection page (Step 2)
4. Create artist selection page (Step 3)
5. Create profile setup page (Step 4)
6. Commit changes

---

## Task 6: Create API Endpoints for Onboarding

**Files:**
- Create: `server/api/onboarding/artist.ts`
- Create: `server/api/auth/spotify/tokens.ts`
- Create: `server/api/onboarding/complete.ts`

**Steps:**
1. Create artist creation endpoint
2. Create endpoint to save Spotify tokens
3. Create onboarding completion endpoint
4. Commit changes

---

## Task 7: Create Client-Side Middleware and Composables

**Files:**
- Create: `app/middleware/auth.ts`
- Create: `app/composables/useAuth.ts`
- Create: `app/composables/useOnboarding.ts`

**Steps:**
1. Create auth middleware
2. Create useAuth composable
3. Create useOnboarding composable
4. Commit changes

---

## Task 8: Protect Dashboard Routes

**Files:**
- Modify: `app/pages/dashboard/*.vue` - Add auth middleware
- Modify: `app/pages/[slug].vue` - Add edit button

**Steps:**
1. Add auth middleware to dashboard pages
2. Update [slug].vue to show edit button for owners
3. Commit changes

---

## Task 9: Write Tests

**Files:**
- Create: `test/pages/login.test.ts`
- Create: `test/pages/onboarding/*.test.ts`
- Create: `test/server/api/onboarding/*.test.ts`

**Steps:**
1. Write login page test
2. Write onboarding page tests
3. Write API endpoint tests
4. Run tests
5. Commit tests

---

## Task 10: Verification and Cleanup

**Steps:**
1. Run full test suite
2. Run type check
3. Run production build
4. Update documentation
5. Clean up worktree
6. Merge to main

---

## Success Criteria Verification

- [ ] Users can authenticate via Magic Link
- [ ] Users can authenticate via Spotify OAuth
- [ ] New users complete mandatory onboarding wizard
- [ ] Dashboard access requires authentication
- [ ] Artist owners can edit their profiles
- [ ] All tests pass
- [ ] Production build succeeds