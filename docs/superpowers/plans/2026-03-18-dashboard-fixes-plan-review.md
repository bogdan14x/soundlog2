# Dashboard Fixes Plan Review

**Date:** 2026-03-18
**Reviewer:** opencode/mimo-v2-flash-free
**Plan Document:** `/Users/bogdan14x/Projects/soundlog2/docs/superpowers/plans/2026-03-18-dashboard-fixes-plan.md`

## Summary

The plan addresses all critical issues from the code review and follows TDD principles. However, two minor issues were identified that should be fixed before execution.

## Checklist Review

1.  **Addresses all critical issues?** Yes. Authentication, data fetching, and integration issues are all covered.
2.  **Tasks bite-sized?** Yes. Each step is 2-5 minutes.
3.  **File paths exact?** Yes. Verified against actual filesystem.
4.  **Code examples complete?** Mostly. One missing import.
5.  **Test commands exact?** Yes. Verified `npm test` runs vitest.
6.  **DRY and YAGNI?** Yes. Minimal implementation with TODOs for DB logic.
7.  **Follows TDD?** Yes. Explicit Red-Green steps in Tasks 1 and 3.

## Issues Found

### 1. Missing Import in `server/utils/auth.ts`
**Location:** Task 1, Step 3
**Issue:** The code snippet throws `createError` but does not import it.
**Code:**
```typescript
import { defineEventHandler } from 'h3'
// Missing: import { createError } from 'h3'
```
**Fix:** Add `createError` to the import statement.

### 2. Missing Implementation for `middleware/auth.ts`
**Location:** Task 1 Files section
**Issue:** The plan lists `middleware/auth.ts` as a file to modify but provides no implementation steps or code for it.
**Context:** The plan creates `server/utils/auth.ts` for API protection, but `middleware/auth.ts` is for Nuxt route middleware (client-side navigation). It should also be updated to protect page access.
**Fix:** Add a step to update `middleware/auth.ts` to use the new auth utility or implement Supabase auth check.

## Verification Evidence

-   **Filesystem Check:**
    -   `server/utils/auth.ts`: Does not exist (correct).
    -   `test/server/utils/auth.test.ts`: Does not exist (correct).
    -   `server/api/dashboard/profile.get.ts`: Does not exist (correct).
    -   `test/server/api/dashboard/profile.get.test.ts`: Does not exist (correct).
    -   `middleware/auth.ts`: Exists, currently allows all access.
    -   `server/api/dashboard/profile.put.ts`: Exists, auth commented out.
    -   `server/api/dashboard/socials.put.ts`: Exists, auth commented out.
    -   `app/pages/dashboard/profile.vue`: Exists, uses mock data.
    -   `app/pages/dashboard/socials.vue`: Exists, uses mock data.

-   **Command Check:**
    -   `npm test`: Runs `vitest run` (verified in `package.json`).

## Recommendations

1.  Fix the missing import in Task 1, Step 3.
2.  Add a step to modify `middleware/auth.ts` (e.g., to redirect unauthenticated users to login).

## Conclusion

The plan is approved with minor corrections. Once the two issues are addressed, the plan is ready for execution by a subagent.