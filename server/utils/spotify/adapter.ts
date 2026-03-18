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
    if (!artistUri) {
      throw new Error('No artist data found in scraped response')
    }
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
