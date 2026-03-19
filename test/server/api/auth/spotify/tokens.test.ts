import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, toNodeListener, createRouter } from 'h3'
import http from 'http'

describe('Spotify Tokens API', () => {
  beforeEach(() => {
    vi.resetModules()
    // Set environment variables
    process.env.SUPABASE_URL = 'https://mock.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key'
    process.env.DATABASE_URL = 'postgres://mock'
  })

  it('saves Spotify tokens to database', async () => {
    // Mock database operations
    const mockIntegration = {
      id: 'integration-123',
      artistId: 'artist-123',
      provider: 'spotify',
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600 * 1000)
    }

    vi.doMock('../../../../../server/db/client', () => ({
      getDb: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            onConflictDoUpdate: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockIntegration])
            })
          })
        })
      })
    }))

    // Mock auth utility
    vi.doMock('../../../../../server/utils/auth', () => ({
      requireUserSession: vi.fn().mockResolvedValue({
        user: {
          id: 'user-123',
          artistId: 'artist-123',
          onboardingCompleted: false
        }
      })
    }))

    const apiRoute = (await import('../../../../../server/api/auth/spotify/tokens')).default

    const app = createApp()
    const router = createRouter()
    router.post('/api/auth/spotify/tokens', apiRoute)
    app.use(router)

    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/auth/spotify/tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'sb-access-token=mock-token'
          },
          body: JSON.stringify({
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600
          })
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.integration.provider).toBe('spotify')
  })

  it('returns 401 when not authenticated', async () => {
    // Mock database operations (even though it shouldn't be called)
    vi.doMock('../../../../../server/db/client', () => ({
      getDb: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            onConflictDoUpdate: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([])
            })
          })
        })
      })
    }))

    vi.doMock('../../../../../server/utils/auth', () => ({
      requireUserSession: vi.fn().mockRejectedValue({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'No access token provided'
      })
    }))

    const apiRoute = (await import('../../../../../server/api/auth/spotify/tokens')).default

    const app = createApp()
    const router = createRouter()
    router.post('/api/auth/spotify/tokens', apiRoute)
    app.use(router)

    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/auth/spotify/tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
          })
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(401)
  })

  it('returns 400 when access token is missing', async () => {
    // Mock database operations (even though it shouldn't be called)
    vi.doMock('../../../../../server/db/client', () => ({
      getDb: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            onConflictDoUpdate: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([])
            })
          })
        })
      })
    }))

    vi.doMock('../../../../../server/utils/auth', () => ({
      requireUserSession: vi.fn().mockResolvedValue({
        user: {
          id: 'user-123',
          artistId: 'artist-123',
          onboardingCompleted: false
        }
      })
    }))

    const apiRoute = (await import('../../../../../server/api/auth/spotify/tokens')).default

    const app = createApp()
    const router = createRouter()
    router.post('/api/auth/spotify/tokens', apiRoute)
    app.use(router)

    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/auth/spotify/tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'sb-access-token=mock-token'
          },
          body: JSON.stringify({
            refreshToken: 'mock-refresh-token'
          })
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.statusMessage).toBe('Access token is required')
  })
})