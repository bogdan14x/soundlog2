import { beforeEach, describe, expect, it } from 'vitest'
import { mockSupabaseUser } from '../mocks/imports'
import guestMiddleware from '../../app/middleware/guest'

describe('guest middleware', () => {
  beforeEach(() => {
    mockSupabaseUser.value = null
  })

  it('allows guests to access /login', async () => {
    const result = await guestMiddleware({ path: '/login' } as any, { path: '/' } as any)

    expect(result).toBeUndefined()
  })

  it('redirects authenticated users to /dashboard', async () => {
    mockSupabaseUser.value = { id: 'user-1' }

    const result = await guestMiddleware({ path: '/login' } as any, { path: '/' } as any)

    expect(result).toBe('/dashboard')
  })
})
