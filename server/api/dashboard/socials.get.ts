import { defineEventHandler } from 'h3'
import { requireUserSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  // TODO: Fetch social links from database
  // const artistId = session.user.artistId
  // const socials = await db.query.artistSocials.findFirst({
  //   where: eq(artistSocials.artistId, artistId)
  // })
  
  // Mock data for now
  return {
    success: true,
    data: {
      instagram: 'https://instagram.com/testartist',
      twitter: 'https://twitter.com/testartist',
      facebook: 'https://facebook.com/testartist',
      youtube: 'https://youtube.com/testartist',
      tiktok: 'https://tiktok.com/@testartist',
      spotify: 'https://open.spotify.com/artist/test'
    }
  }
})