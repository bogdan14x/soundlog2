import { describe, expect, it } from 'vitest'

import { parseServerEnv } from '../../server/utils/env'

describe('parseServerEnv', () => {
  it('throws when required variables are missing', () => {
    expect(() =>
      parseServerEnv({
        SUPABASE_URL: '',
        SUPABASE_SERVICE_ROLE_KEY: '',
        DATABASE_URL: ''
      })
    ).toThrow('Invalid server environment variables')
  })

  it('returns typed env values for valid placeholders', () => {
    const env = parseServerEnv({
      SUPABASE_URL: 'https://example-project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/soundlog'
    })

    expect(env.SUPABASE_URL).toBe('https://example-project.supabase.co')
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe('test-service-role-key')
    expect(env.DATABASE_URL).toBe('postgresql://postgres:postgres@localhost:5432/soundlog')
  })
})
