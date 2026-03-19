// Simple in-memory cache (replace with Cloudflare KV in production)
const cacheStore = new Map<string, { value: any; expiresAt: number }>()

export function createCache() {
  return {
    async get(key: string): Promise<any | null> {
      const item = cacheStore.get(key)
      if (!item) return null
      if (Date.now() > item.expiresAt) {
        cacheStore.delete(key)
        return null
      }
      return item.value
    },

    async set(key: string, value: any, options: { ttl: number }): Promise<void> {
      cacheStore.set(key, {
        value,
        expiresAt: Date.now() + (options.ttl * 1000)
      })
    }
  }
}
