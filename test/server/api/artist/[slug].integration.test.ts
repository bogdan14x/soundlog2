import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock h3 before importing the handler
vi.mock('h3', () => ({
  defineEventHandler: vi.fn((fn) => fn),
  getRouterParam: vi.fn((event, name) => {
    if (name === 'slug') return 'test-artist'
    return undefined
  }),
  getHeader: vi.fn((event, name) => {
    if (name === 'cf-ipcountry') return 'US'
    return undefined
  })
}))

// Create a mock cache store
const mockCacheStore = new Map<string, { value: any; expiresAt: number }>()

// Mock the cache client
vi.mock('../../../../server/cache/client', () => ({
  createCache: () => ({
    async get(key: string): Promise<any | null> {
      const item = mockCacheStore.get(key)
      if (!item) return null
      if (Date.now() > item.expiresAt) {
        mockCacheStore.delete(key)
        return null
      }
      return item.value
    },
    async set(key: string, value: any, options: { ttl: number }): Promise<void> {
      mockCacheStore.set(key, {
        value,
        expiresAt: Date.now() + (options.ttl * 1000)
      })
    }
  })
}))

// Mock the scraper module
vi.mock('../../../../server/utils/spotify/scraper', () => ({
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
  getCacheKey: vi.fn((id: string) => `spotify:scrape:${id}`)
}))

// Mock the API client module
vi.mock('../../../../server/utils/spotify/api-client', () => ({
  getClientCredentialsToken: vi.fn().mockResolvedValue({
    accessToken: 'test-token',
    expiresAt: new Date(Date.now() + 3600000)
  }),
  getArtistAlbums: vi.fn().mockResolvedValue({
    items: [{ id: 'album1', name: 'Test Album', release_date: '2023-01-01', album_type: 'album', images: [], external_urls: { spotify: 'https://test.com' } }]
  })
}))

import apiRoute from '../../../../server/api/artist/[slug].get'

describe('Artist API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear the cache between tests
    mockCacheStore.clear()
  })

  it('returns scraped data when available', async () => {
    const mockEvent = { context: {} }
    const result = await apiRoute(mockEvent)
    
    expect(result).toHaveProperty('artist')
    expect(result.artist.name).toBe('Test Artist')
  })

  it('falls back to API when scraping fails', async () => {
    // Import the mocked modules to modify their behavior
    const scraperModule = await import('../../../../server/utils/spotify/scraper')
    const apiClientModule = await import('../../../../server/utils/spotify/api-client')
    
    const scrapeArtistDataMock = scraperModule.scrapeArtistData as any
    const getClientCredentialsTokenMock = apiClientModule.getClientCredentialsToken as any
    const getArtistAlbumsMock = apiClientModule.getArtistAlbums as any
    
    // Mock scraper to fail
    scrapeArtistDataMock.mockRejectedValue(new Error('Scrape failed'))
    
    // Ensure API client succeeds
    getClientCredentialsTokenMock.mockResolvedValue({
      accessToken: 'test-token',
      expiresAt: new Date(Date.now() + 3600000)
    })
    
    getArtistAlbumsMock.mockResolvedValue({
      items: [{ id: 'album1', name: 'Test Album', release_date: '2023-01-01', album_type: 'album', images: [], external_urls: { spotify: 'https://test.com' } }]
    })

    const mockEvent = { context: {} }
    const result = await apiRoute(mockEvent)
    
    expect(result).toHaveProperty('artist')
    // Verify that the API client was called (fallback happened)
    expect(getClientCredentialsTokenMock).toHaveBeenCalled()
    expect(getArtistAlbumsMock).toHaveBeenCalled()
  })
})
