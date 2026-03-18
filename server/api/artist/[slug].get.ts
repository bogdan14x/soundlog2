import { defineEventHandler, getRouterParam, getHeader } from 'h3'
import { SpotifyDataOrchestrator } from '../../utils/spotify/adapter'

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
    const artistData = await orchestrator.getArtistData(slug, country)
    return artistData
  } catch (error) {
    console.error(`Error fetching artist data for ${slug}:`, error)
    return { statusCode: 500, body: 'Failed to fetch artist data' }
  }
})
