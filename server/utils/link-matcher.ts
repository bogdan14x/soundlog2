import { z } from 'zod'

import {
  trackPlatforms,
  type ReleaseResolutionStatus,
  type TrackPlatform
} from '../db/schema'

const artistSchema = z.string().trim().min(1)

const trackSchema = z.object({
  spotifyId: z.string().trim().min(1).optional(),
  isrc: z.string().trim().min(1).optional().nullable(),
  name: z.string().trim().min(1),
  artistNames: z.array(artistSchema).min(1),
  albumName: z.string().trim().min(1).optional().nullable(),
  durationMs: z.number().int().positive().optional().nullable()
})

const candidateSchema = z.object({
  id: z.string().trim().min(1),
  url: z.string().url(),
  name: z.string().trim().min(1),
  artistNames: z.array(artistSchema).min(1),
  albumName: z.string().trim().min(1).optional().nullable(),
  isrc: z.string().trim().min(1).optional().nullable(),
  durationMs: z.number().int().positive().optional().nullable()
})

const candidatesByPlatformShape = Object.fromEntries(
  trackPlatforms.map((platform) => [platform, z.array(candidateSchema).optional()])
) as Record<TrackPlatform, z.ZodOptional<z.ZodArray<typeof candidateSchema>>>

export const linkMatchInputSchema = z.object({
  track: trackSchema,
  candidatesByPlatform: z.object(candidatesByPlatformShape).partial().default({}),
  platforms: z.array(z.enum(trackPlatforms)).min(1).optional()
})

export const linkMatchRequestSchema = z.object({
  track: trackSchema,
  platforms: z.array(z.enum(trackPlatforms)).min(1).optional()
})

export type LinkMatchTrack = z.infer<typeof trackSchema>
export type LinkMatchCandidate = z.infer<typeof candidateSchema>
export type LinkMatchInput = z.infer<typeof linkMatchInputSchema>
export type LinkMatchRequest = z.infer<typeof linkMatchRequestSchema>

export type LinkMatchResult = {
  status: ReleaseResolutionStatus
  score: number | null
  reason: string
  url: string | null
  matchedCandidateId: string | null
}

export type LinkMatchResponse = {
  matches: Record<TrackPlatform, LinkMatchResult>
}

const exactMatchScore = 1
const metadataThreshold = 0.72

type CandidateScore = {
  score: number
  reason: string
}

function normalizeValue(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(feat|ft|featuring)\b.*$/g, '')
    .replace(/\((.*?)\)|\[(.*?)\]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value: string) {
  const normalized = normalizeValue(value)

  if (!normalized) {
    return new Set<string>()
  }

  return new Set(normalized.split(' '))
}

function calculateJaccardScore(left: Set<string>, right: Set<string>) {
  if (left.size === 0 || right.size === 0) {
    return 0
  }

  let intersectionSize = 0

  for (const token of left) {
    if (right.has(token)) {
      intersectionSize += 1
    }
  }

  return intersectionSize / (left.size + right.size - intersectionSize)
}

function calculateStringScore(left: string | null | undefined, right: string | null | undefined) {
  if (!left || !right) {
    return null
  }

  const normalizedLeft = normalizeValue(left)
  const normalizedRight = normalizeValue(right)

  if (!normalizedLeft || !normalizedRight) {
    return null
  }

  if (normalizedLeft === normalizedRight) {
    return exactMatchScore
  }

  if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) {
    return 0.92
  }

  return calculateJaccardScore(tokenize(left), tokenize(right))
}

function calculateArtistsScore(targetArtists: string[], candidateArtists: string[]) {
  if (targetArtists.length === 0 || candidateArtists.length === 0) {
    return null
  }

  const totalScore = targetArtists.reduce((sum, targetArtist) => {
    const bestCandidateScore = candidateArtists.reduce((bestScore, candidateArtist) => {
      const score = calculateStringScore(targetArtist, candidateArtist) ?? 0
      return Math.max(bestScore, score)
    }, 0)

    return sum + bestCandidateScore
  }, 0)

  return totalScore / targetArtists.length
}

function calculateDurationScore(
  targetDurationMs: number | null | undefined,
  candidateDurationMs: number | null | undefined
) {
  if (!targetDurationMs || !candidateDurationMs) {
    return null
  }

  const difference = Math.abs(targetDurationMs - candidateDurationMs)

  if (difference <= 2_000) {
    return exactMatchScore
  }

  if (difference <= 5_000) {
    return 0.85
  }

  if (difference <= 10_000) {
    return 0.6
  }

  return 0
}

function createResult(
  status: ReleaseResolutionStatus,
  reason: string,
  options: {
    score?: number | null
    url?: string | null
    matchedCandidateId?: string | null
  } = {}
): LinkMatchResult {
  return {
    status,
    score: options.score ?? null,
    reason,
    url: options.url ?? null,
    matchedCandidateId: options.matchedCandidateId ?? null
  }
}

function scoreCandidate(track: LinkMatchTrack, candidate: LinkMatchCandidate): CandidateScore {
  const normalizedTrackIsrc = track.isrc ? normalizeValue(track.isrc) : null
  const normalizedCandidateIsrc = candidate.isrc ? normalizeValue(candidate.isrc) : null

  if (normalizedTrackIsrc && normalizedCandidateIsrc) {
    if (normalizedTrackIsrc !== normalizedCandidateIsrc) {
      return {
        score: 0,
        reason: 'Rejected because ISRC values differ'
      }
    }

    return {
      score: exactMatchScore,
      reason: 'Matched by exact ISRC'
    }
  }

  const weightedScores = [
    { weight: 0.45, score: calculateStringScore(track.name, candidate.name) },
    { weight: 0.35, score: calculateArtistsScore(track.artistNames, candidate.artistNames) },
    { weight: 0.1, score: calculateStringScore(track.albumName, candidate.albumName) },
    { weight: 0.1, score: calculateDurationScore(track.durationMs, candidate.durationMs) }
  ].filter((entry) => entry.score !== null)

  if (weightedScores.length === 0) {
    return {
      score: 0,
      reason: 'Insufficient metadata to score candidate'
    }
  }

  const totalWeight = weightedScores.reduce((sum, entry) => sum + entry.weight, 0)
  const score = weightedScores.reduce((sum, entry) => sum + entry.weight * (entry.score ?? 0), 0) / totalWeight

  return {
    score,
    reason: `Matched by metadata score ${score.toFixed(2)}`
  }
}

function buildSpotifyResult(track: LinkMatchTrack) {
  if (!track.spotifyId) {
    return createResult('pending', 'Spotify track id is required to construct a Spotify URL')
  }

  return createResult('resolved', 'Constructed Spotify URL from spotifyId', {
    score: exactMatchScore,
    url: `https://open.spotify.com/track/${track.spotifyId}`,
    matchedCandidateId: track.spotifyId
  })
}

function matchPlatform(
  platform: TrackPlatform,
  track: LinkMatchTrack,
  candidates: LinkMatchCandidate[] | undefined
) {
  if (platform === 'spotify') {
    return buildSpotifyResult(track)
  }

  if (!candidates) {
    return createResult('pending', 'No candidates supplied for platform')
  }

  if (candidates.length === 0) {
    return createResult('failed', 'No candidates found for platform', {
      score: 0
    })
  }

  const bestCandidate = candidates
    .map((candidate) => ({
      candidate,
      match: scoreCandidate(track, candidate)
    }))
    .sort((left, right) => right.match.score - left.match.score)[0]

  if (!bestCandidate || bestCandidate.match.score < metadataThreshold) {
    return createResult('failed', 'No candidate met the metadata threshold', {
      score: bestCandidate?.match.score ?? 0
    })
  }

  return createResult('resolved', bestCandidate.match.reason, {
    score: bestCandidate.match.score,
    url: bestCandidate.candidate.url,
    matchedCandidateId: bestCandidate.candidate.id
  })
}

export function matchTrackLinks(input: LinkMatchInput): LinkMatchResponse {
  const platforms = input.platforms ?? [...trackPlatforms]

  const matches = trackPlatforms.reduce<Record<TrackPlatform, LinkMatchResult>>((result, platform) => {
    result[platform] = platforms.includes(platform)
      ? matchPlatform(platform, input.track, input.candidatesByPlatform[platform])
      : createResult('unsupported', 'Platform not requested for this matching run')

    return result
  }, {} as Record<TrackPlatform, LinkMatchResult>)

  return { matches }
}
