// Global test setup
// Define Nuxt macros that are not available in Vitest environment
;(global as any).definePageMeta = (meta: any) => {}
;(global as any).defineNuxtRouteMiddleware = (fn: any) => fn
;(global as any).navigateTo = (path: string) => path
