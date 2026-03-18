import { defineEventHandler, getRouterParam, getHeader } from 'h3'
import { getDb } from '../../db/client'
import { schema, artistIntegrations } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { getArtistAlbums, getClientCredentialsToken, refreshUserToken } from '../../utils/spotify'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    return { statusCode: 400, body: 'Missing slug' }
  }

  // Get country from headers with fallback
  const country = (getHeader(event, 'cf-ipcountry') || 
                   getHeader(event, 'x-user-country') || 
                   'US').toUpperCase()

  const db = getDb()

  // Fetch artist from database
  const artist = await db.query.artists.findFirst({
    where: eq(schema.artists.slug, slug)
  })

  if (!artist) {
    return { statusCode: 404, body: 'Artist not found' }
  }

  // Check for Spotify integration
  const integration = await db.query.artistIntegrations.findFirst({
    where: eq(artistIntegrations.artistId, artist.id)
  })

  let accessToken: string
  let refreshToken: string | undefined

  if (integration && integration.expiresAt > new Date()) {
    // Use stored user token
    accessToken = integration.accessToken
    refreshToken = integration.refreshToken || undefined
  } else if (integration?.refreshToken) {
    // Refresh expired token
    try {
      const newTokens = await refreshUserToken(integration.refreshToken)
      accessToken = newTokens.accessToken
      refreshToken = newTokens.refreshToken
      
      // Update database with new tokens
      await db.update(artistIntegrations)
        .set({
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresAt: newTokens.expiresAt
        })
        .where(eq(artistIntegrations.id, integration.id))
    } catch (error) {
      // Refresh failed, fall back to client credentials
      const clientTokens = await getClientCredentialsToken()
      accessToken = clientTokens.accessToken
    }
  } else {
    // Use client credentials flow
    const clientTokens = await getClientCredentialsToken()
    accessToken = clientTokens.accessToken
  }

  // Fetch albums from Spotify
  const albumsResponse = await getArtistAlbums(artist.spotifyId, accessToken, country)
  
  // Filter albums by available_markets
  const availableAlbums = albumsResponse.items.filter((album: any) => 
    !album.available_markets || album.available_markets.length === 0 || album.available_markets.includes(country)
  )

  // Log filtered albums for analytics
  const filteredCount = albumsResponse.items.length - availableAlbums.length
  if (filteredCount > 0) {
    console.log(`Filtered out ${filteredCount} albums for artist ${artist.id} in market ${country}`)
  }

  // Transform to internal format
  const releases = availableAlbums.map((album: any) => ({
    id: album.id,
    name: album.name,
    releaseDate: album.release_date,
    coverImage: album.images[0]?.url,
    type: album.album_type,
    spotifyUrl: album.external_urls.spotify,
    isAvailableInCurrentMarket: true
  }))

  return {
    artist: {
      id: artist.id,
      name: artist.name,
      bio: artist.bio,
      heroImage: artist.heroImage
    },
    releases
  }
})
