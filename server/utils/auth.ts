import { createError, type H3Event } from 'h3'

export async function requireUserSession(event: H3Event): Promise<void> {
  // TODO: Implement Supabase Auth check
  // For now, throw error to prevent unauthorized access
  throw createError({
    statusCode: 401,
    statusMessage: 'Unauthorized',
    message: 'Authentication required'
  })
}
