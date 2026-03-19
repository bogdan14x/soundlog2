import { z } from 'zod'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!

const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  refresh_token: z.string().optional()
})

// In-memory token cache
let clientToken: { token: string; expiresAt: number } | null = null

export function clearClientTokenCache(): void {
  clientToken = null
}

export async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Check if it's a rate limit error (429)
      if (error instanceof Error && error.message.includes('429') && i < maxRetries) {
        const delay = baseDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error
      }
    }
  }

  throw lastError!
}

export async function getClientCredentialsToken(): Promise<{ accessToken: string; expiresAt: Date }> {
  if (clientToken && clientToken.expiresAt > Date.now()) {
    return { accessToken: clientToken.token, expiresAt: new Date(clientToken.expiresAt) }
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.statusText}`)
  }

  const data = tokenResponseSchema.parse(await response.json())
  const expiresAt = Date.now() + data.expires_in * 1000

  clientToken = { token: data.access_token, expiresAt }

  return { accessToken: data.access_token, expiresAt: new Date(expiresAt) }
}

export async function refreshUserToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`)
  }

  const data = tokenResponseSchema.parse(await response.json())
  const expiresAt = Date.now() + data.expires_in * 1000

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: new Date(expiresAt)
  }
}

export async function getArtistAlbums(artistId: string, accessToken: string, market: string) {
  return exponentialBackoff(async () => {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&market=${market}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        // 10s timeout
        signal: AbortSignal.timeout(10000)
      }
    )

    if (response.status === 429) {
      throw new Error(`Rate limited: ${response.statusText}`)
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch albums: ${response.statusText}`)
    }

    return response.json()
  })
}