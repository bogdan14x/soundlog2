import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'

const socialLinksSchema = z.record(z.string().url().or(z.literal('')))

export default defineEventHandler(async (event) => {
  // TODO: Add authentication check
  // const session = await requireUserSession(event)
  
  const body = await readBody(event)
  const result = socialLinksSchema.safeParse(body)
  
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid social links data',
      data: result.error.issues
    })
  }
  
  // TODO: Update artist settings in database
  // const artistId = session.user.artistId
  // await db.update(artistSettings).set(result.data).where(eq(artistSettings.artistId, artistId))
  
  return {
    success: true,
    message: 'Social links updated successfully',
    data: result.data
  }
})
