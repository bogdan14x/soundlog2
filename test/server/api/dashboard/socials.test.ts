import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, toNodeListener, createRouter } from 'h3'
import http from 'http'

describe('Dashboard Socials API', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('requires authentication', async () => {
    // Mock auth to throw unauthorized error
    vi.doMock('../../../../server/utils/auth', () => ({
      requireUserSession: vi.fn().mockRejectedValue({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Authentication required'
      })
    }))

    const apiRoute = (await import('../../../../server/api/dashboard/socials.put')).default

    const app = createApp()
    const router = createRouter()
    router.put('/api/dashboard/socials', apiRoute)
    app.use(router)
    
    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/dashboard/socials`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instagram: 'https://instagram.com/test' })
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(401)
  })

  it('updates social links successfully', async () => {
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
    const mockUpdatedSettings = {
      id: 'settings-123',
      artistId: 'artist-456',
      socialInstagram: 'https://instagram.com/testartist',
      socialX: 'https://twitter.com/testartist',
      socialFacebook: null,
      socialYouTube: null,
      socialTikTok: null,
      socialSoundCloud: null,
      socialAppleMusic: null,
      socialTidal: null
    }

    vi.doMock('../../../../server/db/client', () => ({
      getDb: vi.fn().mockReturnValue({
        query: {
          artistSettings: {
            findFirst: vi.fn().mockResolvedValue(mockUpdatedSettings)
          }
        },
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockUpdatedSettings])
            })
          })
        })
      })
    }))

    const apiRoute = (await import('../../../../server/api/dashboard/socials.put')).default

    const app = createApp()
    const router = createRouter()
    router.put('/api/dashboard/socials', apiRoute)
    app.use(router)
    
    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/dashboard/socials`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            instagram: 'https://instagram.com/testartist',
            twitter: 'https://twitter.com/testartist'
          })
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.message).toBe('Social links updated successfully')
    expect(data.data.instagram).toBe('https://instagram.com/testartist')
    expect(data.data.twitter).toBe('https://twitter.com/testartist')
  })
})