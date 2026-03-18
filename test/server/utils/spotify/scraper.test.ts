import { describe, it, expect, vi } from 'vitest'
import { scrapeArtistData, getCacheKey } from '../../../../server/utils/spotify/scraper'

describe('Spotify Scraper', () => {
  it('extracts initial state from HTML', async () => {
    // Mock fetch to return HTML with initial state
    const html = `
      <html>
        <script id="initial-state">{"entities":{"items":{}}}</script>
      </html>
    `
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => html
    })

    const result = await scrapeArtistData('test-artist')
    expect(result).toBeDefined()
    expect(result.entities).toBeDefined()
  })

  it('generates correct cache key', () => {
    const key = getCacheKey('1Cs0zKBU1kc0i8ypK3B9ai')
    expect(key).toBe('spotify:scrape:1Cs0zKBU1kc0i8ypK3B9ai')
  })

  it('throws error on rate limit', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    })

    await expect(scrapeArtistData('test-artist')).rejects.toThrow('Failed to fetch artist page')
  })
})
