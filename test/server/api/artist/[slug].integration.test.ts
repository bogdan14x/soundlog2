import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, toNodeListener, createRouter } from 'h3'
import http from 'http'

describe('Artist API Integration', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns scraped data when available', async () => {
    // Mock scraper to return valid data
    vi.doMock('../../../../server/utils/spotify/scraper', () => ({
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

    // Mock API client to ensure it's not called
    vi.doMock('../../../../server/utils/spotify/api-client', () => ({
      getClientCredentialsToken: vi.fn().mockResolvedValue({
        accessToken: 'test-token',
        expiresAt: new Date(Date.now() + 3600000)
      }),
      getArtistAlbums: vi.fn().mockResolvedValue({
        items: []
      })
    }))

    // Mock database client
    vi.doMock('../../../../server/db/client', () => ({
      getDb: vi.fn().mockReturnValue({
        query: {
          artists: {
            findFirst: vi.fn().mockResolvedValue(null)
          }
        }
      })
    }))

    const apiRoute = (await import('../../../../server/api/artist/[slug].get')).default

    const app = createApp()
    const router = createRouter()
    router.get('/api/artist/:slug', apiRoute)
    app.use(router)
    
    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/artist/test-artist`)
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.artist.name).toBe('Test Artist')
  })

  it('falls back to API when scraping fails', async () => {
    // Mock scraper to fail
    vi.doMock('../../../../server/utils/spotify/scraper', () => ({
      scrapeArtistData: vi.fn().mockRejectedValue(new Error('Scrape failed')),
      getCacheKey: (id: string) => `spotify:scrape:${id}`
    }))

    // Mock API client to succeed
    vi.doMock('../../../../server/utils/spotify/api-client', () => ({
      getClientCredentialsToken: vi.fn().mockResolvedValue({
        accessToken: 'test-token',
        expiresAt: new Date(Date.now() + 3600000)
      }),
      getArtistAlbums: vi.fn().mockResolvedValue({
        items: [{ id: 'album1', name: 'Test Album', release_date: '2023-01-01', album_type: 'album', images: [], external_urls: { spotify: 'https://test.com' } }]
      })
    }))

    // Mock database client
    vi.doMock('../../../../server/db/client', () => ({
      getDb: vi.fn().mockReturnValue({
        query: {
          artists: {
            findFirst: vi.fn().mockResolvedValue(null)
          }
        }
      })
    }))

    const apiRoute = (await import('../../../../server/api/artist/[slug].get')).default

    const app = createApp()
    const router = createRouter()
    router.get('/api/artist/:slug', apiRoute)
    app.use(router)
    
    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/artist/test-artist`)
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(200)
  })
})
