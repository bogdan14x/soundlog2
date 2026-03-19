import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('supabase database types', () => {
  it('provides the database types file expected by the Nuxt Supabase module', () => {
    const filePath = resolve(process.cwd(), 'app/types/database.types.ts')

    expect(existsSync(filePath)).toBe(true)
  })
})
