# Spotify Data Adapter Design Document

**Date:** 2026-03-18
**Version:** 1.0
**Status:** Draft

## 1. Overview
Implement a unified data adapter that handles two Spotify data sources:
1. **Scraped Data**: Rich initial state JSON from Spotify web player (bio, tour dates, full tracklists)
2. **API Data**: Standard Spotify Web API (albums, basic artist info)

The adapter normalizes both sources into a single internal interface and provides automatic fallback when scraping fails.

## 2. Architecture

### 2.1 Data Flow
```
Request: /api/artist/[slug]
    ↓
SpotifyDataOrchestrator
    ↓
┌─────────────────────────────────────┐
│ Attempt 1: Scraped Data Source      │
│ - Check cache (24h TTL)             │
│ - Parse initial state JSON          │
│ - Extract rich metadata             │
└─────────────────────────────────────┘
    ↓ (if success)
Normalize to InternalArtistData
    ↓
Return to client
    ↓ (if failure)
┌─────────────────────────────────────┐
│ Fallback: Spotify API Source        │
│ - Use Client Credentials flow       │
│ - Fetch artist albums (market-based)│
│ - Filter by available_markets       │
└─────────────────────────────────────┘
    ↓
Normalize to InternalArtistData
    ↓
Return to client
```

### 2.2 Component Structure
```
server/
├── utils/
│   ├── spotify/
│   │   ├── adapter.ts          # Main adapter logic
│   │   ├── scraper.ts          # Web player scraping
│   │   └── api-client.ts       # Spotify API client
│   └── spotify.ts              # Existing client (keep for backward compat)
├── api/
│   └── artist/
│       └── [slug].get.ts       # Updated to use adapter
└── db/
    └── schema.ts               # Existing schema
```

## 3. Data Models

### 3.1 Internal Normalized Interface
```typescript
interface InternalArtistData {
  artist: {
    id: string;
    name: string;
    bio?: string;
    heroImage?: string;
    socialLinks?: Record<string, string>;
  };
  releases: Array<{
    id: string;
    name: string;
    date: string;           // ISO date string or year
    coverImage: string;
    type: 'album' | 'single' | 'compilation';
    spotifyUrl: string;
    isAvailableInCurrentMarket: boolean;
    // Only available from scraped data
    tracklist?: Array<{
      name: string;
      duration: number;     // seconds
      spotifyUrl?: string;
    }>;
  }>;
  tourDates?: Array<{
    date: string;           // ISO date string
    venue: string;
    location: string;
    coordinates?: { latitude: number; longitude: number };
    ticketUrl?: string;
  }>;
  radioShows?: Array<{
    title: string;
    episode: string;
    playLink: string;
  }>;
  newsletterUrl?: string;
}
```

### 3.2 Scraped Data Schema (from initial state JSON)
The scraped data from Spotify web player contains:
```typescript
interface ScrapedArtistData {
  entities: {
    items: {
      [spotifyArtistUri: string]: {
        profile: {
          name: string;
          biography?: { text: string };
          externalLinks?: { items: Array<{ name: string; url: string }> };
        };
        headerImage?: { data: { sources: Array<{ url: string }> } };
        discography: {
          albums: { items: Array<{ releases: { items: Array<ScrapedRelease> } }> };
          singles: { items: Array<{ releases: { items: Array<ScrapedRelease> } }> };
          compilations: { items: Array<{ releases: { items: Array<ScrapedRelease> } }> };
        };
        goods: {
          concerts: {
            items: Array<{
              data: {
                location: { city: string; name: string; coordinates: { latitude: number; longitude: number } };
                startDateIsoString: string;
                title: string;
              }
            }>;
          };
        };
      };
    };
  };
}

interface ScrapedRelease {
  coverArt: { sources: Array<{ url: string; height: number; width: number }> };
  date: { year: number } | { year: number; month: number; day: number };
  name: string;
  type: 'ALBUM' | 'SINGLE' | 'COMPILATION';
  uri: string; // spotify:album:...
}
```

### 3.3 Spotify API Response Schema
Standard Spotify API responses for:
- `GET /v1/artists/:id`
- `GET /v1/artists/:id/albums?market=US&limit=50`

## 4. Implementation Details

### 4.1 SpotifyDataOrchestrator
**File:** `server/utils/spotify/adapter.ts`

```typescript
export class SpotifyDataOrchestrator {
  async getArtistData(
    slug: string,
    country: string
  ): Promise<InternalArtistData> {
    // 1. Try scraped data first
    try {
      const scraped = await this.fetchScrapedData(slug);
      return this.normalizeScrapedData(scraped, country);
    } catch (error) {
      // Log scrape failure but continue
      console.warn(`Scraping failed for ${slug}:`, error);
    }

    // 2. Fallback to Spotify API
    return this.fetchApiData(slug, country);
  }

  private async fetchScrapedData(slug: string): Promise<any> {
    // Implementation: Fetch Spotify web player HTML, extract initial state JSON
    // Cache result in Cloudflare KV (24h TTL)
    // Note: Uses slug to fetch page, extracts artistId from response for cache key
  }

  private async fetchApiData(slug: string, country: string): Promise<InternalArtistData> {
    // Implementation: Use existing Spotify client to fetch albums
    // Cache result in Cloudflare KV (1h TTL)
    // Note: Uses 'country' parameter as Spotify API 'market' parameter
    // Default to 'US' if country is not provided or invalid
  }

  private normalizeScrapedData(data: any, country: string): InternalArtistData {
    // Map scraped structure to InternalArtistData
    // Note: Scraped data does not include `available_markets` per release.
    // All scraped releases are assumed to be globally available (isAvailableInCurrentMarket: true).
    // For accurate market filtering, the API fallback should be used.
  }
}
```

### 4.2 Scraper Module
**File:** `server/utils/spotify/scraper.ts`

Responsible for:
1. Fetching Spotify artist page HTML (using slug)
2. Extracting `<script id="initial-state">` content
3. Parsing JSON and validating structure
4. **Caching results**: Cache key format `spotify:scrape:${artistId}`. The `artistId` is extracted from the scraped data's `spotify:artist:{id}` URI.

**Note**: The scraper relies on the slug to fetch the page, but the cache key uses the `artistId` found within the scraped JSON data.

### 4.3 API Client Module
**File:** `server/utils/spotify/api-client.ts`

Responsible for:
1. Authenticating with Spotify (Client Credentials)
2. Fetching artist albums with market parameter (using the provided `country` or defaulting to 'US')
3. Filtering by `available_markets`
4. Caching results
5. **Implement exponential backoff** for rate-limited requests (1s, 2s, 4s, 8s)

### 4.4 Updated API Route
**File:** `server/api/artist/[slug].get.ts`

Update existing route to use `SpotifyDataOrchestrator` instead of direct API calls.

## 5. Caching Strategy

| Data Source | Cache Key Format | TTL | Storage |
|-------------|------------------|-----|---------|
| Scraped Data | `spotify:scrape:${artistId}` | 24h | Cloudflare KV |
| API Albums | `spotify:api:albums:${artistId}:${market}` | 1h | Cloudflare KV |
| API Token | `spotify:token:client` | 1h | Memory |

## 6. Error Handling

### 6.1 Scrape Failures
- **HTTP Errors**: 404, 403, 429 → Fall back to API
- **Parse Errors**: Invalid JSON structure → Fall back to API
- **Structure Changes**: Spotify HTML changes → Log and fall back to API

### 6.2 API Failures
- **Rate Limits**: Exponential backoff (1s, 2s, 4s, 8s)
- **Invalid Token**: Refresh token or use client credentials
- **Network Timeout**: 10s timeout, retry once

### 6.3 Fallback Behavior
```typescript
if (scrapeSuccess) {
  return normalizedScrapedData;
} else {
  // Log scrape failure
  console.warn(`Scrape failed for ${slug}, using API fallback`);
  try {
    return await fetchApiData();
  } catch (apiError) {
    // Log API failure
    console.error(`API fallback failed for ${slug}:`, apiError);
    throw new Error('Unable to fetch artist data. Please try again later.');
  }
}
```

**Total Failure**: If both scrape and API fail, the error is propagated to the client with a 500 status code.

## 7. Testing Strategy

### 7.1 Unit Tests
- `test/server/utils/spotify/adapter.test.ts`
- `test/server/utils/spotify/scraper.test.ts`
- `test/server/utils/spotify/api-client.test.ts`

### 7.2 Integration Tests
- Test API route with mocked scraped data
- Test API route with mocked API data
- Test fallback behavior when scraping fails

### 7.3 Mock Data
Use the provided `spotify_example_decoded_initialState_json.json` for scrape tests.

## 8. Migration Path

1. Create new `server/utils/spotify/` directory structure
2. Implement scraper module (using existing scraping logic if available)
3. Implement API client module (refactor existing `spotify.ts`)
4. Create adapter orchestrator
5. Update API route to use adapter
6. Add comprehensive tests
7. Deprecate old `spotify.ts` after verification

## 9. Verification

- Run `npm run typecheck`
- Run `npm run test`
- Run `npm run build`
- Manual test: Visit artist page and verify rich data displays
- Manual test: Simulate scrape failure and verify API fallback works
