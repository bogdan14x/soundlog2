import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useAuth } from '../composables/useAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, isLoading } = useAuth()

  // If loading, wait (or just allow, but better to check)
  // In middleware, we can't really "wait" easily without making it async and waiting.
  // But useAuth initializes session immediately.
  
  if (!isAuthenticated.value) {
    // Redirect to login if not authenticated
    return navigateTo('/login')
  }

  // Allow access
})
