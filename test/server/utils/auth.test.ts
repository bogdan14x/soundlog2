import { describe, it, expect } from 'vitest'
import { requireUserSession } from '../../../server/utils/auth'

describe('requireUserSession', () => {
  it('throws error when no session exists', async () => {
    const event = { context: {} }
    await expect(requireUserSession(event)).rejects.toThrow('Unauthorized')
  })
})
