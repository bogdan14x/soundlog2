# Supabase Authentication Integration Design

## Overview

This document outlines the design for integrating Supabase authentication into the SoundLog2 LinkInBio MVP, replacing the current mocked authentication system with real Magic Link and Spotify OAuth authentication.

## Goals

1. Implement secure authentication using Supabase Auth
2. Support Magic Link and Spotify OAuth login methods
3. Create an onboarding wizard for new users
4. Require artist connection before dashboard access
5. Maintain public artist pages while protecting edit functionality

## Architecture

### 1. Authentication Flow

```
User lands on site
    ↓
Show Auth Landing Page (Magic Link + Spotify OAuth)
    ↓
User authenticates via Supabase
    ↓
Check if user has linked artist
    ↓
If no artist → Onboarding Wizard (mandatory)
    ↓
If has artist → Redirect to Dashboard
```

### 2. Component Structure

#### Auth Pages
- **`/login`** - Landing page with Magic Link and Spotify OAuth options
- **`/register`** - Same as login (Magic Link handles both)
- Uses `@supa-kit/auth-ui-vue` for pre-built components
- Custom styling to match existing design system

#### Onboarding Wizard (Mandatory)
- **`/onboarding`** - Welcome screen
- **`/onboarding/spotify`** - Spotify OAuth connection
- **`/onboarding/artist`** - Artist selection (if multiple artists)
- **`/onboarding/profile`** - Basic profile setup
- Progress indicator and navigation
- Cannot be skipped (mandatory for new users)

#### Protected Routes
- **`/dashboard/*`** - All dashboard routes require authentication
- **`/settings/*`** - Settings pages require authentication
- Client-side middleware redirects unauthenticated users to login

#### Public Routes
- **`/[slug]`** - Artist profile page (publicly accessible)
- Shows "Edit Profile" button that redirects to login if not authenticated
- Edit button visible only to the artist owner

### 3. Data Models

#### Supabase Auth Tables (Managed by Supabase)
- `auth.users` - User accounts (email, OAuth providers)
- `auth.sessions` - Active sessions
- `auth.refresh_tokens` - Token refresh management

#### Application Tables (Current Schema)
- `artists` - Artist profiles (linked via `spotifyId`)
- `artist_settings` - Social links and settings
- `artist_integrations` - Spotify OAuth tokens

### 4. Authentication Methods

#### Magic Link
- Email-based authentication without passwords
- Supabase sends magic link email
- User clicks link to authenticate
- No registration form needed

#### Spotify OAuth
- User authorizes Spotify account
- Supabase handles OAuth flow
- Application fetches artist data from Spotify API
- Creates/updates artist profile in database

### 5. Session Management

#### Server-Side
- `requireUserSession()` middleware validates Supabase tokens
- Extracts user ID and artist ID from validated session
- Returns 401 for unauthorized requests

#### Client-Side
- `useSupabaseUser()` composable for auth state
- Auth middleware protects client-side routes
- Automatic token refresh handling

## Implementation Details

### Files to Create

#### Auth Pages
- `app/pages/login.vue` - Auth landing page
- `app/components/AuthLayout.vue` - Auth page wrapper

#### Onboarding Wizard
- `app/pages/onboarding/index.vue` - Welcome step
- `app/pages/onboarding/spotify.vue` - Spotify connection
- `app/pages/onboarding/artist.vue` - Artist selection
- `app/pages/onboarding/profile.vue` - Profile setup
- `app/components/OnboardingWizard.vue` - Wizard navigation

#### API Endpoints
- `server/api/auth/spotify/callback.ts` - Spotify OAuth callback
- `server/api/onboarding/complete.ts` - Mark onboarding complete
- `server/api/onboarding/artist.ts` - Create/update artist profile

#### Middleware & Composables
- `app/middleware/auth.ts` - Client-side route protection
- `app/composables/useAuth.ts` - Auth state management
- `app/composables/useOnboarding.ts` - Onboarding state

### Files to Modify

#### Existing Pages
- `app/pages/[slug].vue` - Add edit button for owner
- `app/pages/dashboard/*.vue` - Ensure auth requirements

#### Server Utilities
- `server/utils/auth.ts` - Already implemented, verify correctness
- `server/utils/supabase.ts` - Already implemented, verify correctness

#### API Endpoints
- All dashboard endpoints already use `requireUserSession()`

### Security Considerations

1. **Token Validation**: All API requests validate Supabase access tokens
2. **Artist Ownership**: Users can only edit their own artist profile (enforced via RLS)
3. **Session Management**: Automatic token refresh prevents session expiry
4. **CORS**: Proper CORS configuration for Supabase callbacks
5. **Row-Level Security (RLS)**: Enable RLS on `artists` and `artist_settings` tables
   - Policy: Users can only CRUD their own artist data
   - Policy: Users can only CRUD their own artist settings
6. **Service Role Key**: Only use on server-side, never expose to client
7. **Rate Limiting**: Implement rate limiting for Magic Link requests

### Error Handling

1. **Auth Failures**: Redirect to login with error message (e.g., "Magic link expired", "OAuth permission denied")
2. **Missing Artist**: Redirect to onboarding wizard
3. **Invalid Token**: Clear session and redirect to login
4. **API Errors**: Display user-friendly error messages

## Testing Strategy

### Unit Tests
- Auth middleware validation
- Session management functions
- Onboarding state management

### Integration Tests
- Authentication flow (Magic Link and OAuth)
- Onboarding wizard completion
- Protected route access control
- Public page edit button visibility

### E2E Tests
- Complete user journey: Auth → Onboarding → Dashboard
- Artist profile editing flow
- Session expiration and renewal

## Implementation Phases

### Phase 1: Basic Auth Integration (Week 1)
1. Install and configure `@supa-kit/auth-ui-vue`
2. Create login/register pages
3. Implement client-side auth middleware
4. Update session management

### Phase 2: Onboarding Wizard (Week 2)
1. Create onboarding page structure
2. Implement Spotify OAuth flow
3. Build artist selection and profile setup
4. Add progress tracking

### Phase 3: Artist Integration (Week 3)
1. Connect Spotify OAuth to artist creation
2. Update artist profile management
3. Implement onboarding completion logic
4. Add public page edit controls

### Phase 4: Testing & Polish (Week 4)
1. Write comprehensive tests
2. Error handling and UX improvements
3. Performance optimization
4. Security audit

## Success Criteria

1. ✅ Users can authenticate via Magic Link and Spotify OAuth
2. ✅ New users complete mandatory onboarding wizard
3. ✅ Dashboard access requires authentication and artist connection
4. ✅ Public artist pages remain accessible
5. ✅ Artist owners can edit their profiles when authenticated
6. ✅ All existing tests pass
7. ✅ Production build succeeds

## Dependencies

- `@supa-kit/auth-ui-vue` - Pre-built Auth UI components (verify Nuxt 3/4 compatibility)
- `@supabase/supabase-js` - Already in package.json
- `nuxt` - Already configured

## Environment Variables

Required Supabase environment variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key for client-side auth
- `SUPABASE_SERVICE_ROLE_KEY` - Secret key for server-side operations (never expose to client)

## Data Migration

For existing mocked users:
1. Manual migration script to link existing artist profiles to new Supabase users
2. Provide admin tool for manual linking if needed
3. Clear communication to users about the migration

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Supabase configuration errors | Thorough testing in development environment |
| OAuth callback failures | Proper error handling and user feedback |
| Onboarding abandonment | Optional save progress (store in local storage), clear UX guidance |
| Session management issues | Comprehensive token refresh logic |
| `@supa-kit/auth-ui-vue` compatibility | Verify compatibility with Nuxt 3/4 before integration |

## References

- [supaAuth Repository](https://github.com/zackha/supaAuth) - Reference for authentication patterns
- [Supabase Auth UI Vue](https://github.com/supa-kit/auth-ui-vue) - Pre-built UI components
- [Supabase Nuxt Documentation](https://supabase.com/docs/guides/getting-started/quickstarts/nuxtjs)
