<template>
  <OnboardingWizard
    :current-step="3"
    :can-continue="selectedArtist !== null"
    :next-button-text="'Continue'"
    @back="goBack"
    @next="goToProfile"
  >
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Select Your Artist</h2>
      <p class="text-gray-600 mb-8">Choose which artist profile you want to manage</p>

      <div class="space-y-4">
        <div
          v-for="artist in artists"
          :key="artist.id"
          @click="selectArtist(artist)"
          class="bg-white rounded-lg shadow p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="{ 'ring-2 ring-blue-500': selectedArtist?.id === artist.id }"
        >
          <div class="flex items-center space-x-4">
            <img
              :src="artist.image || 'https://via.placeholder.com/80'"
              :alt="artist.name"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div class="text-left flex-1">
              <h3 class="font-semibold text-gray-900">{{ artist.name }}</h3>
              <p class="text-sm text-gray-500">{{ artist.followers?.toLocaleString() || 0 }} followers</p>
              <p class="text-xs text-gray-400 mt-1">{{ artist.genres?.join(', ') || 'Unknown genre' }}</p>
            </div>
            <div class="flex-shrink-0">
              <div
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                :class="selectedArtist?.id === artist.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'"
              >
                <svg
                  v-if="selectedArtist?.id === artist.id"
                  class="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="artists.length === 0" class="bg-yellow-50 rounded-lg p-4 mt-4">
        <p class="text-yellow-800">No artists found. Make sure your Spotify account has an artist profile.</p>
      </div>

      <button
        @click="addNewArtist"
        class="mt-6 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        + Add a different artist
      </button>
    </div>
  </OnboardingWizard>
</template>

<script setup>
import { useRouter } from '#imports'

const router = useRouter()

const selectedArtist = ref(null)
const artists = ref([
  {
    id: '1',
    name: 'Test Artist',
    image: 'https://via.placeholder.com/80',
    followers: 12345,
    genres: ['Indie Rock', 'Alternative']
  },
  {
    id: '2',
    name: 'Another Project',
    image: 'https://via.placeholder.com/80',
    followers: 5678,
    genres: ['Electronic', 'Synthpop']
  }
])

const goBack = () => {
  router.push('/onboarding/spotify')
}

const goToProfile = () => {
  if (selectedArtist.value) {
    router.push('/onboarding/profile')
  }
}

const selectArtist = (artist) => {
  selectedArtist.value = artist
}

const addNewArtist = () => {
  // In a real implementation, this would prompt to add a new artist
  console.log('Add new artist clicked')
}
</script>
