import { ref, computed } from 'vue'
import { useSupabaseClient } from '#imports'

export function useAuth() {
  const supabase = useSupabaseClient()
  const user = ref<any | null>(null)
  const isLoading = ref(true)

  // Computed
  const isAuthenticated = computed(() => !!user.value)

  // Initialize session
  async function initializeSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null
    } catch (error) {
      console.error('Error initializing session:', error)
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user ?? null
  })

  // Initialize on first call
  initializeSession()

  return {
    user,
    isLoading,
    isAuthenticated,
    supabase
  }
}
