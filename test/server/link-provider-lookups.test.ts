import { describe, expect, it, vi } from 'vitest'

import { buildProviderCandidates } from '../../server/utils/link-provider-lookups'

describe('buildProviderCandidates', () => {
  it('maps Deezer search results into matcher candidates', async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const url = input instanceof Request ? input.url : String(input)

      expect(decodeURIComponent(url)).toContain('track:"Hello"')
      expect(decodeURIComponent(url)).toContain('artist:"Adele"')

      return new Response(
        JSON.stringify({
          data: [
            {
              id: 138545995,
              title: 'Hello',
              link: 'https://www.deezer.com/track/138545995',
              isrc: 'GBBKS1500214',
              duration: 295,
              artist: { name: 'Adele' },
              album: { title: '25' }
            }
          ]
        }),
        { status: 200 }
      )
    })

    const candidates = await buildProviderCandidates(
      {
        name: 'Hello',
        artistNames: ['Adele'],
        albumName: '25'
      },
      ['deezer'],
      fetchMock
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(candidates.deezer).toEqual([
      {
        id: '138545995',
        url: 'https://www.deezer.com/track/138545995',
        name: 'Hello',
        artistNames: ['Adele'],
        albumName: '25',
        isrc: 'GBBKS1500214',
        durationMs: 295_000
      }
    ])
  })

  it('uses MusicBrainz enrichment to add a second Deezer query when ISRC is available', async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const url = input instanceof Request ? input.url : String(input)

      if (url.startsWith('https://musicbrainz.org/ws/2/recording?')) {
        return new Response(
          JSON.stringify({
            recordings: [
              {
                title: 'Blow Your Mind (Mwah)',
                length: 178583,
                releases: [{ title: 'Dua Lipa' }],
                'artist-credit': [{ name: 'Dua Lipa' }]
              }
            ]
          }),
          { status: 200 }
        )
      }

      const deezerQuery = new URL(url).searchParams.get('q')

      if (deezerQuery?.includes('track:"Unknown Demo"')) {
        return new Response(JSON.stringify({ data: [] }), { status: 200 })
      }

      if (deezerQuery?.includes('track:"Blow Your Mind (Mwah)"')) {
        return new Response(
          JSON.stringify({
            data: [
              {
                id: 4242,
                title: 'Blow Your Mind (Mwah)',
                link: 'https://www.deezer.com/track/4242',
                isrc: 'GBAHT1600302',
                duration: 179,
                contributors: [{ name: 'Dua Lipa' }],
                album: { title: 'Dua Lipa' }
              }
            ]
          }),
          { status: 200 }
        )
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    const candidates = await buildProviderCandidates(
      {
        name: 'Unknown Demo',
        artistNames: ['Unknown Artist'],
        isrc: 'GBAHT1600302'
      },
      ['deezer'],
      fetchMock
    )

    const requestedUrls = fetchMock.mock.calls.map(([input]) =>
      input instanceof Request ? input.url : String(input)
    )

    expect(requestedUrls.some((url) => url.startsWith('https://musicbrainz.org/ws/2/recording?'))).toBe(true)
    expect(candidates.deezer).toMatchObject([
      {
        id: '4242',
        url: 'https://www.deezer.com/track/4242',
        name: 'Blow Your Mind (Mwah)',
        artistNames: ['Dua Lipa'],
        albumName: 'Dua Lipa',
        isrc: 'GBAHT1600302',
        durationMs: 179_000
      }
    ])
  })

  it('keeps Deezer lookup alive when MusicBrainz enrichment fails', async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const url = input instanceof Request ? input.url : String(input)

      if (url.startsWith('https://musicbrainz.org/ws/2/recording?')) {
        return new Response('upstream failure', { status: 503 })
      }

      return new Response(
        JSON.stringify({
          data: [
            {
              id: 99,
              title: 'Fallback Song',
              link: 'https://www.deezer.com/track/99',
              duration: 180,
              artist: { name: 'Fallback Artist' }
            }
          ]
        }),
        { status: 200 }
      )
    })

    const candidates = await buildProviderCandidates(
      {
        name: 'Fallback Song',
        artistNames: ['Fallback Artist'],
        isrc: 'TEST123'
      },
      ['deezer'],
      fetchMock
    )

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(candidates.deezer).toMatchObject([
      {
        id: '99',
        url: 'https://www.deezer.com/track/99'
      }
    ])
  })
})
