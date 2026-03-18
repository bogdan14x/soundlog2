import { drizzle } from 'drizzle-orm/postgres-js'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { getServerEnv } from '../utils/env'
import * as schema from './schema'

type GlobalDbCache = {
  __soundlogDbClient?: PostgresJsDatabase<typeof schema>
}

const globalForDb = globalThis as typeof globalThis & GlobalDbCache

let dbClient = globalForDb.__soundlogDbClient

export function getDb() {
  if (dbClient) {
    return dbClient
  }

  const env = getServerEnv()
  const queryClient = postgres(env.DATABASE_URL, {
    prepare: false
  })

  dbClient = drizzle(queryClient, { schema })
  globalForDb.__soundlogDbClient = dbClient
  return dbClient
}
