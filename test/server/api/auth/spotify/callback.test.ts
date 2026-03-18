import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, toNodeListener, createRouter } from 'h3'
import http from 'http'

const mockExchangeCode = vi.fn()

vi.mock('../../../../../server/utils/supabase', () => ({
  getSupabaseClient: vi.fn().mockReturnValue({
    auth: {
      exchangeCodeForSession: mockExchangeCode
    }
  })
}))

describe('Spotify OAuth Callback API', () => {
  beforeEach(() => {
    vi.resetModules()
    // Set environment variables
    process.env.SUPABASE_URL = 'https://mock.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key'
    process.env.DATABASE_URL = 'postgres://mock'
    process.env.SPOTIFY_CLIENT_ID = 'mock-spotify-id'
    process.env.SPOTIFY_CLIENT_SECRET = 'mock-spotify-secret'
  })

  it('handles Spotify OAuth callback and creates artist', async () => {
    // Mock Supabase auth client
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          sub: 'spotify-artist-123' // Spotify User ID
        }
      },
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      provider_token: 'mock-spotify-access-token'
    }

    mockExchangeCode.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    // Mock Spotify API response
    vi.doMock('../../../../../server/services/spotify', () => ({
      getSpotifyArtist: vi.fn().mockResolvedValue({
        id: 'spotify-artist-123',
        name: 'Test Artist',
        images: [{ url: 'https://example.com/image.jpg' }]
      })
    }))

    // Mock database operations
    const mockArtist = {
      id: 'artist-123',
      spotifyId: 'user-123', // Supabase user ID
      name: 'Test Artist',
      slug: 'test-artist',
      heroImage: 'https://example.com/image.jpg'
    }

    vi.doMock('../../../../../server/db/client', () => ({
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

    const apiRoute = (await import('../../../../../server/api/auth/spotify/callback')).default

    const app = createApp()
    app.use('/api/auth/spotify/callback', apiRoute)

    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
    const res = await fetch(`http://localhost:${port}/api/auth/spotify/callback?code=mock-code&state=mock-state`, {
      method: 'GET',
      redirect: 'manual'
    })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(302) // Redirect to onboarding
    expect(response.headers.get('location')).toContain('/onboarding')
  })

  it('returns 400 if code is missing', async () => {
    const apiRoute = (await import('../../../../../server/api/auth/spotify/callback')).default

    const app = createApp()
    const router = createRouter()
    router.get('/api/auth/spotify/callback', apiRoute)
    app.use(router)

    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/auth/spotify/callback`, {
          method: 'GET'
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.statusMessage).toBe('Missing code parameter')
  })
})