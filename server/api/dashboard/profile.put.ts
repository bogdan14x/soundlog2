import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { requireUserSession } from '../../utils/auth'
import { getDb } from '../../db/client'
import { eq } from 'drizzle-orm'
import { artists } from '../../db/schema'

const profileSchema = z.object({
  name: z.string().min(1).max(200),
  bio: z.string().max(1000).optional(),
  heroImage: z.string().url().optional()
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  const body = await readBody(event)
  const result = profileSchema.safeParse(body)
  
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid profile data',
      data: result.error.issues
    })
  }
  
  const db = getDb()
  const updatedArtist = await db.update(artists)
    .set(result.data)
    .where(eq(artists.id, session.user.artistId))
    .returning()
  
  if (!updatedArtist || updatedArtist.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Artist not found',
      message: 'Could not update profile'
    })
  }
  
  return {
    success: true,
    message: 'Profile updated successfully',
    data: updatedArtist[0]
  }
})
