# LinkInBio Builder - MVP Design Document

**Date:** 2026-03-17
**Version:** 1.0
**Status:** Ready for Review

## Overview

Build an automated LinkInBio platform for independent artists that:
- Auto-generates artist pages based on Spotify releases
- Provides a single shareable link for fans
- Minimizes manual upkeep for artists
- Monetizes via premium features

**MVP Scope:** Public artist page display with basic dashboard management.
**MVP Features:**
- Artist page with hero image, bio, and social links
- Latest releases display with cross-platform streaming links (Spotify, Apple Music, YouTube Music, Tidal, Deezer)
- Tour dates display (parsed from Spotify artist page)
- Radio shows detection and display
- Newsletter signup CTA
- Social media links (Facebook, X, Instagram, TikTok, YouTube, SoundCloud)
- Basic dashboard for profile and social link management
- **Excluded from MVP (Phase 4):** Advanced analytics

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC ARTIST PAGE                        │
│  (Nuxt SSR + TailwindCSS, served at Cloudflare Pages)       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    NUXT SERVER ROUTES                        │
│  (Deployed as Cloudflare Workers)                            │
│  • GET /api/artist/[slug] - Fetch artist data               │
│  • GET /api/artist/[slug]/spotify - Sync Spotify data       │
│  • POST /api/artist/[slug]/settings - Update settings       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    DATA LAYER                                │
│  • Supabase (PostgreSQL) - Artist profiles, settings        │
│  • Cloudflare KV - Spotify API response cache               │
│  • Drizzle ORM - Type-safe database queries                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    EXTERNAL APIS                             │
│  • Spotify API - Artist releases, profile data              │
│  • MusicBrainz API - ISRC lookup (optional)                │
│  • Supabase Auth - Artist dashboard authentication          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Tech Stack

- **Frontend:** Nuxt 3 + TypeScript + TailwindCSS
- **Backend:** Nuxt server routes (Cloudflare Workers)
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle ORM
- **Cache:** Cloudflare KV
- **Auth:** Supabase Auth

---

## 2. Database Schema

### 2.1 Tables (Supabase PostgreSQL)

#### `artists`
Stores core artist information.

```sql
artists {
  id: uuid (PK, auto-generated)
  slug: string (unique, artist URL identifier)
  spotify_id: string (Spotify artist ID, unique)
  name: string (artist name)
  bio: text (artist biography)
  hero_image: string (URL to hero image)
  created_at: timestamp (default now)
  updated_at: timestamp (default now)
}
```

#### `artist_settings`
Stores artist-specific settings and social links.

```sql
artist_settings {
  id: uuid (PK, auto-generated)
  artist_id: uuid (FK → artists.id, unique)
  social_facebook: string (URL)
  social_x: string (URL)          -- X (formerly Twitter)
  social_instagram: string (URL)
  social_tiktok: string (URL)
  social_youtube: string (URL)
  social_soundcloud: string (URL)
  social_apple_music: string (URL)
  social_tidal: string (URL)
  newsletter_url: string (newsletter signup link)
  upgrade_prompt: boolean (show upgrade CTA)
  created_at: timestamp (default now)
  updated_at: timestamp (default now)
}
```

#### `releases`
Stores cached Spotify releases and track data.

```sql
releases {
  id: uuid (PK, auto-generated)
  artist_id: uuid (FK → artists.id)
  spotify_id: string (Spotify release ID)
  name: string (release title)
  type: enum ('single', 'album', 'ep', 'compilation')
  release_date: date
  cover_image: string (URL)
  tracks: jsonb (array of track objects)
  is_featured: boolean (highlighted on page)
  created_at: timestamp (default now)
  updated_at: timestamp (default now)
}
```

**Track Object Structure (JSONB):**
```json
{
  "spotify_id": "track-id",
  "name": "Track Name",
  "isrc": "USRC17607841",
  "platform_links": {
    "spotify": "https://...",
    "apple_music": "https://...",
    "youtube_music": "https://...",
    "tidal": "https://...",
    "deezer": "https://..."
  },
  "resolution_status": {
    "spotify": "resolved",
    "apple_music": "resolved",
    "youtube_music": "resolved",
    "tidal": "resolved",
    "deezer": "resolved"
  }
}
```

**Resolution Status Values:**
- `resolved`: Link successfully found and cached
- `pending`: Resolution in progress (async job)
- `failed`: Permanent failure (track not available on platform)
- `unsupported`: Platform not supported for this track

**Note:** The `resolution_status` object tracks status for each platform individually (e.g., `spotify: "resolved"`, `apple_music: "pending"`). This allows granular tracking of which platforms have successfully resolved links for each track.

**Notes:**
- `platform_links`: Auto-resolved links from link matcher utility API
- `resolution_status`: Tracks resolution status for each platform
- All platforms are implemented in Phase 1 (MVP) via automated link matching
- **Retry Cadence:** Failed resolutions retry after 24 hours, successful resolutions refresh weekly

#### `sessions`
Stores dashboard login sessions.

```sql
sessions {
  id: uuid (PK, auto-generated)
  artist_id: uuid (FK → artists.id)
  token_hash: string (SHA-256 hash of session token)
  expires_at: timestamp
  created_at: timestamp (default now)
}
```

---

## 3. Artist Page Layout

### 3.1 Page Sections (Top to Bottom)

1. **Hero Section**
   - Full-width hero image (from Spotify)
   - Artist name (large, centered)
   - Tagline: "Your music. One link. Always up to date."

2. **Latest Release (Featured)**
   - Album artwork (large)
   - Release title & date
   - "Listen Now" buttons (Spotify, Apple Music, YouTube Music, Tidal, Deezer)

3. **More Releases**
   - Grid of album covers (latest 6-8 releases)
   - Each opens a modal with tracklist + platform links

4. **Tour Dates (if available)**
   - List of upcoming shows
   - Date, venue, location, ticket link

5. **Radio Shows (if detected)**
   - Episode list with play buttons

6. **Newsletter CTA**
   - "Stay Updated" heading
   - Email input + subscribe button

7. **Social Links**
   - Icons for Facebook, X (Twitter), Instagram, TikTok, YouTube, SoundCloud, Apple Music, Tidal

8. **Footer**
   - "Powered by SoundLog" branding
   - "Upgrade to Pro" link (if not upgraded)

### 3.2 Visual Mockup

```
┌─────────────────────────────────────────────────────────────┐
│ HERO SECTION                                                │
│ [Full-width hero image]                                     │
│ ARTIST NAME                                                 │
│ "Your music. One link. Always up to date."                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ LATEST RELEASE                                              │
│ [Album Artwork]    Release Title (Date)                     │
│ [Spotify] [Apple Music] [YouTube] [Tidal] [Deezer]          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MORE RELEASES                                               │
│ [Album] [Album] [Album] [Album]                             │
│ [Album] [Album] [Album] [Album]                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TOUR DATES                                                  │
│ • Dec 15 - Venue Name, City                                 │
│ • Dec 20 - Venue Name, City                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ RADIO SHOWS                                                 │
│ • Episode 1 - Play Button                                   │
│ • Episode 2 - Play Button                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ NEWSLETTER CTA                                              │
│ "Stay Updated"                                              │
│ [Email Input] [Subscribe]                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SOCIAL LINKS                                                │
│ [FB] [X] [IG] [TT] [YT] [SC] [AM] [TD]                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FOOTER                                                      │
│ Powered by SoundLog | Upgrade to Pro                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Spotify Integration

### 4.1 Data Fetching Strategy

**On-Demand Fetch with Cloudflare KV Caching + Background Refresh:**

1. **User Request Flow:**
   - User visits `/artist/[slug]`
   - Check Cloudflare KV: `spotify:artist:[spotify_id]:releases`
   - If cache miss → fetch from Spotify API
   - Store in Supabase (backup) + Cloudflare KV (fast access)
   - Set KV TTL to 1 hour (3600 seconds)

2. **Background Refresh (Pre-warm Cache):**
   - Cloudflare Worker cron job runs every 6 hours
   - Refreshes cache for popular artists (top 100 by page views)
   - Prevents rate limit bottlenecks during peak traffic
   - Updates `updated_at` timestamp in Supabase

**Cache Key Format:**
- `spotify:artist:[spotify_id]:releases` - Release data
- `spotify:artist:[spotify_id]:profile` - Artist profile data

**Rate Limit Protection:**
- Implement exponential backoff for Spotify API calls
- Queue system for batch processing during background refresh
- Monitor API usage via Cloudflare Workers analytics

### 4.2 Tour Dates Extraction

**Note:** Tour dates are included in MVP (Phase 2).

Since Spotify doesn't provide tour dates via API, we parse the artist's Spotify page HTML:

1. Serverless function fetches HTML from `https://open.spotify.com/artist/[id]`
2. Extracts JSON data from `<script id="__NEXT_DATA__">` tag
3. Parses tour dates from the JSON structure
4. Caches results in Cloudflare KV with TTL of 24 hours

**Fallback Strategy (Phase 2):**
- If HTML parsing fails, hide tour dates section
- **Manual Entry:** Dashboard setting to add tour dates manually (Phase 3)
- **Third-Party Integration:** Future integration with Bandsintown/Songkick API (Phase 4)

**Implementation Notes:**
- HTML parsing is fragile and may break if Spotify changes their page structure
- Comprehensive error handling required
- Log all parsing failures to Cloudflare Workers analytics
- If parsing fails repeatedly, alert admin to update parsing logic

### 4.3 Radio Shows Detection

**Note:** Radio shows are included in MVP (Phase 2).

Check for "radio show" content type in Spotify API response:
- Filter releases where `type === 'album'` and name contains "Radio" or "Show"
- Display in separate section on page with episode list and play buttons

**Heuristic Limitations:**
- This detection method is heuristic-based and may produce false positives/negatives
- Albums named "Radio Edit" or containing "Show" may be incorrectly flagged
- **Future Enhancement:** Investigate Spotify's `show` content type or specific categories for more accurate detection

**Implementation:**
- Query Spotify API for artist's releases
- Filter for radio show content using name matching
- Display in dedicated section on artist page
- Log detection results for monitoring

### 4.4 Release Filtering

Distinguish between official releases and compilations:
- Official: `album_type === 'album' || 'single' || 'ep'`
- Compilations: Filter out releases where artist is not primary
- Use Spotify API's `album_type` field

---

## 5. Cross-Platform Link Resolution (Custom Service)

**Important:** We will NOT use Songlink API (Terms of Service restrictions, rate limits). We'll build our own resolution service.

### 5.1 Resolution Strategy

**Primary Method: ISRC-Based Resolution**

1. **Extract ISRC from Spotify:**
   - Spotify API provides ISRC (International Standard Recording Code) for most tracks
   - ISRC is the global standard for identifying sound recordings

2. **Query External APIs by ISRC:**
   - **Apple Music:** MusicKit API (requires Apple Developer account)
   - **Tidal:** Tidal API (requires partner access)
   - **Deezer:** Deezer API (free tier available, ISRC search)
   - **YouTube Music:** YouTube Data API (search by track name/artist)

3. **Fallback: Metadata Matching**
   - If ISRC unavailable or API fails:
   - Match by (track name + artist name + album name)
   - Use fuzzy matching for variations

### 5.2 Implementation Plan (All Platforms in MVP)

**Phase 1 (MVP): All Streaming Platform Links**

Since Spotify doesn't provide direct links to other platforms, we'll build a custom link matcher utility API route.

**Link Matcher Utility API:**
- **Route:** `/api/utils/match-links` (internal utility, not public)
- **Input:** Spotify track ID or ISRC code
- **Output:** JSON object with direct URLs for all platforms

**Resolution Strategy:**

1. **ISRC-Based Matching (Primary)**
   - Extract ISRC from Spotify API
   - Query MusicBrainz API for ISRC metadata
   - Use ISRC to find equivalent tracks on Apple Music, Tidal, Deezer, YouTube Music
   - Cache results in Cloudflare KV

2. **Fuzzy Matching Fallback (Secondary)**
   - If ISRC unavailable, use track name + artist name + album name
   - Query each platform's API with metadata
   - Use fuzzy matching algorithms (Levenshtein distance)
   - Cache successful matches

3. **Direct URL Construction (Tertiary)**
   - For platforms where API access is limited (Tidal), construct URLs using known patterns
   - Example: `https://tidal.com/browse/track/{track_id}`

**Implementation Details:**
- **MusicBrainz API:** Free, no API key required for basic searches
- **Apple Music:** Use MusicKit API (requires Apple Developer account)
- **Tidal:** Use Tidal API (partner access) or direct URL construction
- **Deezer:** Use Deezer API (free tier available)
- **YouTube Music:** Use YouTube Data API (search by track name/artist)

**Key Points:**
- **No manual link input:** The link matcher utility automatically resolves all platform links
- **Internal API route:** `/api/utils/match-links` is a server-side utility, not exposed to artists
- **Caching:** All resolved links cached in Cloudflare KV for performance
- **Background processing:** New releases are processed asynchronously

**Phase 2 (Post-MVP): Enhanced Resolution**
- Add more platforms (SoundCloud, Bandcamp, etc.)
- Background job for batch resolution of new releases
- Smart fallback algorithms

### 5.3 Caching Strategy

- **Key:** `track:[isrc]:platforms` or `track:[spotify_id]:platforms`
- **TTL:** 24 hours for failed resolutions, 7 days for successful resolutions
- **Refresh:**
  - Successful resolutions: Weekly background job
  - Failed resolutions: Retry after 24 hours (exponential backoff)
- **Storage:** Resolved links stored in `releases.tracks.platform_links` JSONB field
- **Note:** All links resolved automatically via link matcher utility (no manual input)

---

## 6. Artist Dashboard

### 6.1 Features

- **Login:** Email/password via Supabase Auth
- **Profile Settings:** Edit bio, hero image, artist name
- **Social Links:** Manage all social media URLs:
  - Facebook, X (Twitter), Instagram, TikTok, YouTube, SoundCloud
  - Apple Music, Tidal (streaming platforms)
- **Link Resolution Status:** View status of platform link resolution (no manual override in MVP)
- **Newsletter:** Configure signup URL
- **Upgrade Prompts:** Toggle banner visibility
- **Basic Analytics:** Page view counts, unique visitors, top tracks (Phase 5)

**Link Resolution Status (Phase 1):**
- Dashboard displays resolution status for each track/platform
- Artists can view which platforms successfully resolved
- No manual input required - all links resolved automatically via link matcher utility

### 6.2 Routes

- `/dashboard/login` - Authentication
- `/dashboard/settings` - Edit profile & links
- `/dashboard/analytics` - View stats (future)

### 6.3 Authentication Flow

1. Artist enters email/password
2. Supabase Auth validates credentials
3. Generate a random session token and store only its hash in `sessions.token_hash`
4. Store the raw token in an HTTP-only cookie
5. Verify each dashboard request by hashing the presented token and comparing hashes

---

## 7. Monetization Strategy

### 7.1 Free Tier

- "Powered by SoundLog" branding in footer
- Upgrade prompt banner on artist page
- Limited to 1 artist page per account

### 7.2 Pro Tier (Future)

- Remove branding
- Custom domain support
- Advanced analytics
- Multiple artist pages
- Priority support

### 7.3 Implementation

- Feature flag in `artist_settings.upgrade_prompt`
- Toggle available in dashboard (Pro tier only)
- Free tier always shows upgrade prompt (cannot be disabled)
- Pro tier can hide upgrade prompt via toggle

---

## 8. Technical Implementation Plan

### Phase 1: Setup & Core Infrastructure
- Initialize Nuxt 3 project with TailwindCSS
- Set up Supabase project & database
- Configure Drizzle ORM
- Set up Cloudflare KV namespace

### Phase 2: Artist Page Display + Cross-Platform Links
- Create Nuxt server routes for `/[slug]`
- Build artist page components (hero, releases, social links)
- Implement Spotify API integration
- Build link matcher utility API (`/api/utils/match-links`)
- Implement platform link resolution via MusicBrainz API (ISRC-based)
- Add Cloudflare KV caching for resolved links
- Implement tour dates extraction (Spotify page parsing)
- Implement radio shows detection

### Phase 3: Artist Dashboard
- Build authentication (Supabase Auth)
- Create settings form (social links, bio)
- Implement manual tour dates entry (fallback for HTML parsing failures)
- Implement data persistence

### Phase 4: Advanced Features (Post-MVP)
- Background refresh for link resolution
- Custom domain support
- Advanced analytics dashboard

### Phase 5: Monetization & Polish
- Add branding & upgrade prompts
- Polish UI/UX
- Testing & deployment

---

## 9. Error Handling & Edge Cases

### 9.1 Spotify API Failures

- **Rate Limiting:** Implement exponential backoff
- **Invalid Artist ID:** Show 404 page
- **API Downtime:** Serve cached data, show "Last updated" timestamp

### 9.2 Cache Invalidation

- **Manual Refresh:** Dashboard button to force refresh Spotify data
- **Background Job:** Cron job to refresh data every 6 hours
- **Webhook (Future):** Spotify webhook for instant updates (requires approval)

### 9.3 Tour Dates Parsing Failures

- If parsing fails, hide tour dates section
- Log error for monitoring
- Fallback to manual entry in dashboard (future)

### 9.4 Cross-Platform Resolution Failures

- **Per-Platform Status Tracking:** Use `resolution_status` field with distinct values:
  - `resolved`: Link successfully found
  - `pending`: Resolution in progress
  - `failed`: Permanent failure (track not available on platform)
  - `unsupported`: Platform not supported for this track
- **UI Display Logic:**
  - Show platform button if status is "resolved"
  - Hide platform button if status is "failed" or "unsupported"
  - Show "More platforms coming soon" placeholder only if ALL non-Spotify platforms failed
- **Error Recovery:**
  - **Temporary Failures (API timeout, rate limit):** Retry after 24 hours with exponential backoff
  - **Permanent Failures (track not found):** Mark as `failed`, no retry
  - Log all failures to Cloudflare Workers analytics
  - Dashboard shows resolution status for each track/platform
- **No Manual Input:** All links resolved automatically via link matcher utility

---

## 10. Testing Strategy

### 10.1 Unit Tests

- Database queries (Drizzle)
- Spotify API integration functions
- Cache operations (Cloudflare KV)
- Link resolution logic

### 10.2 Integration Tests

- Artist page rendering
- Dashboard authentication flow
- Data sync between Spotify and Supabase

### 10.3 E2E Tests

- User journey: Create account → Set up artist page → View page
- Cross-platform link clicking
- Dashboard settings updates

---

## 11. Deployment

### 11.1 Environment

- **Production:** Cloudflare Pages (frontend) + Workers (API)
- **Preview:** Cloudflare Pages preview deployments
- **Database:** Supabase (production project)

### 11.2 CI/CD

- GitHub Actions for:
  - Linting (ESLint)
  - Type checking (TypeScript)
  - Tests (Vitest)
  - Deployment to Cloudflare

### 11.3 Monitoring

- Cloudflare Analytics for page views
- Supabase logs for database queries
- Custom logging for Spotify API errors

---

## 12. Future Enhancements (Post-MVP)

- Real-time Spotify sync via webhooks
- Custom domain support
- Advanced analytics dashboard
- Multi-artist management
- Mobile app for artists
- Integration with other streaming platforms (SoundCloud, Bandcamp)

---

## Approval Checklist

- [ ] System Architecture approved
- [ ] Database Schema approved
- [ ] Artist Page Layout approved
- [ ] Spotify Integration strategy approved
- [ ] Cross-Platform Link Resolution approach approved
- [ ] Artist Dashboard scope approved
- [ ] Monetization strategy approved
- [ ] Implementation Plan approved

---

**Next Steps:**
1. Review this design document
2. Provide feedback/approval
3. I'll run the spec review loop
4. Create implementation plan
