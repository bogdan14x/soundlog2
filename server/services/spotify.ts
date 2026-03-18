import { getClientCredentialsToken } from '../utils/spotify/api-client'

export async function getSpotifyArtist(artistId: string) {
  const token = await getClientCredentialsToken()
  const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: {
      Authorization: `Bearer ${token.accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch artist: ${response.statusText}`)
  }

  return response.json()
}