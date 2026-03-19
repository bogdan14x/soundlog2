// test/server/utils/spotify/api-client.test.ts
import { describe, it, expect, vi } from 'vitest'
import { getArtistAlbums, getClientCredentialsToken, exponentialBackoff } from '../../../../server/utils/spotify/api-client'

describe('Spotify API Client', () => {
  it('getClientCredentialsToken returns access token', async () => {
    // Mock fetch to return a token
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'test-token', expires_in: 3600, token_type: 'Bearer' })
    })

    const result = await getClientCredentialsToken()
    expect(result).toBeDefined()
    expect(result.accessToken).toBe('test-token')
  })

  it('getArtistAlbums filters by market', async () => {
    // Mock fetch to return albums
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ id: 'album1', name: 'Test Album' }] })
    })

    const result = await getArtistAlbums('artist123', 'token', 'US')
    expect(result.items).toHaveLength(1)
  })

  it('exponentialBackoff retries on rate limit', async () => {
    let attempts = 0
    global.fetch = vi.fn().mockImplementation(() => {
      attempts++
      if (attempts < 3) {
        return Promise.resolve({ ok: false, status: 429 })
      }
      return Promise.resolve({ ok: true, json: async () => ({ access_token: 'test', expires_in: 3600 }) })
    })

    const result = await exponentialBackoff(async () => {
      const res = await fetch('https://test.com')
      if (!res.ok) throw new Error('Rate limited: 429')
      return res
    }, 3)

    expect(attempts).toBe(3)
  })
})