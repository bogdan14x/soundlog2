// Global test setup
// Define Nuxt macros that are not available in Vitest environment
;(global as any).definePageMeta = (meta: any) => {}
;(global as any).defineNuxtRouteMiddleware = (fn: any) => fn
;(global as any).navigateTo = (path: string) => path

// Import Vue composition API functions to make them available globally
import { ref, computed, reactive, watch, watchEffect, onMounted, onUnmounted } from 'vue'
;(global as any).ref = ref
;(global as any).computed = computed
;(global as any).reactive = reactive
;(global as any).watch = watch
;(global as any).watchEffect = watchEffect
;(global as any).onMounted = onMounted
;(global as any).onUnmounted = onUnmounted
