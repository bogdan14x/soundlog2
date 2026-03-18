import { defineEventHandler, getRouterParam, getHeader } from 'h3'
import { SpotifyDataOrchestrator } from '../../utils/spotify/adapter'
import { getDb } from '../../db/client'
import { eq } from 'drizzle-orm'
import { artists } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    return { statusCode: 400, body: 'Missing slug' }
  }

  const country = (getHeader(event, 'cf-ipcountry') || 
                   getHeader(event, 'x-user-country') || 
                   'US').toUpperCase()

  const orchestrator = new SpotifyDataOrchestrator()
  
  try {
    // Fetch artist data from Spotify
    const artistData = await orchestrator.getArtistData(slug, country)
    
    // Try to find the artist in our database to get ownership info
    const db = getDb()
    const dbArtist = await db.query.artists.findFirst({
      where: eq(artists.slug, slug)
    })
    
    // If found in DB, include the spotifyId (which is the Supabase user ID)
    // This allows the frontend to check if the current user owns this artist
    if (dbArtist) {
      return {
        ...artistData,
        ownership: {
          spotifyId: dbArtist.spotifyId
        }
      }
    }
    
    return artistData
  } catch (error) {
    console.error(`Error fetching artist data for ${slug}:`, error)
    return { statusCode: 500, body: 'Failed to fetch artist data' }
  }
})
