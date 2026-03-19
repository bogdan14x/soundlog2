import { defineEventHandler, readBody, sendError, createError } from 'h3'
import { requireUserSession } from '../../utils/auth'
import { getDb } from '../../db/client'
import { artists } from '../../db/schema'

export default defineEventHandler(async (event) => {
  // Validate user session
  const session = await requireUserSession(event)

  // Read request body
  const body = await readBody(event)

  // Validate required fields
  if (!body.name || !body.name.trim()) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Artist name is required'
    }))
  }

  // Generate slug from artist name
  const slug = body.name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  // Prepare artist data
  const artistData = {
    spotifyId: session.user.id,
    name: body.name.trim(),
    slug: slug,
    bio: body.bio || null,
    heroImage: body.heroImage || null
  }

  // Insert or update artist in database
  const db = getDb()
  const [insertedArtist] = await db.insert(artists)
    .values(artistData)
    .onConflictDoUpdate({
      target: artists.spotifyId,
      set: {
        name: artistData.name,
        slug: artistData.slug,
        bio: artistData.bio,
        heroImage: artistData.heroImage
      }
    })
    .returning()

  return {
    success: true,
    artist: insertedArtist
  }
})