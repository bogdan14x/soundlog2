import { ZodError } from 'zod'

import { trackPlatforms } from '../../db/schema'
import { linkMatchRequestSchema, matchTrackLinks } from '../../utils/link-matcher'
import { buildProviderCandidates } from '../../utils/link-provider-lookups'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const input = linkMatchRequestSchema.parse(body)
    const platforms = input.platforms ?? [...trackPlatforms]
    const providerCandidates = await buildProviderCandidates(input.track, platforms)

    return matchTrackLinks({
      track: input.track,
      platforms,
      candidatesByPlatform: providerCandidates
    })
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid link match request body',
        data: error.flatten()
      })
    }

    throw error
  }
})
