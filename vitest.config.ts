import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(dirname(fileURLToPath(import.meta.url)), '.'),
      '#imports': resolve(dirname(fileURLToPath(import.meta.url)), 'test/mocks/imports.ts'),
      '#app': resolve(dirname(fileURLToPath(import.meta.url)), 'test/mocks/app.ts'),
    },
  },
})
