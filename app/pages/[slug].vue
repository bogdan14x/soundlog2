<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getArtistBySlug } from '../mocks/artist-page'
import HeroSection from '../components/artist/HeroSection.vue'
import FeaturedRelease from '../components/artist/FeaturedRelease.vue'
import ReleasesGrid from '../components/artist/ReleasesGrid.vue'
import TourDates from '../components/artist/TourDates.vue'
import RadioShows from '../components/artist/RadioShows.vue'
import NewsletterCTA from '../components/artist/NewsletterCTA.vue'
import SocialLinks from '../components/artist/SocialLinks.vue'
import PageFooter from '../components/artist/PageFooter.vue'

const route = useRoute()
const slug = route.params.slug as string
const artist = getArtistBySlug(slug)

// Set page title
if (artist) {
  useHead({
    title: `${artist.name} - SoundLog`
  })
}
</script>

<template>
  <div v-if="artist">
    <HeroSection 
      :name="artist.name" 
      :bio="artist.bio" 
      :heroImage="artist.heroImage" 
    />
    
    <section class="py-12 px-4 max-w-6xl mx-auto">
      <FeaturedRelease 
        :title="artist.featuredRelease.title"
        :date="artist.featuredRelease.date"
        :coverImage="artist.featuredRelease.coverImage"
        :platformLinks="artist.featuredRelease.platformLinks"
      />
    </section>
    
    <section class="py-12 px-4 max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">More Releases</h2>
      <ReleasesGrid :releases="artist.moreReleases" />
    </section>
    
    <section v-if="artist.tourDates && artist.tourDates.length > 0" class="py-12 px-4 max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">Tour Dates</h2>
      <TourDates :dates="artist.tourDates" />
    </section>
    
    <section v-if="artist.radioShows && artist.radioShows.length > 0" class="py-12 px-4 max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">Radio Shows</h2>
      <RadioShows :shows="artist.radioShows" />
    </section>
    
    <section class="py-12 px-4 max-w-6xl mx-auto">
      <NewsletterCTA :url="artist.newsletterUrl" />
    </section>
    
    <section class="py-12 px-4 max-w-6xl mx-auto">
      <SocialLinks :links="artist.socialLinks" />
    </section>
    
    <PageFooter />
  </div>
  
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">404 - Artist Not Found</h1>
      <p class="text-lg">The artist you're looking for doesn't exist.</p>
    </div>
  </div>
</template>
