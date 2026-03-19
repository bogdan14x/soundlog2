# Spotify Integration Design Document

**Date:** 2026-03-18
**Version:** 1.0
**Status:** Draft

## 1. Overview

Implement server-side Spotify API integration to fetch artist releases. The system uses a hybrid authentication approach: user OAuth tokens for high rate limits, with Client Credentials flow fallback for public data. Geographic filtering ensures users only see albums available in their market.

## 2. Architecture

### 2.1 Data Flow

```
Frontend / [slug] page
    ↓
GET /api/artist/[slug] (with country headers: CF-IPCountry or x-user-country)
    ↓
Server checks artist_integrations table
    ↓
[Token exists?] → Yes → Use user token (refresh if expired)
              ↓ No
              → Use Client Credentials flow (app-level)
    ↓
Spotify API call with market=country
    ↓
Filter albums by available_markets
    ↓
Cache in Cloudflare KV (24h TTL)
    ↓
Transform & return JSON to frontend
```

### 2.2 Authentication Strategy

1. **User OAuth Token (Primary)**
   - Stored in `artist_integrations` table
   - Used when artist has connected their Spotify account
   - High rate limits (per-user)

2. **Client Credentials Flow (Fallback)**
   - App-level credentials from environment variables
   - Used when no user token exists
   - Lower rate limits (global)

3. **Token Refresh**
   - Automatic refresh using stored `refresh_token`
   - Fallback to Client Credentials if refresh fails

### 2.3 Geographic Filtering

1. **Country Detection**
   - Primary: `CF-IPCountry` header (Cloudflare)
   - Secondary: `x-user-country` header (client-side detection via `dayjs.tz.guess()`)
   - Default: `US`

2. **Spotify API Market Parameter**
   - Pass country code to all Spotify API calls
   - Example: `spotifyApi.getArtistAlbums(artistId, { market: 'GB' })`
   - Frontend sends `x-user-country` header based on `dayjs.tz.guess()` if Cloudflare header is missing

3. **Filtering Logic**
   - Spotify returns `available_markets` array per album
   - Filter out albums where `available_markets` doesn't include user's country
   - Log filtered albums for analytics

## 3. Database Schema Updates

### 3.1 New Table: `artist_integrations`

**File:** `server/db/schema.ts`

```typescript
import { sql } from 'drizzle-orm'
import { pgEnum, pgTable, uuid, text, timestamp, pgIndex } from 'drizzle-orm/pg-core'
import { artists } from './artists' // Assumes existing artists table

export const providerEnum = pgEnum('provider', ['spotify', 'apple_music', 'tidal', 'deezer', 'youtube_music'])

export const artistIntegrations = pgTable('artist_integrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  artistId: uuid('artist_id')
    .notNull()
    .references(() => artists.id, { onDelete: 'cascade' }),
  provider: providerEnum('provider').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').nullable(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
})

// Unique constraint: one integration per provider per artist
export const artistIntegrationsUnique = pgIndex('artist_integrations_artist_provider_unique')
  .on(artistIntegrations.artistId, artistIntegrations.provider)
  .unique()

export const schema = {
  // ... existing tables
  artistIntegrations
}
```

**Constraints:**
- Unique index on `(artist_id, provider)`
- `refresh_token` nullable (some providers don't use it)

### 3.2 Update Existing Tables
No changes to existing tables required.

## 4. Server-Side Implementation

### 4.1 Spotify Client Module

**File:** `server/utils/spotify.ts`

**Interfaces:**
```typescript
interface SpotifyTokens {
  accessToken: string
  refreshToken?: string
  expiresAt: Date
}

interface SpotifyArtist {
  id: string
  name: string
  images: { url: string }[]
  external_urls: { spotify: string }
}

interface SpotifyAlbum {
  id: string
  name: string
  release_date: string
  images: { url: string }[]
  album_type: 'album' | 'single' | 'compilation'
  external_urls: { spotify: string }
  available_markets: string[]
}
```

**Functions:**
1. `getClientCredentialsToken()` - Fetches app-level access token (cached in memory)
2. `refreshUserToken(refreshToken: string)` - Refreshes user OAuth token
3. `searchArtist(query: string, token: string)` - Searches for artist by name
4. `getArtistAlbums(artistId: string, token: string, market: string)` - Fetches albums with market filter
5. `getArtistBySlug(slug: string, event: H3Event)` - Main orchestration function

### 4.2 API Route

**File:** `server/api/artist/[slug].get.ts` (need to create directory `server/api/artist`)

**Logic:**
1. Extract `slug` from route params
2. Get country from headers:
   - Primary: `CF-IPCountry` header (Cloudflare)
   - Secondary: `x-user-country` header (client-side detection via `dayjs.tz.guess()`)
   - Default: 'US'
3. Fetch artist from database by slug
4. If not found → 404
5. Check `artist_integrations` for Spotify token
6. If token exists and valid → use user token
7. If token expired → refresh token
8. If no token or refresh fails → use Client Credentials
9. Fetch albums from Spotify with market parameter
10. Filter by `available_markets`
11. Cache results in Cloudflare KV
12. Transform to internal format and return

### 4.3 Data Transformation

**Spotify → Internal Format:**
```typescript
{
  id: spotifyAlbum.id,
  name: spotifyAlbum.name,
  releaseDate: spotifyAlbum.release_date,
  coverImage: spotifyAlbum.images[0]?.url,
  type: spotifyAlbum.album_type,
  spotifyUrl: spotifyAlbum.external_urls.spotify,
  isAvailableInCurrentMarket: availableMarkets.includes(country)
}
```

## 5. Frontend Changes

### 5.1 Update Artist Page

**File:** `app/pages/[slug].vue`

**Changes:**
1. Replace mock data fetch with API call to `/api/artist/[slug]`
2. Pass country header from client (via `dayjs.tz.guess()`)
3. Handle loading and error states
4. Filter displayed albums by `isAvailableInCurrentMarket`

### 5.2 Component Updates

No changes required to existing components. They already accept typed props.

## 6. Error Handling

### 6.1 Error Scenarios

1. **Spotify API Rate Limiting**
   - Exponential backoff (1s, 2s, 4s, 8s)
   - Return cached data if available
   - Max retries: 3

2. **Expired/Invalid User Token**
   - Try refresh token once
   - Fall back to Client Credentials flow
   - Log: "Token refresh failed"

3. **Artist Not Found in Spotify**
   - Return 404: "Artist not found in Spotify"

4. **No Albums Available in User's Market**
   - Return empty releases array
   - Log: "No albums available in [country] for artist [id]"

5. **Cloudflare KV Cache Miss**
   - Fetch from Spotify API
   - Store in KV with 24h TTL

6. **Network Timeout**
   - 10-second timeout per request
   - Retry once on timeout

### 6.2 Monitoring
- Log all Spotify API errors to console
- Track: Error type, artist ID, country, timestamp

## 7. Testing Strategy

### 7.1 Unit Tests

**Test Files:**
- `test/server/utils/spotify.test.ts`
- `test/server/api/artist/[slug].test.ts`

**Test Cases:**
1. Spotify client authentication (token retrieval, refresh)
2. API route 404 handling
3. Market parameter usage
4. `available_markets` filtering logic
5. Token fallback logic

### 7.2 Integration Tests

1. Mock Spotify API responses
2. Verify data transformation
3. Verify caching behavior
4. Test with different country codes

### 7.3 Mock Strategy
- Mock `fetch` calls to Spotify API using `vi.fn()`
- Mock Cloudflare KV operations
- Mock `dayjs.tz.guess()` for timezone detection

## 8. Environment Variables

**Add to `.env.example`:**
```
SPOTIFY_CLIENT_ID="your_client_id"
SPOTIFY_CLIENT_SECRET="your_client_secret"
```

**Add to `server/utils/env.ts`:**
```typescript
SPOTIFY_CLIENT_ID: z.string().min(1),
SPOTIFY_CLIENT_SECRET: z.string().min(1),
// Note: x-user-country header is parsed directly in API route, not in env validation
```

## 9. Implementation Sequence

1. Create `server/utils` directory (if it doesn't exist)
2. Update database schema (add `artist_integrations` table to `server/db/schema.ts`)
3. Create Spotify client module (`server/utils/spotify.ts`)
4. Create `server/api/artist` directory
5. Create API route (`server/api/artist/[slug].get.ts`)
6. Update environment validation (`server/utils/env.ts`) - *Note: Credentials assumed in `.env`; update validation schema*
7. Update frontend page (`app/pages/[slug].vue`) to use API
8. Add tests
9. Verification (typecheck, tests, build)

## 10. Caching Strategy

**Cache Key Format:**
- `spotify:albums:${artistId}:${market}` - Artist albums by market
- `spotify:token:client` - Client credentials token (in-memory, 1 hour TTL)

**Invalidation Triggers:**
- Manual refresh via dashboard (triggers cache deletion)
- Artist release updates (new album added) - requires manual dashboard trigger or future webhook integration
- 24h TTL for album data (automatic expiration)

## 11. Verification

- Run `npm run typecheck`
- Run `npm run test`
- Run `npm run build`
- Manual test: Visit `/test-artist` (or valid artist slug)
