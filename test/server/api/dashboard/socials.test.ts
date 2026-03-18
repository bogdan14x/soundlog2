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
})