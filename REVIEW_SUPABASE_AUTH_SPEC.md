# Review: Supabase Authentication Integration Design

**Date:** 2026-03-18
**Spec File:** `docs/superpowers/specs/2026-03-18-supabase-auth-design.md`

## 1. Completeness

**Good:**
- Covers essential flows (Magic Link, OAuth, Onboarding).
- Lists files to create/modify.
- Defines data models (Auth vs App tables).

**Missing/Unclear:**
- **Environment Variables:** Missing explicit list of required Supabase env vars (e.g., `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- **Data Migration:** No strategy for handling existing mocked users.
- **Testing Mocks:** No mention of how to mock `@supa-kit/auth-ui-vue` or Supabase client in tests.

## 2. Architecture

**Good:**
- Clear flow: Auth → Onboarding → Dashboard.
- Separation of concerns (Auth pages, Onboarding steps, Protected routes).

**Missing/Unclear:**
- **Spotify OAuth Flow:** Spec mentions callback endpoint but doesn't detail the full exchange (code -> tokens -> artist data fetch).
- **Artist Selection:** Logic for "multiple artists" is undefined.
- **Session Persistence:** Relies on `useSupabaseUser` but doesn't explicitly confirm Nuxt 3/4 compatibility.

## 3. Security

**Good:**
- Mentions token validation and artist ownership.
- CORS configuration noted.

**Missing/Unclear:**
- **Row-Level Security (RLS):** Critical omission. No mention of enabling RLS on `artists` and `artist_settings` tables.
- **Service Role Key:** `server/utils/supabase.ts` likely uses this. Must be server-side only. Spec should warn explicitly.
- **Magic Link Rate Limiting:** Not mentioned.

## 4. Feasibility

**Good:**
- 4-week timeline is reasonable.
- Phases are logical.

**Missing/Unclear:**
- **Dependency Risks:** `@supa-kit/auth-ui-vue` compatibility with Nuxt 3/4 needs verification.
- **Onboarding Abandonment:** "Optional save progress" is mentioned but no implementation detail.

## 5. Clarity

**Good:**
- Well-organized sections.
- Specific success criteria.

**Missing/Unclear:**
- **Terminology:** "Artist" vs "Profile" used interchangeably.
- **Error States:** Vague ("Auth Failures: Redirect to login"). Should define specific error messages/cases.

## Overall Approval Status: **NEEDS CHANGES**

**Recommended Changes:**
1. Add explicit list of Supabase environment variables.
2. Define RLS policies for `artists` and `artist_settings`.
3. Detail Spotify OAuth flow (step-by-step).
4. Clarify artist ownership (foreign key `user_id`).
5. Add migration strategy for existing mocked data.
6. Specify how to mock Supabase in tests.
7. Standardize terminology ("Artist Profile").
8. Add rate-limiting for Magic Links.

---

**Next Step:** Should I update the spec document with these changes and proceed to the implementation plan?
