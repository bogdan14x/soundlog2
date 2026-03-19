import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { requireUserSession } from '../../utils/auth'
import { getDb } from '../../db/client'
import { eq } from 'drizzle-orm'
import { artistSettings } from '../../db/schema'

const socialLinksSchema = z.object({
  instagram: z.string().url().or(z.literal('')).optional(),
  twitter: z.string().url().or(z.literal('')).optional(),
  facebook: z.string().url().or(z.literal('')).optional(),
  youtube: z.string().url().or(z.literal('')).optional(),
  tiktok: z.string().url().or(z.literal('')).optional(),
  soundcloud: z.string().url().or(z.literal('')).optional(),
  appleMusic: z.string().url().or(z.literal('')).optional(),
  tidal: z.string().url().or(z.literal('')).optional()
})

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
  
  const db = getDb()
  
  // Check if settings exist for this artist
  const existingSettings = await db.query.artistSettings.findFirst({
    where: eq(artistSettings.artistId, session.user.artistId)
  })

  let updatedSettings
  
  if (existingSettings) {
    // Update existing settings
    updatedSettings = await db.update(artistSettings)
      .set({
        socialInstagram: result.data.instagram || null,
        socialX: result.data.twitter || null,
        socialFacebook: result.data.facebook || null,
        socialYouTube: result.data.youtube || null,
        socialTikTok: result.data.tiktok || null,
        socialSoundCloud: result.data.soundcloud || null,
        socialAppleMusic: result.data.appleMusic || null,
        socialTidal: result.data.tidal || null
      })
      .where(eq(artistSettings.artistId, session.user.artistId))
      .returning()
  } else {
    // Create new settings
    updatedSettings = await db.insert(artistSettings)
      .values({
        artistId: session.user.artistId,
        socialInstagram: result.data.instagram || null,
        socialX: result.data.twitter || null,
        socialFacebook: result.data.facebook || null,
        socialYouTube: result.data.youtube || null,
        socialTikTok: result.data.tiktok || null,
        socialSoundCloud: result.data.soundcloud || null,
        socialAppleMusic: result.data.appleMusic || null,
        socialTidal: result.data.tidal || null
      })
      .returning()
  }
  
  if (!updatedSettings || updatedSettings.length === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update social links',
      message: 'Could not save social links'
    })
  }
  
  return {
    success: true,
    message: 'Social links updated successfully',
    data: {
      instagram: updatedSettings[0].socialInstagram || '',
      twitter: updatedSettings[0].socialX || '',
      facebook: updatedSettings[0].socialFacebook || '',
      youtube: updatedSettings[0].socialYouTube || '',
      tiktok: updatedSettings[0].socialTikTok || '',
      soundcloud: updatedSettings[0].socialSoundCloud || '',
      appleMusic: updatedSettings[0].socialAppleMusic || '',
      tidal: updatedSettings[0].socialTidal || ''
    }
  }
})
