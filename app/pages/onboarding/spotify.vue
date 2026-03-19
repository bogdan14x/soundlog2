<template>
  <OnboardingWizard
    :current-step="2"
    :can-continue="hasConnectedSpotify"
    :next-button-text="'Continue'"
    @back="goBack"
    @next="goToArtist"
  >
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Connect Your Spotify Account</h2>
      <p class="text-gray-600 mb-8">Link your Spotify artist account to create your page</p>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div v-if="!hasConnectedSpotify" class="space-y-4">
          <p class="text-gray-700">We'll use your Spotify account to import your artist data, releases, and updates automatically.</p>
          
          <button
            @click="connectSpotify"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1DB954] hover:bg-[#1ed760] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1DB954]"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect with Spotify
          </button>

          <p class="text-sm text-gray-500">
            By connecting, you agree to let SoundLog access your Spotify artist profile and music data.
          </p>
        </div>

        <div v-else class="flex items-center justify-center py-4">
          <div class="flex items-center text-green-600">
            <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-lg font-medium">Spotify Connected!</span>
          </div>
        </div>
      </div>

      <div v-if="artistData" class="bg-blue-50 rounded-lg p-4 text-left">
        <h3 class="font-semibold text-blue-900 mb-2">Artist Found:</h3>
        <div class="flex items-center space-x-3">
          <img
            v-if="artistData.images?.[0]"
            :src="artistData.images[0].url"
            :alt="artistData.name"
            class="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p class="font-medium text-blue-900">{{ artistData.name }}</p>
            <p class="text-sm text-blue-700">{{ artistData.followers?.total?.toLocaleString() }} followers</p>
          </div>
        </div>
      </div>
    </div>
  </OnboardingWizard>
</template>

<script setup>
import { useRouter, useSupabaseClient } from '#imports'
import { useRuntimeConfig } from '#app'

const router = useRouter()
const supabaseClient = useSupabaseClient()
const runtimeConfig = useRuntimeConfig()

const hasConnectedSpotify = ref(false)
const artistData = ref(null)

const goBack = () => {
  router.push('/onboarding')
}

const goToArtist = () => {
  if (hasConnectedSpotify.value) {
    router.push('/onboarding/artist')
  }
}

const connectSpotify = async () => {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'spotify',
    options: {
      redirectTo: `${runtimeConfig.public.siteUrl}/onboarding/spotify`
    }
  })

  if (error) {
    console.error('Spotify OAuth error:', error)
    return
  }

  // In a real implementation, we would handle the callback and store tokens
  // For now, we'll simulate successful connection
  hasConnectedSpotify.value = true
  artistData.value = {
    name: 'Test Artist',
    images: [{ url: 'https://via.placeholder.com/100' }],
    followers: { total: 12345 }
  }
}
</script>
