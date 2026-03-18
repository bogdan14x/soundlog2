import { describe, it, expect, vi } from 'vitest'

// Mock the composables
vi.mock('../../app/composables/useAuth', () => ({
  useAuth: vi.fn()
}))

import { useAuth } from '../../app/composables/useAuth'
import { navigateTo } from '#imports'
import authMiddleware from '../../app/middleware/auth'

describe('Auth Middleware', () => {
  it('redirects to /login if user is not authenticated', async () => {
    // Arrange
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: { value: false },
      user: { value: null },
      isLoading: { value: false }
    } as any)

    const mockTo = { path: '/dashboard' } as any
    const mockFrom = { path: '/' } as any

    // Act
    const result = await authMiddleware(mockTo, mockFrom)

    // Assert
    expect(useAuth).toHaveBeenCalled()
    expect(result).toBe('/login')
  })

  it('allows access if user is authenticated', async () => {
    // Arrange
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: { value: true },
      user: { value: { id: '123' } },
      isLoading: { value: false }
    } as any)

    const mockTo = { path: '/dashboard' } as any
    const mockFrom = { path: '/' } as any

    // Act
    const result = await authMiddleware(mockTo, mockFrom)

    // Assert
    expect(useAuth).toHaveBeenCalled()
    expect(result).toBeUndefined()
  })
})
