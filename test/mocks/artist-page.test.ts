import { describe, expect, it } from 'vitest'
import { getArtistBySlug, mockArtists } from '../../app/mocks/artist-page'

describe('artist-page mock data', () => {
  it('should return an artist for a valid slug', () => {
    const artist = getArtistBySlug('artist-1')

    expect(artist).toBeDefined()
    expect(artist?.slug).toBe('artist-1')
    expect(artist?.name).toBeDefined()
  })

  it('should return undefined for an invalid slug', () => {
    const artist = getArtistBySlug('non-existent-artist')
    expect(artist).toBeUndefined()
  })

  it('should have a mock artist with required fields', () => {
    const artist = mockArtists[0]
    expect(artist).toBeDefined()
    expect(artist.slug).toBeDefined()
    expect(artist.name).toBeDefined()
    expect(artist.heroImage).toBeDefined()
    expect(artist.featuredRelease).toBeDefined()
    expect(artist.featuredRelease.title).toBeDefined()
    expect(artist.featuredRelease.coverImage).toBeDefined()
    expect(artist.moreReleases).toBeInstanceOf(Array)
  })
})