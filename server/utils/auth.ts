import { createError } from 'h3'

export async function requireUserSession(event: any) {
  // TODO: Implement Supabase Auth check
  // For now, throw error to prevent unauthorized access
  throw createError({
    statusCode: 401,
    statusMessage: 'Unauthorized'
  })
}
