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
    // Return default settings if none exist
    return {
      success: true,
      data: {
        newsletterUrl: '',
        upgradePrompt: true
      }
    }
  }

  return {
    success: true,
    data: {
      newsletterUrl: settings.newsletterUrl || '',
      upgradePrompt: settings.upgradePrompt
    }
  }
})
