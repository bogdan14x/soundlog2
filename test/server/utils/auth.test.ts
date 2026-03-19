import { describe, it, expect } from 'vitest'
import type { H3Event } from 'h3'
import { requireUserSession } from '../../../server/utils/auth'

describe('requireUserSession', () => {
  const mockEvent: Partial<H3Event> = {
    context: {},
    node: {
      req: {
        url: '/test',
        method: 'GET',
        headers: {}
      } as any,
      res: {} as any
    }
  }

  it('throws 401 Unauthorized error when no session exists', async () => {
    await expect(requireUserSession(mockEvent as H3Event))
      .rejects.toThrow('No access token provided')
  })
  
  it('throws error with correct status code', async () => {
    try {
      await requireUserSession(mockEvent as H3Event)
      expect(true).toBe(false) // Should not reach here
    } catch (error: any) {
      expect(error.statusCode).toBe(401)
      expect(error.statusMessage).toBe('Unauthorized')
    }
  })
})
