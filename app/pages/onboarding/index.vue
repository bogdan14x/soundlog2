<template>
  <OnboardingWizard
    :current-step="1"
    :total-steps="4"
    :can-go-back="false"
    :next-button-text="'Get Started'"
    :hide-skip="true"
    @next="goToSpotify"
  >
    <div class="text-center">
      <div class="mb-8">
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome to SoundLog</h2>
        <p class="text-gray-600 text-lg">Let's set up your artist page in a few simple steps</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6 text-left mb-8">
        <h3 class="font-semibold text-gray-900 mb-4">What you'll need:</h3>
        <ul class="space-y-3">
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-700">Your Spotify artist account</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-700">Your artist photo and bio</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-700">5 minutes of your time</span>
          </li>
        </ul>
      </div>
    </div>
  </OnboardingWizard>
</template>

<script setup>
import { useRouter } from '#imports'

const router = useRouter()

const goToSpotify = () => {
  router.push('/onboarding/spotify')
}
</script>
