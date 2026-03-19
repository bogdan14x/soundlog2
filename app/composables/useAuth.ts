import { computed } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'

export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const isAuthenticated = computed(() => !!user.value)
  const isLoading = computed(() => user.value === undefined)

  return {
    user,
    isLoading,
    isAuthenticated,
    supabase
  }
}
