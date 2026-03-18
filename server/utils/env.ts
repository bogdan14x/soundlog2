import { z } from 'zod'

const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url()
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

let cachedEnv: ServerEnv | null = null

export function parseServerEnv(rawEnv: Record<string, string | undefined>): ServerEnv {
  const parsed = serverEnvSchema.safeParse(rawEnv)

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')

    throw new Error(`Invalid server environment variables: ${message}`)
  }

  return parsed.data
}

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv
  }

  cachedEnv = parseServerEnv(process.env)
  return cachedEnv
}
