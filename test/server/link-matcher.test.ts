import { describe, expect, it } from 'vitest'

import { matchTrackLinks } from '../../server/utils/link-matcher'

describe('matchTrackLinks', () => {
  it('constructs a Spotify URL directly from the spotify id', () => {
    const result = matchTrackLinks({
      track: {
        spotifyId: 'spotify-track-id',
        isrc: 'USRC17607841',
        name: 'Lights Down Low',
        artistNames: ['Example Artist']
      },
      candidatesByPlatform: {}
    })

    expect(result.matches.spotify).toMatchObject({
      status: 'resolved',
      matchedCandidateId: 'spotify-track-id',
      url: 'https://open.spotify.com/track/spotify-track-id'
    })
  })

  it('prefers an exact ISRC match over looser metadata matches', () => {
    const result = matchTrackLinks({
      track: {
        spotifyId: 'spotify-track-id',
        isrc: 'USRC17607841',
        name: 'Lights Down Low',
        artistNames: ['Example Artist'],
        albumName: 'After Hours',
        durationMs: 198_000
      },
      candidatesByPlatform: {
        apple_music: [
          {
            id: 'apple-wrong',
            url: 'https://music.apple.com/test-wrong',
            name: 'Lights Down Low',
            artistNames: ['Different Artist'],
            albumName: 'After Hours',
            isrc: 'USRC17607840',
            durationMs: 198_500
          },
          {
            id: 'apple-right',
            url: 'https://music.apple.com/test-right',
            name: 'Lights Down Low (Radio Edit)',
            artistNames: ['Example Artist'],
            albumName: 'After Hours',
            isrc: 'USRC17607841',
            durationMs: 198_500
          }
        ]
      }
    })

    expect(result.matches.apple_music).toMatchObject({
      status: 'resolved',
      matchedCandidateId: 'apple-right',
      url: 'https://music.apple.com/test-right',
      reason: 'Matched by exact ISRC'
    })
  })

  it('falls back to metadata scoring when ISRC is unavailable', () => {
    const result = matchTrackLinks({
      track: {
        name: 'Sunrise Avenue',
        artistNames: ['Chengdu Nights'],
        albumName: 'Neon Summer',
        durationMs: 201_000
      },
      candidatesByPlatform: {
        youtube_music: [
          {
            id: 'yt-wrong',
            url: 'https://music.youtube.com/watch?v=wrong',
            name: 'Sunrise Avenue',
            artistNames: ['Other Band'],
            albumName: 'Neon Summer',
            durationMs: 201_500
          },
          {
            id: 'yt-right',
            url: 'https://music.youtube.com/watch?v=right',
            name: 'Sunrise Avenue',
            artistNames: ['Chengdu Nights'],
            albumName: 'Neon Summer',
            durationMs: 200_500
          }
        ]
      }
    })

    expect(result.matches.youtube_music).toMatchObject({
      status: 'resolved',
      matchedCandidateId: 'yt-right',
      url: 'https://music.youtube.com/watch?v=right'
    })
    expect(result.matches.youtube_music.score).toBeGreaterThanOrEqual(0.72)
  })

  it('fails when the best candidate does not meet the threshold', () => {
    const result = matchTrackLinks({
      track: {
        name: 'Midnight Signals',
        artistNames: ['Chengdu Nights'],
        albumName: 'Neon Summer'
      },
      candidatesByPlatform: {
        tidal: [
          {
            id: 'tidal-wrong',
            url: 'https://tidal.com/browse/track/wrong',
            name: 'Completely Different Song',
            artistNames: ['Another Artist'],
            albumName: 'Elsewhere'
          }
        ]
      }
    })

    expect(result.matches.tidal).toMatchObject({
      status: 'failed',
      matchedCandidateId: null,
      url: null
    })
  })

  it('marks platforms without candidate input as pending', () => {
    const result = matchTrackLinks({
      track: {
        name: 'Midnight Signals',
        artistNames: ['Chengdu Nights']
      },
      candidatesByPlatform: {},
      platforms: ['apple_music', 'deezer']
    })

    expect(result.matches.apple_music).toMatchObject({
      status: 'pending'
    })
    expect(result.matches.deezer).toMatchObject({
      status: 'pending'
    })
    expect(result.matches.tidal).toMatchObject({
      status: 'unsupported'
    })
  })
})
