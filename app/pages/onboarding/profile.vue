<template>
  <OnboardingWizard
    :current-step="4"
    :can-continue="isFormValid"
    :next-button-text="'Complete Setup'"
    :hide-skip="true"
    @back="goBack"
    @next="completeOnboarding"
  >
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Set Up Your Profile</h2>
      <p class="text-gray-600 mb-8">Customize how your artist page will look</p>

      <div class="bg-white rounded-lg shadow p-6 space-y-6 text-left">
        <!-- Profile Image -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
          <div class="flex items-center space-x-4">
            <img
              :src="formData.image || 'https://via.placeholder.com/100'"
              alt="Profile preview"
              class="w-20 h-20 rounded-full object-cover"
            />
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Change Image
            </button>
          </div>
        </div>

        <!-- Artist Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Artist Name</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your artist name"
          />
        </div>

        <!-- Bio -->
        <div>
          <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            id="bio"
            v-model="formData.bio"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell fans about yourself..."
          ></textarea>
        </div>

        <!-- Genre -->
        <div>
          <label for="genre" class="block text-sm font-medium text-gray-700 mb-1">Primary Genre</label>
          <select
            id="genre"
            v-model="formData.genre"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a genre</option>
            <option value="rock">Rock</option>
            <option value="pop">Pop</option>
            <option value="hip-hop">Hip Hop</option>
            <option value="electronic">Electronic</option>
            <option value="jazz">Jazz</option>
            <option value="classical">Classical</option>
            <option value="country">Country</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Location -->
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            id="location"
            v-model="formData.location"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="City, Country"
          />
        </div>
      </div>

      <p class="text-sm text-gray-500 mt-4">
        You can always edit these details later in your dashboard settings.
      </p>
    </div>
  </OnboardingWizard>
</template>

<script setup>
import { useRouter } from '#imports'

const router = useRouter()

const formData = ref({
  name: '',
  bio: '',
  genre: '',
  location: '',
  image: 'https://via.placeholder.com/100'
})

const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0
})

const goBack = () => {
  router.push('/onboarding/artist')
}

const completeOnboarding = async () => {
  if (!isFormValid.value) return

  try {
    // In a real implementation, we would save the profile data
    // and mark onboarding as complete in the database
    console.log('Saving profile:', formData.value)
    
    // Redirect to dashboard
    router.push('/dashboard')
  } catch (error) {
    console.error('Error completing onboarding:', error)
  }
}
</script>
