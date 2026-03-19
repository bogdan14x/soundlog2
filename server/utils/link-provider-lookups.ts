import type { TrackPlatform } from '../db/schema'
import type { LinkMatchCandidate, LinkMatchTrack } from './link-matcher'

type FetchLike = typeof fetch

type CandidateMap = Partial<Record<TrackPlatform, LinkMatchCandidate[]>>

type MusicBrainzRecordingSearchResponse = {
  recordings?: Array<{
    title?: string
    length?: number | null
    isrcs?: string[]
    releases?: Array<{ title?: string }>
    'artist-credit'?: Array<{ name?: string }>
  }>
}

type DeezerSearchResponse = {
  data?: Array<{
    id: number
    title: string
    link: string
    isrc?: string | null
    duration?: number
    artist?: { name?: string }
    contributors?: Array<{ name?: string }>
    album?: { title?: string }
  }>
}

const requestTimeoutMs = 8_000
const musicBrainzUserAgent = 'SoundLogLinkMatcher/0.1 (humans@conductor.build)'

function createTimeoutSignal() {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    return AbortSignal.timeout(requestTimeoutMs)
  }

  return undefined
}

async function fetchJson<T>(
  fetchImpl: FetchLike,
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetchImpl(url, {
    ...init,
    signal: init.signal ?? createTimeoutSignal(),
    headers: {
      accept: 'application/json',
      ...init.headers
    }
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

function quoteSearchTerm(value: string) {
  return `"${value.replace(/"/g, '').trim()}"`
}

function buildDeezerQuery(track: LinkMatchTrack) {
  const parts = [`track:${quoteSearchTerm(track.name)}`]
  const primaryArtist = track.artistNames[0]

  if (primaryArtist) {
    parts.push(`artist:${quoteSearchTerm(primaryArtist)}`)
  }

  if (track.albumName) {
    parts.push(`album:${quoteSearchTerm(track.albumName)}`)
  }

  return parts.join(' ')
}

function buildTrackFingerprint(track: LinkMatchTrack) {
  return [track.name, track.artistNames.join('|'), track.albumName ?? '', track.isrc ?? '']
    .map((part) => part.trim().toLowerCase())
    .join('::')
}

function buildCandidateQueries(tracks: LinkMatchTrack[]) {
  const queries = new Set<string>()
  const seenFingerprints = new Set<string>()

  for (const track of tracks) {
    const fingerprint = buildTrackFingerprint(track)

    if (seenFingerprints.has(fingerprint)) {
      continue
    }

    seenFingerprints.add(fingerprint)
    queries.add(buildDeezerQuery(track))
  }

  return [...queries]
}

function mapDeezerTrackToCandidate(track: NonNullable<DeezerSearchResponse['data']>[number]): LinkMatchCandidate {
  const artistNames =
    track.contributors?.map((artist) => artist.name?.trim()).filter((name): name is string => Boolean(name)) ??
    []

  const fallbackArtistName = track.artist?.name?.trim()

  return {
    id: String(track.id),
    url: track.link,
    name: track.title,
    artistNames: artistNames.length > 0 ? artistNames : fallbackArtistName ? [fallbackArtistName] : ['Unknown Artist'],
    albumName: track.album?.title?.trim() || undefined,
    isrc: track.isrc?.trim() || undefined,
    durationMs: track.duration ? track.duration * 1_000 : undefined
  }
}

async function lookupMusicBrainzTrack(
  track: LinkMatchTrack,
  fetchImpl: FetchLike
): Promise<LinkMatchTrack | null> {
  if (!track.isrc) {
    return null
  }

  const params = new URLSearchParams({
    query: `isrc:${track.isrc}`,
    fmt: 'json',
    limit: '1'
  })

  const response = await fetchJson<MusicBrainzRecordingSearchResponse>(
    fetchImpl,
    `https://musicbrainz.org/ws/2/recording?${params.toString()}`,
    {
      headers: {
        'User-Agent': musicBrainzUserAgent
      }
    }
  )

  const recording = response.recordings?.[0]

  if (!recording?.title) {
    return null
  }

  const artistNames =
    recording['artist-credit']
      ?.map((artist) => artist.name?.trim())
      .filter((name): name is string => Boolean(name)) ?? []

  return {
    ...track,
    name: recording.title.trim() || track.name,
    artistNames: artistNames.length > 0 ? artistNames : track.artistNames,
    albumName: recording.releases?.[0]?.title?.trim() || track.albumName || undefined,
    durationMs: recording.length ?? track.durationMs ?? undefined
  }
}

async function lookupDeezerCandidates(
  trackVariants: LinkMatchTrack[],
  fetchImpl: FetchLike
): Promise<LinkMatchCandidate[]> {
  const candidateMap = new Map<string, LinkMatchCandidate>()
  const queries = buildCandidateQueries(trackVariants)

  for (const query of queries) {
    const params = new URLSearchParams({
      q: query,
      limit: '5'
    })

    const response = await fetchJson<DeezerSearchResponse>(
      fetchImpl,
      `https://api.deezer.com/search/track?${params.toString()}`
    )

    for (const track of response.data ?? []) {
      const candidate = mapDeezerTrackToCandidate(track)
      candidateMap.set(candidate.id, candidate)
    }
  }

  return [...candidateMap.values()]
}

export async function buildProviderCandidates(
  track: LinkMatchTrack,
  platforms: TrackPlatform[],
  fetchImpl: FetchLike = fetch
): Promise<CandidateMap> {
  const candidates: CandidateMap = {}

  if (!platforms.includes('deezer')) {
    return candidates
  }

  const trackVariants = [track]

  try {
    const musicBrainzTrack = await lookupMusicBrainzTrack(track, fetchImpl)

    if (musicBrainzTrack) {
      trackVariants.push(musicBrainzTrack)
    }
  } catch {
    // MusicBrainz is best-effort enrichment; Deezer lookup should still proceed.
  }

  try {
    candidates.deezer = await lookupDeezerCandidates(trackVariants, fetchImpl)
  } catch {
    candidates.deezer = []
  }

  return candidates
}
