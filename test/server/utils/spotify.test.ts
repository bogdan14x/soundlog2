import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  getClientCredentialsToken,
  refreshUserToken,
  getArtistAlbums,
  clearClientTokenCache
} from '../../../server/utils/spotify/api-client'

describe('Spotify Client Module', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Clear the module cache to reset the clientToken
    vi.resetModules()
    // Also clear the in-memory cache
    clearClientTokenCache()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getClientCredentialsToken', () => {
    it('should return an access token and expiration date', async () => {
      const mockTokenResponse = {
        access_token: 'mock-access-token',
        expires_in: 3600,
        token_type: 'Bearer'
      }

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockTokenResponse
      }))

      const result = await getClientCredentialsToken()

      expect(result.accessToken).toBe('mock-access-token')
      expect(result.expiresAt).toBeInstanceOf(Date)
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now())

      expect(fetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expect.stringMatching(/^Basic /)
          }),
          body: 'grant_type=client_credentials'
        })
      )
    })

    it('should handle API errors', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Bad Request'
      }))

      await expect(getClientCredentialsToken()).rejects.toThrow('Spotify auth failed: Bad Request')
    })
  })

  describe('refreshUserToken', () => {
    it('should refresh a user token successfully', async () => {
      const mockTokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer'
      }

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockTokenResponse
      }))

      const result = await refreshUserToken('old-refresh-token')

      expect(result.accessToken).toBe('new-access-token')
      expect(result.refreshToken).toBe('new-refresh-token')
      expect(result.expiresAt).toBeInstanceOf(Date)

      expect(fetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expect.stringMatching(/^Basic /)
          }),
          body: 'grant_type=refresh_token&refresh_token=old-refresh-token'
        })
      )
    })

    it('should handle API errors', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized'
      }))

      await expect(refreshUserToken('invalid-token')).rejects.toThrow('Token refresh failed: Unauthorized')
    })
  })

  describe('getArtistAlbums', () => {
    it('should fetch artist albums with correct parameters', async () => {
      const mockAlbumsResponse = {
        items: [
          { id: 'album1', name: 'Album One' },
          { id: 'album2', name: 'Album Two' }
        ]
      }

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockAlbumsResponse
      }))

      const result = await getArtistAlbums('artist123', 'bearer-token', 'US')

      expect(result).toEqual(mockAlbumsResponse)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/artists/artist123/albums?limit=50&market=US',
        expect.objectContaining({
          headers: { Authorization: 'Bearer bearer-token' },
          signal: expect.any(AbortSignal)
        })
      )
    })

    it('should handle API errors', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      }))

      await expect(getArtistAlbums('invalid-artist', 'token', 'US')).rejects.toThrow('Failed to fetch albums: Not Found')
    })
  })
})
