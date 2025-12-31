import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type { D1Database } from '@cloudflare/workers-types'
import { getRequest } from '@tanstack/react-start/server'

type SupportedDatabase = DrizzleD1Database | LibSQLDatabase

let dbInstance: SupportedDatabase | null = null
let initPromise: Promise<SupportedDatabase> | null = null

async function initLocalDb(): Promise<SupportedDatabase> {
  const { drizzle } = await import('drizzle-orm/libsql')
  const { createClient } = await import('@libsql/client')

  const libsqlUrl = process.env.LIBSQL_URL || 'file:./db/app.db'
  const libsqlAuthToken = process.env.LIBSQL_AUTH_TOKEN

  const client = createClient({
    url: libsqlUrl,
    ...(libsqlAuthToken ? { authToken: libsqlAuthToken } : {}),
  })
  console.log(`✅ Initialized local database via libsql client (${libsqlUrl})`)
  return drizzle(client)
}

export async function getDb(): Promise<SupportedDatabase> {
  if (typeof window !== 'undefined') {
    throw new Error('Database access is server-only')
  }

  if (dbInstance) {
    return dbInstance
  }

  if (!initPromise) {
    initPromise = (async () => {
      console.log(`🔧 Database connection initializing...`)

      // Try to find Cloudflare D1 binding
      let d1Binding: D1Database | undefined

      try {
        const req = getRequest()
        // Check various places where environment might be attached
        const context = (req as any).context || (req as any).env
        // Nitro/H3/Vinxi pattern: event.context.cloudflare.env
        // Or sometimes attached directly to request
        d1Binding = (req as any).env?.DB || (req as any).DB || context?.cloudflare?.env?.DB || context?.env?.DB

        if (!d1Binding) {
          // Try global import as last resort
          try {
            // @ts-ignore
            const cfWorkers = await import('cloudflare:workers')
            d1Binding = (cfWorkers.env as any)?.DB
          } catch { }
        }
      } catch (e) {
        // Not in request context or import failed
      }

      if (d1Binding) {
        console.log('🚀 Using Cloudflare D1 database (detected)')
        const { drizzle } = await import('drizzle-orm/d1')
        dbInstance = drizzle(d1Binding)
        return dbInstance
      }

      console.log('🚀 Using local libsql database connection')
      dbInstance = await initLocalDb()
      return dbInstance
    })()
  }

  return initPromise
}

// Export all schema tables
export * from './schema'

// Utility function for Cloudflare Workers environment
export async function getD1Db(d1: D1Database): Promise<DrizzleD1Database> {
  if (typeof window !== 'undefined') {
    throw new Error('Database access is server-only')
  }

  const { drizzle } = await import('drizzle-orm/d1')
  return drizzle(d1)
}