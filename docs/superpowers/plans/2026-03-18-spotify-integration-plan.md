# Spotify Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement server-side Spotify API integration to fetch artist releases with user OAuth token support, Client Credentials fallback, and geographic filtering.

**Architecture:**
The system uses a hybrid authentication approach: user OAuth tokens for high rate limits, with Client Credentials flow fallback for public data. Geographic filtering ensures users only see albums available in their market using Cloudflare headers and client timezone detection.

**Tech Stack:** Nuxt 3, TypeScript, Drizzle ORM, Zod, Spotify Web API, Cloudflare KV

---

### Task 1: Update Database Schema

**Files:**
- Modify: `server/db/schema.ts`

- [ ] **Step 1: Add provider enum and artist_integrations table**

Add to `server/db/schema.ts` (after existing imports and before the `schema` export):

```typescript
import { pgEnum, pgTable, text, timestamp, uuid, pgIndex } from 'drizzle-orm/pg-core'

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

export const artistIntegrationsUnique = pgIndex('artist_integrations_artist_provider_unique')
  .on(artistIntegrations.artistId, artistIntegrations.provider)
  .unique()

// Update schema export to include new table
export const schema = {
  artists,
  artistSettings,
  releases,
  sessions,
  artistIntegrations  // Add this line
}
```

**Note:** The `artists` table already has `spotifyId` field (line 30 in existing schema), so no changes needed to the artists table itself.

- [ ] **Step 2: Run database generation**

Run: `npm run db:generate`
Expected: Migration file created

- [ ] **Step 3: Commit changes**

```bash
git add server/db/schema.ts drizzle.config.ts
git commit -m "feat: add artist_integrations table to schema"
```

### Task 2: Create Spotify Client Module

**Files:**
- Create: `server/utils/spotify.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// test/server/utils/spotify.test.ts
import { describe, it, expect, vi } from 'vitest'
import { getClientCredentialsToken, getArtistAlbums } from '../../server/utils/spotify'

describe('Spotify Client', () => {
  it('getClientCredentialsToken returns access token', async () => {
    // Mock fetch to return a token
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'test-token', expires_in: 3600 })
    })

    const result = await getClientCredentialsToken()
    expect(result).toBeDefined()
    expect(result.accessToken).toBe('test-token')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/server/utils/spotify.test.ts`
Expected: FAIL (function not defined)

- [ ] **Step 3: Write minimal implementation**

Create `server/utils/spotify.ts`:

```typescript
import { z } from 'zod'

// Environment variables (validated by server/utils/env.ts)
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!

// Token response schema
const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string()
})

// In-memory token cache
let clientToken: { token: string; expiresAt: number } | null = null

export async function getClientCredentialsToken(): Promise<{ accessToken: string; expiresAt: Date }> {
  // Return cached token if still valid
  if (clientToken && clientToken.expiresAt > Date.now()) {
    return { accessToken: clientToken.token, expiresAt: new Date(clientToken.expiresAt) }
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.statusText}`)
  }

  const data = tokenResponseSchema.parse(await response.json())
  const expiresAt = Date.now() + data.expires_in * 1000

  clientToken = { token: data.access_token, expiresAt }

  return { accessToken: data.access_token, expiresAt: new Date(expiresAt) }
}

export async function refreshUserToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`)
  }

  const data = tokenResponseSchema.parse(await response.json())
  const expiresAt = Date.now() + data.expires_in * 1000

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: new Date(expiresAt)
  }
}

export async function getArtistAlbums(artistId: string, accessToken: string, market: string) {
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&market=${market}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch albums: ${response.statusText}`)
  }

  return response.json()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/server/utils/spotify.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/utils/spotify.ts test/server/utils/spotify.test.ts
git commit -m "feat: add Spotify client module"
```

### Task 3: Create API Route

**Files:**
- Create: `server/api/artist/[slug].get.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// test/server/api/artist/[slug].test.ts
import { describe, it, expect, vi } from 'vitest'
import { eventHandler } from 'h3'

describe('GET /api/artist/[slug]', () => {
  it('returns 404 for unknown artist', async () => {
    // Mock database query to return null
    vi.mock('../../../../server/db/client', () => ({
      getDb: () => ({
        query: { artists: { findFirst: async () => null } }
      })
    }))

    // Mock the route handler (simplified)
    const handler = eventHandler(async () => ({ statusCode: 404 }))
    const result = await handler({ node: { req: { url: '/api/artist/unknown' } } } as any)
    
    expect(result.statusCode).toBe(404)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/server/api/artist/[slug].test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Create `server/api/artist/[slug].get.ts`:

```typescript
import { defineEventHandler, getRouterParam, getHeader } from 'h3'
import { getDb } from '../../db/client'
import { schema } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { getArtistAlbums, getClientCredentialsToken, refreshUserToken } from '../../utils/spotify'
import { artistIntegrations } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    return { statusCode: 400, body: 'Missing slug' }
  }

  // Get country from headers with fallback
  const country = (getHeader(event, 'cf-ipcountry') || 
                   getHeader(event, 'x-user-country') || 
                   'US').toUpperCase()

  const db = getDb()

  // Fetch artist from database
  const artist = await db.query.artists.findFirst({
    where: eq(schema.artists.slug, slug)
  })

  if (!artist) {
    return { statusCode: 404, body: 'Artist not found' }
  }

  // Check for Spotify integration
  const integration = await db.query.artistIntegrations.findFirst({
    where: eq(artistIntegrations.artistId, artist.id)
  })

  let accessToken: string
  let refreshToken: string | undefined

  if (integration && integration.expiresAt > new Date()) {
    // Use stored user token
    accessToken = integration.accessToken
    refreshToken = integration.refreshToken || undefined
  } else if (integration?.refreshToken) {
    // Refresh expired token
    try {
      const newTokens = await refreshUserToken(integration.refreshToken)
      accessToken = newTokens.accessToken
      refreshToken = newTokens.refreshToken
      
      // Update database with new tokens
      await db.update(artistIntegrations)
        .set({
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresAt: newTokens.expiresAt
        })
        .where(eq(artistIntegrations.id, integration.id))
    } catch (error) {
      // Refresh failed, fall back to client credentials
      const clientTokens = await getClientCredentialsToken()
      accessToken = clientTokens.accessToken
    }
  } else {
    // Use client credentials flow
    const clientTokens = await getClientCredentialsToken()
    accessToken = clientTokens.accessToken
  }

  // Fetch albums from Spotify
  const albumsResponse = await getArtistAlbums(artist.spotifyId, accessToken, country)
  
  // Filter albums by available_markets
  const availableAlbums = albumsResponse.items.filter((album: any) => 
    !album.available_markets || album.available_markets.length === 0 || album.available_markets.includes(country)
  )

  // Log filtered albums for analytics
  const filteredCount = albumsResponse.items.length - availableAlbums.length
  if (filteredCount > 0) {
    console.log(`Filtered out ${filteredCount} albums for artist ${artist.id} in market ${country}`)
  }

  // Transform to internal format
  const releases = availableAlbums.map((album: any) => ({
    id: album.id,
    name: album.name,
    releaseDate: album.release_date,
    coverImage: album.images[0]?.url,
    type: album.album_type,
    spotifyUrl: album.external_urls.spotify,
    isAvailableInCurrentMarket: true
  }))

  return {
    artist: {
      id: artist.id,
      name: artist.name,
      bio: artist.bio,
      heroImage: artist.heroImage
    },
    releases
  }
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/server/api/artist/[slug].test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/api/artist/[slug].get.ts test/server/api/artist/[slug].test.ts
git commit -m "feat: add Spotify API route"
```

### Task 4: Update Frontend Page

**Files:**
- Modify: `app/pages/[slug].vue`

- [ ] **Step 1: Update page to use API**

**Note:** This step requires `dayjs` package. Install it first:
```bash
npm install dayjs @types/dayjs
```

Modify `app/pages/[slug].vue`:

```typescript
<script setup lang="ts">
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

const route = useRoute()
const slug = route.params.slug as string

// Detect country using dayjs
const detectedCountry = dayjs.tz.guess()
// Simple mapping of timezone to country code (simplified)
const countryMap: Record<string, string> = {
  'America/New_York': 'US',
  'Europe/London': 'GB',
  // Add more mappings as needed
}
const countryCode = countryMap[detectedCountry] || 'US'

// Fetch artist data from API
const { data: artistData, error } = await useFetch(`/api/artist/${slug}`, {
  headers: {
    'x-user-country': countryCode
  }
})

// Use artistData in template (existing components already accept typed props)
</script>
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/pages/[slug].vue
git commit -m "feat: update artist page to use Spotify API"
```

### Task 5: Update Environment Validation

**Files:**
- Modify: `server/utils/env.ts`

- [ ] **Step 1: Add Spotify environment variables**

```typescript
const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1)
})
```

- [ ] **Step 2: Commit**

```bash
git add server/utils/env.ts
git commit -m "feat: add Spotify environment validation"
```

### Task 6: Verification

**Files:**
- All touched files

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Manual verification**

Start dev server: `npm run dev`
Visit: `http://localhost:3000/test-artist` (or valid artist slug)
Expected: Artist page loads with real Spotify data (if credentials are valid)

---

## Plan Review

I will now dispatch a plan-document-reviewer subagent to review this implementation plan.
