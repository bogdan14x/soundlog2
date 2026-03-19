import { describe, expect, it } from 'vitest'

// nuxt.config.ts expects this global helper at import time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).defineNuxtConfig = (value: unknown) => value

describe('nuxt config', () => {
  it('uses the app directory as srcDir', async () => {
    const { default: config } = await import('../nuxt.config')
    expect(config.srcDir).toBe('app/')
  })
})
