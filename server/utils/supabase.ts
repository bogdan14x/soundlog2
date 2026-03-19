import { createClient } from '@supabase/supabase-js'
import { getServerEnv } from './env'

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const env = getServerEnv()
  supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  return supabaseClient
}