export function getCacheKey(artistId: string): string {
  return `spotify:scrape:${artistId}`
}

export async function scrapeArtistData(slug: string): Promise<any> {
  const url = `https://open.spotify.com/artist/${slug}`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    // 10s timeout
    signal: AbortSignal.timeout(10000)
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch artist page: ${response.statusText}`)
  }

  const html = await response.text()
  
  // Extract initial state from script tag
  const scriptMatch = html.match(/<script id="initial-state">(.+?)<\/script>/)
  if (!scriptMatch) {
    throw new Error('Could not find initial-state script tag')
  }

  try {
    return JSON.parse(scriptMatch[1])
  } catch (error) {
    throw new Error('Failed to parse initial state JSON')
  }
}
