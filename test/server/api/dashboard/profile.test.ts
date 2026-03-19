import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, toNodeListener, createRouter } from 'h3'
import http from 'http'

describe('Dashboard Profile API', () => {
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

    const apiRoute = (await import('../../../../server/api/dashboard/profile.put')).default

    const app = createApp()
    const router = createRouter()
    router.put('/api/dashboard/profile', apiRoute)
    app.use(router)
    
    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/dashboard/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Test Artist' })
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(401)
  })

  it('updates profile successfully', async () => {
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
    const mockUpdatedArtist = {
      id: 'artist-456',
      name: 'Updated Artist',
      bio: 'Updated bio',
      heroImage: 'https://example.com/updated.jpg'
    }

    vi.doMock('../../../../server/db/client', () => ({
      getDb: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockUpdatedArtist])
            })
          })
        })
      })
    }))

    const apiRoute = (await import('../../../../server/api/dashboard/profile.put')).default

    const app = createApp()
    const router = createRouter()
    router.put('/api/dashboard/profile', apiRoute)
    app.use(router)
    
    const server = http.createServer(toNodeListener(app))
    const response = await new Promise<Response>((resolve) => {
      server.listen(0, async () => {
        const port = (server.address() as any).port
        const res = await fetch(`http://localhost:${port}/api/dashboard/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: 'Updated Artist',
            bio: 'Updated bio',
            heroImage: 'https://example.com/updated.jpg'
          })
        })
        resolve(res)
        server.close()
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.message).toBe('Profile updated successfully')
    expect(data.data.name).toBe('Updated Artist')
  })
})
