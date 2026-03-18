import { vi } from 'vitest'

export const useRuntimeConfig = vi.fn(() => ({
  public: {
    siteUrl: 'http://localhost:3000'
  }
}))
