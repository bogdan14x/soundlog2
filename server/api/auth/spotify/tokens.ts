import { defineEventHandler, readBody, sendError, createError } from 'h3'
import { requireUserSession } from '../../../utils/auth'
import { getDb } from '../../../db/client'
import { artistIntegrations } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  // Validate user session
  const session = await requireUserSession(event)

  // Read request body
  const body = await readBody(event)

  // Validate required fields
  if (!body.accessToken) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Access token is required'
    }))
  }

  // Calculate expiration time
  const expiresIn = body.expiresIn || 3600
  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  // Prepare integration data
  const integrationData = {
    artistId: session.user.artistId,
    provider: 'spotify' as const,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken || null,
    expiresAt: expiresAt
  }

  // Insert or update artist integration in database
  const db = getDb()
  const [insertedIntegration] = await db.insert(artistIntegrations)
    .values(integrationData)
    .onConflictDoUpdate({
      target: [artistIntegrations.artistId, artistIntegrations.provider],
      set: {
        accessToken: integrationData.accessToken,
        refreshToken: integrationData.refreshToken,
        expiresAt: integrationData.expiresAt
      }
    })
    .returning()

  return {
    success: true,
    integration: insertedIntegration
  }
})