<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useFetch } from 'nuxt/app'
import { computed } from 'vue'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import HeroSection from '../components/artist/HeroSection.vue'
import FeaturedRelease from '../components/artist/FeaturedRelease.vue'
import ReleasesGrid from '../components/artist/ReleasesGrid.vue'
import TourDates from '../components/artist/TourDates.vue'
import RadioShows from '../components/artist/RadioShows.vue'
import NewsletterCTA from '../components/artist/NewsletterCTA.vue'
import SocialLinks from '../components/artist/SocialLinks.vue'
import PageFooter from '../components/artist/PageFooter.vue'
import { useAuth } from '../composables/useAuth'

dayjs.extend(utc)
dayjs.extend(timezone)

const route = useRoute()
const slug = route.params.slug as string
const { user } = useAuth()

// Detect country using dayjs
const detectedCountry = dayjs.tz.guess()
// Simple mapping of timezone to country code (simplified)
const countryMap: Record<string, string> = {
  'America/New_York': 'US',
  'Europe/London': 'GB',
  // Add more mappings as needed
}
const countryCode = countryMap[detectedCountry] || 'US'

// Fetch artist data from API
const { data: apiData, error } = await useFetch(`/api/artist/${slug}`, {
  headers: {
    'x-user-country': countryCode
  }
})

// Type definitions for API response
interface ApiRelease {
  id: string
  name: string
  date: string
  coverImage: string
  type: string
  spotifyUrl: string
  isAvailableInCurrentMarket: boolean
}

interface ApiArtist {
  id: string
  name: string
  bio: string | null
  heroImage: string | null
}

interface ApiSuccessResponse {
  artist: ApiArtist
  releases: ApiRelease[]
  ownership?: {
    spotifyId: string
  }
}

interface ApiErrorResponse {
  statusCode: number
  body: string
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse

// Transform API data to match component expectations
const artistData = computed(() => {
  if (!apiData.value) return null
  
  // Check if API returned an error response
  const response = apiData.value as ApiResponse
  if ('statusCode' in response) {
    return null
  }
  
  const { artist, releases } = response as ApiSuccessResponse
  
  // Use first release as featured release
  const featuredRelease = releases[0] ? {
    title: releases[0].name,
    date: releases[0].date,
    coverImage: releases[0].coverImage,
    platformLinks: { spotify: releases[0].spotifyUrl }
  } : null
  
  // Use remaining releases as "more releases"
  const moreReleases = releases.slice(1).map((release: ApiRelease) => ({
    title: release.name,
    date: release.date,
    coverImage: release.coverImage,
    platformLinks: { spotify: release.spotifyUrl }
  }))
  
  return {
    ...artist,
    bio: artist.bio || '',
    heroImage: artist.heroImage || '',
    featuredRelease,
    moreReleases,
    tourDates: [], // API doesn't provide this
    radioShows: [], // API doesn't provide this
    newsletterUrl: undefined, // API doesn't provide this
    socialLinks: {} // API doesn't provide this
  }
})

// Check if current user owns this artist
const isOwner = computed(() => {
  if (!user.value || !apiData.value) return false
  
  const response = apiData.value as ApiResponse
  if ('statusCode' in response || !('ownership' in response)) {
    return false
  }
  
  return response.ownership?.spotifyId === user.value.id
})

// Set page title
useHead({
  title: artistData.value ? `${artistData.value.name} - SoundLog` : 'Artist - SoundLog'
})
</script>

<template>
  <div v-if="artistData">
    <HeroSection 
      :name="artistData.name" 
      :bio="artistData.bio" 
      :heroImage="artistData.heroImage" 
    />
    
    <!-- Edit Button for Owners -->
    <div v-if="isOwner" class="fixed bottom-6 right-6 z-50">
      <NuxtLink 
        to="/dashboard/profile" 
        class="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Edit Profile
      </NuxtLink>
    </div>
    
    <section v-if="artistData.featuredRelease" class="py-12 px-4 max-w-6xl mx-auto">
      <FeaturedRelease 
        :title="artistData.featuredRelease.title"
        :date="artistData.featuredRelease.date"
        :coverImage="artistData.featuredRelease.coverImage"
        :platformLinks="artistData.featuredRelease.platformLinks"
      />
    </section>
    
    <section v-if="artistData.moreReleases.length > 0" class="py-12 px-4 max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">More Releases</h2>
      <ReleasesGrid :releases="artistData.moreReleases" />
    </section>
    
    <section v-if="artistData.tourDates && artistData.tourDates.length > 0" class="py-12 px-4 max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">Tour Dates</h2>
      <TourDates :dates="artistData.tourDates" />
    </section>
    
    <section v-if="artistData.radioShows && artistData.radioShows.length > 0" class="py-12 px-4 max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">Radio Shows</h2>
      <RadioShows :shows="artistData.radioShows" />
    </section>
    
    <section v-if="artistData.newsletterUrl" class="py-12 px-4 max-w-6xl mx-auto">
      <NewsletterCTA :url="artistData.newsletterUrl" />
    </section>
    
    <section v-if="Object.keys(artistData.socialLinks).length > 0" class="py-12 px-4 max-w-6xl mx-auto">
      <SocialLinks :links="artistData.socialLinks" />
    </section>
    
    <PageFooter />
  </div>
  
  <div v-else-if="error" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">Error Loading Artist</h1>
      <p class="text-lg">{{ error.message }}</p>
    </div>
  </div>
  
  <div v-else-if="!error" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">404 - Artist Not Found</h1>
      <p class="text-lg">The artist you're looking for doesn't exist.</p>
    </div>
  </div>
</template>
