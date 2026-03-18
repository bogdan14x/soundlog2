import { vi } from 'vitest'

export const useSupabaseClient = vi.fn(() => ({
  auth: {
    signInWithOAuth: vi.fn(),
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  }
}))

export const useRuntimeConfig = vi.fn(() => ({
  public: {
    siteUrl: 'http://localhost:3000'
  }
}))

export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn()
}))

export const defineNuxtRouteMiddleware = (fn: any) => fn
export const navigateTo = vi.fn((path: string) => path)
