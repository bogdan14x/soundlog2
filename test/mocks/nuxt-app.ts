import { vi } from 'vitest'
import { ref } from 'vue'

export const useFetch = vi.fn((url, options) => {
  // Return mock data based on the URL
  if (url.includes('/api/artist/')) {
    const slug = url.split('/').pop()
    return {
      data: ref({
        artist: {
          id: 'artist-123',
          name: 'Test Artist',
          bio: 'Test bio',
          heroImage: 'https://example.com/hero.jpg'
        },
        releases: [],
        ownership: {
          spotifyId: 'user-123'
        }
      }),
      error: ref(null),
      pending: ref(false),
      refresh: vi.fn(),
      execute: vi.fn()
    }
  }
  
  return {
    data: ref(null),
    error: ref(null),
    pending: ref(false),
    refresh: vi.fn(),
    execute: vi.fn()
  }
})

export const useRuntimeConfig = vi.fn(() => ({
  public: {
    siteUrl: 'http://localhost:3000'
  }
}))
