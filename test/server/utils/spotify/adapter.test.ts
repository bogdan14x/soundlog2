// test/server/utils/spotify/adapter.test.ts
import { describe, it, expect, vi } from 'vitest'
import { SpotifyDataOrchestrator, normalizeScrapedReleases } from '../../../../server/utils/spotify/adapter'

describe('SpotifyDataOrchestrator', () => {
  it('returns normalized data from scraped source', async () => {
    const orchestrator = new SpotifyDataOrchestrator()
    
    // Mock scraper to return valid data
    vi.spyOn(orchestrator as any, 'fetchScrapedData').mockResolvedValue({
      entities: {
        items: {
          'spotify:artist:123': {
            profile: { name: 'Test Artist' },
            discography: { albums: { items: [] }, singles: { items: [] }, compilations: { items: [] } }
          }
        }
      }
    })

    const result = await orchestrator.getArtistData('test-artist', 'US')
    expect(result.artist.name).toBe('Test Artist')
  })

  it('normalizes scraped releases correctly', () => {
    const scrapedRelease = {
      coverArt: { sources: [{ url: 'https://test.com/cover.jpg', height: 300, width: 300 }] },
      date: { year: 2023 },
      name: 'Test Album',
      type: 'ALBUM',
      uri: 'spotify:album:123'
    }

    const normalized = normalizeScrapedReleases([scrapedRelease], 'US')
    expect(normalized).toHaveLength(1)
    expect(normalized[0].name).toBe('Test Album')
    expect(normalized[0].type).toBe('album')
  })
})
