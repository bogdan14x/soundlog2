import { defineEventHandler, sendError, createError } from 'h3'
import { requireUserSession } from '../../utils/auth'
import { getDb } from '../../db/client'
import { artists } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Validate user session
  const session = await requireUserSession(event)

  // Update artist onboarding status
  const db = getDb()
  const [updatedArtist] = await db.update(artists)
    .set({ onboardingCompleted: true })
    .where(eq(artists.id, session.user.artistId))
    .returning()

  if (!updatedArtist) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: 'Artist not found',
      message: 'Could not find artist profile'
    }))
  }

  return {
    success: true,
    artist: updatedArtist
  }
})