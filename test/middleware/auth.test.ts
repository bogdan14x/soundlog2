import { beforeEach, describe, expect, it } from 'vitest'
import { mockSupabaseUser } from '../mocks/imports'
import authMiddleware from '../../app/middleware/auth'

describe('auth middleware', () => {
  beforeEach(() => {
    mockSupabaseUser.value = null
  })

  it('redirects unauthenticated users to /login', async () => {
    const result = await authMiddleware({ path: '/dashboard' } as any, { path: '/' } as any)

    expect(result).toBe('/login')
  })

  it('allows authenticated users through', async () => {
    mockSupabaseUser.value = { id: 'user-1' }

    const result = await authMiddleware({ path: '/dashboard' } as any, { path: '/' } as any)

    expect(result).toBeUndefined()
  })
})
