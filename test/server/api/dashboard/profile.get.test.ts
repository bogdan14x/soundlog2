import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, toNodeListener, createRouter } from 'h3'
import http from 'http'

describe('GET /api/dashboard/profile', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns profile data for authenticated user', async () => {
    // Mock auth to return a session
    vi.doMock('../../../../server/utils/auth', () => ({
      requireUserSession: vi.fn().mockResolvedValue({
        user: {
          id: 'user-123',
          artistId: 'artist-456'
        }
      })
    }))

    // Mock the database client
    const mockArtist = {
      id: 'artist-456',
      name: 'Test Artist',
      bio: 'Test bio',
      heroImage: 'https://example.com/image.jpg'
    }

    vi.doMock('../../../../server/db/client', () => ({
      getDb: vi.fn().mockReturnValue({
        query: {
          artists: {
            findFirst: vi.fn().mockResolvedValue(mockArtist)
          }
        }
      })
    }))

    const apiRoute = (await import('../../../../server/api/dashboard/profile.get')).default

    const app = createApp()
    const router = createRouter()
    router.get('/api/dashboard/profile', apiRoute)
    app.use(router)

    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/dashboard/profile`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual({
      name: 'Test Artist',
      bio: 'Test bio',
      heroImage: 'https://example.com/image.jpg'
    })
  })
})