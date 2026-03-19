export default defineNuxtRouteMiddleware((to, from) => {
  // TODO: Implement Supabase auth check
  // const user = useSupabaseUser()
  // if (!user.value) {
  //   return navigateTo('/login')
  // }
  
  // For now, allow access
  console.log('Auth middleware - allowing access to dashboard')
})
