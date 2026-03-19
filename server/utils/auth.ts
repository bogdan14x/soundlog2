import { createError, getCookie, type H3Event } from 'h3'
import { getSupabaseClient } from './supabase'
import { getDb } from '../db/client'
import { eq } from 'drizzle-orm'
import { artists } from '../db/schema'

export interface UserSession {
  user: {
    id: string
    artistId: string
    onboardingCompleted: boolean
  }
}

export async function requireUserSession(event: H3Event): Promise<UserSession> {
  // Get the access token from the cookie
  const accessToken = getCookie(event, 'sb-access-token')
  
  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'No access token provided'
    })
  }

  try {
    // Validate the token with Supabase
    const supabase = getSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Invalid access token'
      })
    }

    // Get the artist associated with this user
    const db = getDb()
    const artist = await db.query.artists.findFirst({
      where: eq(artists.spotifyId, user.id)
    })

    if (!artist) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Artist not found',
        message: 'No artist profile found for this user'
      })
    }

    return {
      user: {
        id: user.id,
        artistId: artist.id,
        onboardingCompleted: artist.onboardingCompleted ?? false
      }
    }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Failed to validate session'
    })
  }
}
