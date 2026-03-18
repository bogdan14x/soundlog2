import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, toNodeListener, createRouter } from 'h3'
import http from 'http'

describe('Onboarding Artist API', () => {
  beforeEach(() => {
    vi.resetModules()
    // Set environment variables
    process.env.SUPABASE_URL = 'https://mock.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key'
    process.env.DATABASE_URL = 'postgres://mock'
  })

  it('creates artist profile with valid data', async () => {
    // Mock database operations
    const mockArtist = {
      id: 'artist-123',
      spotifyId: 'user-123',
      name: 'Test Artist',
      slug: 'test-artist',
      bio: 'Test bio',
      heroImage: 'https://example.com/image.jpg',
      onboardingCompleted: false
    }

    vi.doMock('../../../../server/db/client', () => ({
      getDb: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            onConflictDoUpdate: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockArtist])
            })
          })
        })
      })
    }))

    // Mock auth utility
    vi.doMock('../../../../server/utils/auth', () => ({
      requireUserSession: vi.fn().mockResolvedValue({
        user: {
          id: 'user-123',
          artistId: 'artist-123',
          onboardingCompleted: false
        }
      })
    }))

    const apiRoute = (await import('../../../../server/api/onboarding/artist')).default

    const app = createApp()
    const router = createRouter()
    router.post('/api/onboarding/artist', apiRoute)
    app.use(router)

    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/onboarding/artist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'sb-access-token=mock-token'
          },
          body: JSON.stringify({
            name: 'Test Artist',
            bio: 'Test bio',
            heroImage: 'https://example.com/image.jpg'
          })
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.artist.id).toBe('artist-123')
    expect(data.artist.name).toBe('Test Artist')
  })

  it('returns 401 when not authenticated', async () => {
    vi.doMock('../../../../server/utils/auth', () => ({
      requireUserSession: vi.fn().mockRejectedValue({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'No access token provided'
      })
    }))

    const apiRoute = (await import('../../../../server/api/onboarding/artist')).default

    const app = createApp()
    const router = createRouter()
    router.post('/api/onboarding/artist', apiRoute)
    app.use(router)

    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/onboarding/artist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Test Artist'
          })
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(401)
  })

  it('returns 400 when name is missing', async () => {
    vi.doMock('../../../../server/utils/auth', () => ({
      requireUserSession: vi.fn().mockResolvedValue({
        user: {
          id: 'user-123',
          artistId: 'artist-123',
          onboardingCompleted: false
        }
      })
    }))

    const apiRoute = (await import('../../../../server/api/onboarding/artist')).default

    const app = createApp()
    const router = createRouter()
    router.post('/api/onboarding/artist', apiRoute)
    app.use(router)

    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/onboarding/artist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'sb-access-token=mock-token'
          },
          body: JSON.stringify({
            bio: 'Test bio'
          })
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.statusMessage).toBe('Artist name is required')
  })
})