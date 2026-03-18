import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { requireUserSession } from '../../utils/auth'

const socialLinksSchema = z.record(z.string(), z.union([z.string().url(), z.literal('')]))

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
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
