import { defineEventHandler } from 'h3'
import { requireUserSession } from '../../utils/auth'
import { getDb } from '../../db/client'
import { eq } from 'drizzle-orm'
import { artists } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  const db = getDb()
  const artist = await db.query.artists.findFirst({
    where: eq(artists.id, session.user.artistId)
  })

  if (!artist) {
    return {
      success: false,
      error: 'Artist not found'
    }
  }

  return {
    success: true,
    data: {
      name: artist.name,
      bio: artist.bio || '',
      heroImage: artist.heroImage || '',
      onboardingCompleted: artist.onboardingCompleted
    }
  }
})