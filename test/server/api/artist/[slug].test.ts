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

// Mock SpotifyDataOrchestrator
vi.mock('../../../../server/utils/spotify/adapter', () => ({
  SpotifyDataOrchestrator: vi.fn().mockImplementation(() => ({
    getArtistData: vi.fn()
  }))
}))

// Import handler AFTER mocking
import handler from '../../../../server/api/artist/[slug].get'

describe('GET /api/artist/:slug', () => {
  let mockEvent: Partial<H3Event>
  let mockOrchestrator: any
  let SpotifyDataOrchestrator: any

  beforeEach(async () => {
    vi.clearAllMocks()
    getRouterParamMock.mockReset()
    getHeaderMock.mockReset()

    // Get the mocked module
    const adapterModule = await import('../../../../server/utils/spotify/adapter')
    SpotifyDataOrchestrator = adapterModule.SpotifyDataOrchestrator
    mockOrchestrator = {
      getArtistData: vi.fn()
    }
    vi.mocked(SpotifyDataOrchestrator).mockImplementation(() => mockOrchestrator)

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

  test('returns artist data when slug is provided', async () => {
    getRouterParamMock.mockReturnValue('test-artist')
    getHeaderMock.mockReturnValue('US')

    const mockArtistData = {
      artist: {
        id: 'artist-123',
        name: 'Test Artist',
        bio: 'Test bio',
        heroImage: 'https://example.com/hero.jpg'
      },
      releases: [
        {
          id: 'album-1',
          name: 'Test Album',
          date: '2024-01-01',
          coverImage: 'https://example.com/cover.jpg',
          type: 'album' as const,
          spotifyUrl: 'https://spotify.com/album/1',
          isAvailableInCurrentMarket: true
        }
      ]
    }

    mockOrchestrator.getArtistData.mockResolvedValue(mockArtistData)

    const result = await handler(mockEvent as H3Event)
    expect(result).toEqual(mockArtistData)
    expect(SpotifyDataOrchestrator).toHaveBeenCalled()
    expect(mockOrchestrator.getArtistData).toHaveBeenCalledWith('test-artist', 'US')
  })

  test('returns 500 when orchestrator throws error', async () => {
    getRouterParamMock.mockReturnValue('test-artist')
    getHeaderMock.mockReturnValue('US')

    mockOrchestrator.getArtistData.mockRejectedValue(new Error('Spotify API error'))

    const result = await handler(mockEvent as H3Event)
    expect(result).toEqual({ statusCode: 500, body: 'Failed to fetch artist data' })
  })

  test('uses cf-ipcountry header when available', async () => {
    getRouterParamMock.mockReturnValue('test-artist')
    getHeaderMock.mockImplementation((event: any, header: string) => {
      if (header === 'cf-ipcountry') return 'GB'
      return undefined
    })

    const mockArtistData = {
      artist: { id: '123', name: 'Test' },
      releases: []
    }
    mockOrchestrator.getArtistData.mockResolvedValue(mockArtistData)

    await handler(mockEvent as H3Event)
    expect(mockOrchestrator.getArtistData).toHaveBeenCalledWith('test-artist', 'GB')
  })

  test('uses x-user-country header when cf-ipcountry is not available', async () => {
    getRouterParamMock.mockReturnValue('test-artist')
    getHeaderMock.mockImplementation((event: any, header: string) => {
      if (header === 'x-user-country') return 'CA'
      return undefined
    })

    const mockArtistData = {
      artist: { id: '123', name: 'Test' },
      releases: []
    }
    mockOrchestrator.getArtistData.mockResolvedValue(mockArtistData)

    await handler(mockEvent as H3Event)
    expect(mockOrchestrator.getArtistData).toHaveBeenCalledWith('test-artist', 'CA')
  })

  test('defaults to US when no country header is provided', async () => {
    getRouterParamMock.mockReturnValue('test-artist')
    getHeaderMock.mockReturnValue(undefined)

    const mockArtistData = {
      artist: { id: '123', name: 'Test' },
      releases: []
    }
    mockOrchestrator.getArtistData.mockResolvedValue(mockArtistData)

    await handler(mockEvent as H3Event)
    expect(mockOrchestrator.getArtistData).toHaveBeenCalledWith('test-artist', 'US')
  })
})
