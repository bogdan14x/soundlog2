import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

// Mock h3 functions BEFORE importing the handler
const getRouterParamMock = vi.fn()
const getHeaderMock = vi.fn()

vi.mock('h3', () => ({
  defineEventHandler: vi.fn((fn) => fn),
  getRouterParam: (...args: any[]) => getRouterParamMock(...args),
  getHeader: (...args: any[]) => getHeaderMock(...args)
}))

// Mock Spotify utils
vi.mock('../../../../server/utils/spotify', () => ({
  getClientCredentialsToken: vi.fn(),
  refreshUserToken: vi.fn(),
  getArtistAlbums: vi.fn(),
  clearClientTokenCache: vi.fn()
}))

vi.mock('../../../../server/db/client', () => ({
  getDb: vi.fn()
}))

import { getDb } from '../../../../server/db/client'
import { schema, artistIntegrations } from '../../../../server/db/schema'
import { clearClientTokenCache } from '../../../../server/utils/spotify'
import { getClientCredentialsToken, refreshUserToken, getArtistAlbums } from '../../../../server/utils/spotify'

// Import handler AFTER mocking
import handler from '../../../../server/api/artist/[slug].get'

describe('GET /api/artist/:slug', () => {
  let mockDb: any
  let mockEvent: Partial<H3Event>

  beforeEach(() => {
    vi.clearAllMocks()
    clearClientTokenCache()
    getRouterParamMock.mockReset()
    getHeaderMock.mockReset()

    // Mock database
    mockDb = {
      query: {
        artists: {
          findFirst: vi.fn()
        },
        artistIntegrations: {
          findFirst: vi.fn()
        }
      },
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined)
    }
    vi.mocked(getDb).mockReturnValue(mockDb)

    // Mock event
    mockEvent = {
      context: {},
      node: {
        req: {
          url: '/api/artist/test-artist',
          method: 'GET',
          headers: {}
        } as any,
        res: {} as any
      }
    }
  })

  test('returns 400 when slug is missing', async () => {
    getRouterParamMock.mockReturnValue(undefined)

    const result = await handler(mockEvent as H3Event)
    expect(result).toEqual({ statusCode: 400, body: 'Missing slug' })
  })

  test('returns 404 when artist not found', async () => {
    getRouterParamMock.mockReturnValue('test-artist')
    getHeaderMock.mockReturnValue('US')
    mockDb.query.artists.findFirst.mockResolvedValue(undefined)

    const result = await handler(mockEvent as H3Event)
    expect(result).toEqual({ statusCode: 404, body: 'Artist not found' })
  })

  test('fetches albums with client credentials when no integration exists', async () => {
    const artistId = 'test-artist-id'
    getRouterParamMock.mockReturnValue('test-artist')
    getHeaderMock.mockReturnValue('US')
    mockDb.query.artists.findFirst.mockResolvedValue({
      id: artistId,
      slug: 'test-artist',
      spotifyId: 'spotify-123',
      name: 'Test Artist'
    })
    mockDb.query.artistIntegrations.findFirst.mockResolvedValue(undefined)

    // Mock Spotify API responses
    vi.mocked(getClientCredentialsToken).mockResolvedValue({
      accessToken: 'mock-token',
      expiresAt: new Date(Date.now() + 3600000)
    })

    vi.mocked(getArtistAlbums).mockResolvedValue({
      items: [
        {
          id: 'album-1',
          name: 'Test Album',
          release_date: '2024-01-01',
          images: [{ url: 'https://example.com/cover.jpg' }],
          album_type: 'album',
          external_urls: { spotify: 'https://spotify.com/album/1' },
          available_markets: ['US', 'GB']
        },
        {
          id: 'album-2',
          name: 'Another Album',
          release_date: '2024-02-01',
          images: [{ url: 'https://example.com/cover2.jpg' }],
          album_type: 'single',
          external_urls: { spotify: 'https://spotify.com/album/2' },
          available_markets: ['GB'] // Not available in US
        }
      ]
    })

    const result = await handler(mockEvent as H3Event)

    expect(getClientCredentialsToken).toHaveBeenCalled()
    expect(getArtistAlbums).toHaveBeenCalledWith('spotify-123', 'mock-token', 'US')
    
    // Should filter out album-2 since it's not available in US
    expect(result.releases).toHaveLength(1)
    expect(result.releases[0].id).toBe('album-1')
    expect(result.releases[0].isAvailableInCurrentMarket).toBe(true)
  })

  test('refreshes expired user token', async () => {
    const artistId = 'test-artist-id-2'
    getRouterParamMock.mockReturnValue('test-artist-2')
    getHeaderMock.mockReturnValue('US')
    mockDb.query.artists.findFirst.mockResolvedValue({
      id: artistId,
      slug: 'test-artist-2',
      spotifyId: 'spotify-456',
      name: 'Test Artist 2'
    })

    // Mock expired integration
    const expiresAt = new Date(Date.now() - 3600000) // 1 hour ago
    mockDb.query.artistIntegrations.findFirst.mockResolvedValue({
      id: 'integration-id',
      artistId,
      provider: 'spotify',
      accessToken: 'old-token',
      refreshToken: 'refresh-token',
      expiresAt
    })

    vi.mocked(refreshUserToken).mockResolvedValue({
      accessToken: 'new-token',
      refreshToken: 'new-refresh-token',
      expiresAt: new Date(Date.now() + 3600000)
    })

    vi.mocked(getArtistAlbums).mockResolvedValue({
      items: []
    })

    await handler(mockEvent as H3Event)

    expect(refreshUserToken).toHaveBeenCalledWith('refresh-token')
    expect(getArtistAlbums).toHaveBeenCalledWith('spotify-456', 'new-token', 'US')
  })
})
