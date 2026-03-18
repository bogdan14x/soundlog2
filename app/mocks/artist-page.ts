import { z } from 'zod'

// Zod schema for runtime validation
const MockArtistSchema = z.object({
  slug: z.string(),
  name: z.string(),
  bio: z.string(),
  heroImage: z.string(),
  socialLinks: z.record(z.string(), z.string()),
  featuredRelease: z.object({
    title: z.string(),
    date: z.string(),
    coverImage: z.string(),
    platformLinks: z.record(z.string(), z.string())
  }),
  moreReleases: z.array(
    z.object({
      title: z.string(),
      date: z.string(),
      coverImage: z.string(),
    platformLinks: z.record(z.string(), z.string())
    })
  ),
  tourDates: z.array(
    z.object({
      date: z.string(),
      venue: z.string(),
      location: z.string(),
      ticketLink: z.string().optional()
    })
  ).optional(),
  radioShows: z.array(
    z.object({
      title: z.string(),
      episode: z.string(),
      playLink: z.string()
    })
  ).optional(),
  newsletterUrl: z.string().optional()
})

export type MockArtist = z.infer<typeof MockArtistSchema>

// Mock data array
export const mockArtists: MockArtist[] = [
  {
    slug: 'test-artist',
    name: 'Test Artist',
    bio: 'A test artist bio for testing purposes.',
    heroImage: '/images/hero.jpg',
    socialLinks: {
      instagram: 'https://instagram.com/testartist',
      twitter: 'https://twitter.com/testartist'
    },
    featuredRelease: {
      title: 'Featured Album',
      date: '2023-01-01',
      coverImage: '/images/cover.jpg',
      platformLinks: {
        spotify: 'https://open.spotify.com/album/123',
        appleMusic: 'https://music.apple.com/album/123'
      }
    },
    moreReleases: [
      {
        title: 'Old Album',
        date: '2022-01-01',
        coverImage: '/images/old-cover.jpg',
        platformLinks: {
          spotify: 'https://open.spotify.com/album/456'
        }
      }
    ],
    tourDates: [
      {
        date: '2023-12-01',
        venue: 'Test Venue',
        location: 'Test City',
        ticketLink: 'https://tickets.example.com'
      }
    ],
    radioShows: [
      {
        title: 'Test Radio Show',
        episode: 'Episode 1',
        playLink: 'https://radio.example.com/play/1'
      }
    ],
    newsletterUrl: 'https://newsletter.example.com'
  }
]

// Function to get artist by slug
export function getArtistBySlug(slug: string): MockArtist | undefined {
  const artist = mockArtists.find(a => a.slug === slug)
  
  if (artist) {
    // Validate the artist data against the schema
    const parsed = MockArtistSchema.safeParse(artist)
    if (!parsed.success) {
      console.error('Invalid artist data for slug:', slug, parsed.error.issues)
      return undefined
    }
    return parsed.data
  }
  
  return undefined
}