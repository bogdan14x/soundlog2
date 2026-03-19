import { defineEventHandler, getQuery, sendError, createError } from 'h3'
import { getSupabaseClient } from '../../../utils/supabase'
import { getDb } from '../../../db/client'
import { getSpotifyArtist } from '../../../services/spotify'
import { artists, artistIntegrations } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { code, state } = query

  if (!code) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Missing code parameter' }))
  }

  const supabase = getSupabaseClient()
  
  // Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code as string)

  if (error || !data.session) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Authentication failed', message: error?.message }))
  }

  const session = data.session
  const userId = session.user.id

  // Get Spotify User ID from metadata
  const spotifyUserId = session.user.user_metadata?.sub || session.user.user_metadata?.spotify_id
  
  if (!spotifyUserId) {
    // Try to fetch from /me if not in metadata
    const providerToken = session.provider_token
    if (!providerToken) {
        return sendError(event, createError({ statusCode: 500, statusMessage: 'Missing Spotify access token' }))
    }
    
    try {
        const meResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${providerToken}` }
        })
        if (!meResponse.ok) {
            throw new Error('Failed to fetch Spotify user')
        }
        const meData = await meResponse.json()
        // Use the fetched ID
        await processArtist(meData.id, session)
    } catch (err) {
        return sendError(event, createError({ statusCode: 500, statusMessage: 'Failed to fetch Spotify user' }))
    }
  } else {
    await processArtist(spotifyUserId, session)
  }

  // Redirect to onboarding
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/onboarding"></head></html>`
  return new Response(html, {
    status: 302,
    headers: {
      'Location': '/onboarding',
      'Content-Type': 'text/html'
    }
  })
})

async function processArtist(spotifyUserId: string, session: any) {
  // Fetch Spotify artist data
  const artistData = await getSpotifyArtist(spotifyUserId)
  
  // Insert/update artist in DB
  const db = getDb()
  
  // Generate a slug from artist name
  const slug = artistData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  // Insert artist with Supabase user ID as spotifyId (to match auth.ts)
  const newArtist = {
    spotifyId: session.user.id, // Supabase user ID
    name: artistData.name,
    slug: slug,
    heroImage: artistData.images?.[0]?.url,
  }
  
  // Upsert artist
  const [insertedArtist] = await db.insert(artists)
    .values(newArtist)
    .onConflictDoUpdate({
      target: artists.spotifyId,
      set: {
        name: newArtist.name,
        slug: newArtist.slug,
        heroImage: newArtist.heroImage
      }
    })
    .returning()
    
  // Insert/update artist integration
  if (session.provider_token && session.provider_refresh_token) {
    await db.insert(artistIntegrations)
      .values({
        artistId: insertedArtist.id,
        provider: 'spotify',
        accessToken: session.provider_token,
        refreshToken: session.provider_refresh_token,
        expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour from now
      })
      .onConflictDoUpdate({
        target: [artistIntegrations.artistId, artistIntegrations.provider],
        set: {
          accessToken: session.provider_token,
          refreshToken: session.provider_refresh_token,
          expiresAt: new Date(Date.now() + 3600 * 1000)
        }
      })
  }
}