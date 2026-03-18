import { defineEventHandler } from 'h3'
import { requireUserSession } from '../../utils/auth'
import { getDb } from '../../db/client'
import { eq } from 'drizzle-orm'
import { artistSettings } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  const db = getDb()
  const settings = await db.query.artistSettings.findFirst({
    where: eq(artistSettings.artistId, session.user.artistId)
  })

  if (!settings) {
    // Return empty social links if no settings exist
    return {
      success: true,
      data: {
        instagram: '',
        twitter: '',
        facebook: '',
        youtube: '',
        tiktok: '',
        soundcloud: '',
        appleMusic: '',
        tidal: ''
      }
    }
  }

  return {
    success: true,
    data: {
      instagram: settings.socialInstagram || '',
      twitter: settings.socialX || '',
      facebook: settings.socialFacebook || '',
      youtube: settings.socialYouTube || '',
      tiktok: settings.socialTikTok || '',
      soundcloud: settings.socialSoundCloud || '',
      appleMusic: settings.socialAppleMusic || '',
      tidal: settings.socialTidal || ''
    }
  }
})