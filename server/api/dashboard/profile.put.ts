import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { requireUserSession } from '../../utils/auth'

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
  
  // TODO: Update artist in database
  // const artistId = session.user.artistId
  // await db.update(artists).set(result.data).where(eq(artists.id, artistId))
  
  return {
    success: true,
    message: 'Profile updated successfully',
    data: result.data
  }
})
