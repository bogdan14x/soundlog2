import { ref } from 'vue'

interface ProfileResponse {
  success: boolean
  data?: {
    onboardingCompleted?: boolean
  }
}

interface CompleteOnboardingResponse {
  success: boolean
}

export function useOnboarding() {
  const isCompleted = ref(false)
  const isLoading = ref(true)

  async function checkCompletion() {
    try {
      isLoading.value = true
      // Fetch artist profile to check onboarding status
      const response = await $fetch('/api/dashboard/profile') as ProfileResponse
      
      if (response.success && response.data) {
        // Assuming the API returns onboardingCompleted field
        isCompleted.value = response.data.onboardingCompleted ?? false
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      isCompleted.value = false
    } finally {
      isLoading.value = false
    }
  }

  async function completeOnboarding() {
    try {
      const response = await $fetch('/api/onboarding/complete', {
        method: 'POST'
      }) as CompleteOnboardingResponse
      
      if (response.success) {
        isCompleted.value = true
        return true
      }
      return false
    } catch (error) {
      console.error('Error completing onboarding:', error)
      return false
    }
  }

  // Initialize
  checkCompletion()

  return {
    isCompleted,
    isLoading,
    checkCompletion,
    completeOnboarding
  }
}
