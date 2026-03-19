# Spotify Data Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified Spotify data adapter that handles both scraped web player data and standard API data with automatic fallback.

**Architecture:** Create a `SpotifyDataOrchestrator` that tries scraped data first (rich metadata), falls back to API if scraping fails, and normalizes both sources into a consistent `InternalArtistData` interface.

**Tech Stack:** Nuxt 3, TypeScript, Node.js fetch API, Cloudflare KV (for caching)

---
### Task 1: Create Spotify Directory Structure and Cache Client

**Files:**
- Create: `server/utils/spotify/`
- Create: `server/utils/spotify/adapter.ts`
- Create: `server/utils/spotify/scraper.ts`
- Create: `server/utils/spotify/api-client.ts`
- Create: `server/cache/client.ts`
- Modify: `server/utils/spotify.ts` (rename to `old-spotify.ts` for backward compat)

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p server/utils/spotify server/cache
```

- [ ] **Step 2: Move existing spotify.ts to backup**

```bash
mv server/utils/spotify.ts server/utils/old-spotify.ts
```

- [ ] **Step 3: Create cache client**

Create `server/cache/client.ts`:

```typescript
// Simple in-memory cache (replace with Cloudflare KV in production)
const cacheStore = new Map<string, { value: any; expiresAt: number }>()

export function createCache() {
  return {
    async get(key: string): Promise<any | null> {
      const item = cacheStore.get(key)
      if (!item) return null
      if (Date.now() > item.expiresAt) {
        cacheStore.delete(key)
        return null
      }
      return item.value
    },
    
    async set(key: string, value: any, options: { ttl: number }): Promise<void> {
      cacheStore.set(key, {
        value,
        expiresAt: Date.now() + (options.ttl * 1000)
      })
    }
  }
}
```

- [ ] **Step 4: Commit directory changes**

```bash
git add server/utils/spotify/ server/cache/ server/utils/old-spotify.ts
git commit -m "chore: create spotify utils and cache directory structure"
```

---

### Task 2: Create Spotify API Client Module

**Files:**
- Create: `server/utils/spotify/api-client.ts`
- Test: `test/server/utils/spotify/api-client.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// test/server/utils/spotify/api-client.test.ts
import { describe, it, expect, vi } from 'vitest'
import { getArtistAlbums, getClientCredentialsToken, exponentialBackoff } from '../../../server/utils/spotify/api-client'

describe('Spotify API Client', () => {
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

  it('getArtistAlbums filters by market', async () => {
    // Mock fetch to return albums
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ id: 'album1', name: 'Test Album' }] })
    })

    const result = await getArtistAlbums('artist123', 'token', 'US')
    expect(result.items).toHaveLength(1)
  })

  it('exponentialBackoff retries on rate limit', async () => {
    let attempts = 0
    global.fetch = vi.fn().mockImplementation(() => {
      attempts++
      if (attempts < 3) {
        return Promise.resolve({ ok: false, status: 429 })
      }
      return Promise.resolve({ ok: true, json: async () => ({ access_token: 'test', expires_in: 3600 }) })
    })

    const result = await exponentialBackoff(async () => {
      const res = await fetch('https://test.com')
      if (!res.ok) throw new Error('Rate limited')
      return res
    }, 3)

    expect(attempts).toBe(3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/server/utils/spotify/api-client.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

Create `server/utils/spotify/api-client.ts`:

```typescript
import { z } from 'zod'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!

const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  refresh_token: z.string().optional()
})

// In-memory token cache
let clientToken: { token: string; expiresAt: number } | null = null

export function clearClientTokenCache(): void {
  clientToken = null
}

export async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // Check if it's a rate limit error (429)
      if (error instanceof Error && error.message.includes('429') && i < maxRetries) {
        const delay = baseDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error
      }
    }
  }
  
  throw lastError!
}

export async function getClientCredentialsToken(): Promise<{ accessToken: string; expiresAt: Date }> {
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
  return exponentialBackoff(async () => {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&market=${market}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        // 10s timeout
        signal: AbortSignal.timeout(10000)
      }
    )

    if (response.status === 429) {
      throw new Error(`Rate limited: ${response.statusText}`)
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch albums: ${response.statusText}`)
    }

    return response.json()
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/server/utils/spotify/api-client.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/utils/spotify/api-client.ts test/server/utils/spotify/api-client.test.ts
git commit -m "feat: add Spotify API client module"
```

---

### Task 3: Create Spotify Scraper Module

**Files:**
- Create: `server/utils/spotify/scraper.ts`
- Test: `test/server/utils/spotify/scraper.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// test/server/utils/spotify/scraper.test.ts
import { describe, it, expect, vi } from 'vitest'
import { scrapeArtistData, getCacheKey } from '../../../server/utils/spotify/scraper'

describe('Spotify Scraper', () => {
  it('extracts initial state from HTML', async () => {
    // Mock fetch to return HTML with initial state
    const html = `
      <html>
        <script id="initial-state">{"entities":{"items":{}}}</script>
      </html>
    `
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => html
    })

    const result = await scrapeArtistData('test-artist')
    expect(result).toBeDefined()
    expect(result.entities).toBeDefined()
  })

  it('generates correct cache key', () => {
    const key = getCacheKey('1Cs0zKBU1kc0i8ypK3B9ai')
    expect(key).toBe('spotify:scrape:1Cs0zKBU1kc0i8ypK3B9ai')
  })

  it('throws error on rate limit', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    })

    await expect(scrapeArtistData('test-artist')).rejects.toThrow('Failed to fetch artist page')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/server/utils/spotify/scraper.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

Create `server/utils/spotify/scraper.ts`:

```typescript
export function getCacheKey(artistId: string): string {
  return `spotify:scrape:${artistId}`
}

export async function scrapeArtistData(slug: string): Promise<any> {
  const url = `https://open.spotify.com/artist/${slug}`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    // 10s timeout
    signal: AbortSignal.timeout(10000)
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch artist page: ${response.statusText}`)
  }

  const html = await response.text()
  
  // Extract initial state from script tag
  const scriptMatch = html.match(/<script id="initial-state">(.+?)<\/script>/)
  if (!scriptMatch) {
    throw new Error('Could not find initial-state script tag')
  }

  try {
    return JSON.parse(scriptMatch[1])
  } catch (error) {
    throw new Error('Failed to parse initial state JSON')
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/server/utils/spotify/scraper.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/utils/spotify/scraper.ts test/server/utils/spotify/scraper.test.ts
git commit -m "feat: add Spotify scraper module"
```

---

### Task 4: Create Spotify Data Adapter Orchestrator

**Files:**
- Create: `server/utils/spotify/adapter.ts`
- Test: `test/server/utils/spotify/adapter.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// test/server/utils/spotify/adapter.test.ts
import { describe, it, expect, vi } from 'vitest'
import { SpotifyDataOrchestrator, normalizeScrapedReleases } from '../../../server/utils/spotify/adapter'

describe('SpotifyDataOrchestrator', () => {
  it('returns normalized data from scraped source', async () => {
    const orchestrator = new SpotifyDataOrchestrator()
    
    // Mock scraper to return valid data
    vi.spyOn(orchestrator as any, 'fetchScrapedData').mockResolvedValue({
      entities: {
        items: {
          'spotify:artist:123': {
            profile: { name: 'Test Artist' },
            discography: { albums: { items: [] }, singles: { items: [] }, compilations: { items: [] } }
          }
        }
      }
    })

    const result = await orchestrator.getArtistData('test-artist', 'US')
    expect(result.artist.name).toBe('Test Artist')
  })

  it('normalizes scraped releases correctly', () => {
    const scrapedRelease = {
      coverArt: { sources: [{ url: 'https://test.com/cover.jpg', height: 300, width: 300 }] },
      date: { year: 2023 },
      name: 'Test Album',
      type: 'ALBUM',
      uri: 'spotify:album:123'
    }

    const normalized = normalizeScrapedReleases([scrapedRelease], 'US')
    expect(normalized).toHaveLength(1)
    expect(normalized[0].name).toBe('Test Album')
    expect(normalized[0].type).toBe('album')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/server/utils/spotify/adapter.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

Create `server/utils/spotify/adapter.ts`:

```typescript
import { scrapeArtistData, getCacheKey } from './scraper'
import { getArtistAlbums, getClientCredentialsToken } from './api-client'
import { createCache } from '../../cache/client'

export interface InternalArtistData {
  artist: {
    id: string
    name: string
    bio?: string
    heroImage?: string
    socialLinks?: Record<string, string>
  }
  releases: Array<{
    id: string
    name: string
    date: string
    coverImage: string
    type: 'album' | 'single' | 'compilation'
    spotifyUrl: string
    isAvailableInCurrentMarket: boolean
  }>
  tourDates?: Array<{
    date: string
    venue: string
    location: string
  }>
}

// Helper to normalize scraped releases
export function normalizeScrapedReleases(releases: any[], country: string): InternalArtistData['releases'] {
  return releases.map((release) => {
    const date = release.date.year 
      ? `${release.date.year}${release.date.month ? `-${release.date.month.toString().padStart(2, '0')}` : ''}${release.date.day ? `-${release.date.day.toString().padStart(2, '0')}` : ''}`
      : 'Unknown'
    
    return {
      id: release.uri.split(':')[2],
      name: release.name,
      date,
      coverImage: release.coverArt?.sources?.[0]?.url || '',
      type: release.type.toLowerCase() as 'album' | 'single' | 'compilation',
      spotifyUrl: `https://open.spotify.com/album/${release.uri.split(':')[2]}`,
      isAvailableInCurrentMarket: true // Scraped data doesn't include market info
    }
  })
}

export class SpotifyDataOrchestrator {
  private cache = createCache()

  async getArtistData(slug: string, country: string): Promise<InternalArtistData> {
    try {
      const scraped = await this.fetchScrapedData(slug)
      return this.normalizeScrapedData(scraped, country)
    } catch (error) {
      console.warn(`Scraping failed for ${slug}:`, error)
    }

    return this.fetchApiData(slug, country)
  }

  private async fetchScrapedData(slug: string): Promise<any> {
    // In production, lookup artist ID from DB using slug
    // For now, use slug as artist ID
    const artistId = slug
    
    // Check cache first
    const cacheKey = getCacheKey(artistId)
    const cached = await this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    const data = await scrapeArtistData(slug)
    
    // Cache for 24 hours
    await this.cache.set(cacheKey, data, { ttl: 24 * 60 * 60 })
    
    return data
  }

  private async fetchApiData(slug: string, country: string): Promise<InternalArtistData> {
    // Get artist ID from database or use slug as fallback
    const artistId = slug // In production, lookup from DB
    
    const token = await getClientCredentialsToken()
    const albums = await getArtistAlbums(artistId, token.accessToken, country)
    
    return {
      artist: {
        id: artistId,
        name: 'Unknown Artist', // Would come from DB
        bio: undefined,
        heroImage: undefined
      },
      releases: albums.items.map((album: any) => ({
        id: album.id,
        name: album.name,
        date: album.release_date,
        coverImage: album.images?.[0]?.url || '',
        type: album.album_type,
        spotifyUrl: album.external_urls?.spotify || '',
        isAvailableInCurrentMarket: !album.available_markets || album.available_markets.length === 0 || album.available_markets.includes(country)
      }))
    }
  }

  private normalizeScrapedData(data: any, country: string): InternalArtistData {
    const artistUri = Object.keys(data.entities.items)[0]
    const artistData = data.entities.items[artistUri]
    
    // Extract all releases from discography
    const allReleases = [
      ...(artistData.discography?.albums?.items || []),
      ...(artistData.discography?.singles?.items || []),
      ...(artistData.discography?.compilations?.items || [])
    ].flatMap(item => item.releases?.items || [])
    
    return {
      artist: {
        id: artistUri.split(':')[2],
        name: artistData.profile.name,
        bio: artistData.profile.biography?.text,
        heroImage: artistData.headerImage?.data?.sources?.[0]?.url,
        socialLinks: artistData.profile.externalLinks?.items?.reduce((acc: any, link: any) => {
          acc[link.name.toLowerCase()] = link.url
          return acc
        }, {}) || {}
      },
      releases: normalizeScrapedReleases(allReleases, country),
      tourDates: artistData.goods?.concerts?.items?.map((concert: any) => ({
        date: concert.data.startDateIsoString,
        venue: concert.data.location.name,
        location: concert.data.location.city
      })) || []
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/server/utils/spotify/adapter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/utils/spotify/adapter.ts test/server/utils/spotify/adapter.test.ts
git commit -m "feat: add Spotify data adapter orchestrator"
```

---

### Task 5: Update API Route to Use Adapter

**Files:**
- Modify: `server/api/artist/[slug].get.ts`

- [ ] **Step 1: Read current API route**

```bash
cat server/api/artist/[slug].get.ts
```

- [ ] **Step 2: Update imports**

Replace:
```typescript
import { getArtistAlbums, getClientCredentialsToken, refreshUserToken } from '../../utils/spotify'
```

With:
```typescript
import { SpotifyDataOrchestrator } from '../../utils/spotify/adapter'
```

- [ ] **Step 3: Update route logic**

Replace the entire route logic with:
```typescript
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    return { statusCode: 400, body: 'Missing slug' }
  }

  const country = (getHeader(event, 'cf-ipcountry') || 
                   getHeader(event, 'x-user-country') || 
                   'US').toUpperCase()

  const orchestrator = new SpotifyDataOrchestrator()
  
  try {
    const artistData = await orchestrator.getArtistData(slug, country)
    return artistData
  } catch (error) {
    console.error(`Error fetching artist data for ${slug}:`, error)
    return { statusCode: 500, body: 'Failed to fetch artist data' }
  }
})
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/api/artist/[slug].get.ts
git commit -m "feat: update API route to use data adapter"
```

---

### Task 6: Update Frontend for New Data Structure

**Files:**
- Modify: `app/pages/[slug].vue`

- [ ] **Step 1: Read current frontend page**

```bash
cat app/pages/[slug].vue
```

- [ ] **Step 2: Update type definitions**

Add new types to match `InternalArtistData`:
```typescript
interface ApiArtistData {
  artist: {
    id: string
    name: string
    bio?: string
    heroImage?: string
    socialLinks?: Record<string, string>
  }
  releases: Array<{
    id: string
    name: string
    date: string
    coverImage: string
    type: string
    spotifyUrl: string
    isAvailableInCurrentMarket: boolean
  }>
  tourDates?: Array<{
    date: string
    venue: string
    location: string
  }>
}
```

- [ ] **Step 3: Update data transformation**

Replace the transformation logic to handle the new structure:
```typescript
const artistData = computed(() => {
  if (!apiData.value) return null
  
  const data = apiData.value as ApiArtistData
  
  // Use first release as featured release
  const featuredRelease = data.releases[0] ? {
    title: data.releases[0].name,
    date: data.releases[0].date,
    coverImage: data.releases[0].coverImage,
    platformLinks: { spotify: data.releases[0].spotifyUrl }
  } : null
  
  // Use remaining releases as "more releases"
  const moreReleases = data.releases.slice(1).map((release) => ({
    title: release.name,
    date: release.date,
    coverImage: release.coverImage,
    platformLinks: { spotify: release.spotifyUrl }
  }))
  
  return {
    ...data.artist,
    bio: data.artist.bio || '',
    heroImage: data.artist.heroImage || '',
    featuredRelease,
    moreReleases,
    tourDates: data.tourDates || [],
    radioShows: [],
    newsletterUrl: undefined,
    socialLinks: data.artist.socialLinks || {}
  }
})
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/[slug].vue
git commit -m "feat: update frontend for new data adapter"
```

---

### Task 7: Integration Tests

**Files:**
- Create: `test/server/api/artist/[slug].integration.test.ts`

- [ ] **Step 1: Write integration tests**

```typescript
// test/server/api/artist/[slug].integration.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createApp, toNodeListener } from 'h3'
import { createRouter } from 'vue-router'
import apiRoute from '../../../server/api/artist/[slug].get'

describe('Artist API Integration', () => {
  it('returns scraped data when available', async () => {
    // Mock scraper to return valid data
    vi.doMock('../../../server/utils/spotify/scraper', () => ({
      scrapeArtistData: vi.fn().mockResolvedValue({
        entities: {
          items: {
            'spotify:artist:123': {
              profile: { name: 'Test Artist', biography: { text: 'Test bio' } },
              discography: { albums: { items: [] }, singles: { items: [] }, compilations: { items: [] } }
            }
          }
        }
      }),
      getCacheKey: (id: string) => `spotify:scrape:${id}`
    }))

    const app = createApp()
    app.use('/api/artist/:slug', apiRoute)
    
    const server = toNodeListener(app)
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, () => {
        const port = (server.address() as any).port
        fetch(`http://localhost:${port}/api/artist/test-artist`)
          .then(resolve)
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.artist.name).toBe('Test Artist')
  })

  it('falls back to API when scraping fails', async () => {
    // Mock scraper to fail
    vi.doMock('../../../server/utils/spotify/scraper', () => ({
      scrapeArtistData: vi.fn().mockRejectedValue(new Error('Scrape failed')),
      getCacheKey: (id: string) => `spotify:scrape:${id}`
    }))

    // Mock API client to succeed
    vi.doMock('../../../server/utils/spotify/api-client', () => ({
      getClientCredentialsToken: vi.fn().mockResolvedValue({
        accessToken: 'test-token',
        expiresAt: new Date(Date.now() + 3600000)
      }),
      getArtistAlbums: vi.fn().mockResolvedValue({
        items: [{ id: 'album1', name: 'Test Album', release_date: '2023-01-01', album_type: 'album', images: [], external_urls: { spotify: 'https://test.com' } }]
      })
    }))

    const app = createApp()
    app.use('/api/artist/:slug', apiRoute)
    
    const server = toNodeListener(app)
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, () => {
        const port = (server.address() as any).port
        fetch(`http://localhost:${port}/api/artist/test-artist`)
          .then(resolve)
      })
    })

    expect(response.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run integration tests**

Run: `npm test -- test/server/api/artist/[slug].integration.test.ts`
Expected: PASS

- [ ] **Step 3: Commit integration tests**

```bash
git add test/server/api/artist/[slug].integration.test.ts
git commit -m "feat: add integration tests for artist API"
```

---

### Task 8: Verification

**Files:**
- All touched files

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: PASS (or minimal failures in unrelated tests)

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Manual verification**

Start dev server: `npm run dev`
Visit: `http://localhost:3000/test-artist` (or valid artist slug)
Expected: Artist page loads with data from adapter

---

## Plan Review

I will now dispatch a plan-document-reviewer subagent to review this implementation plan.
