import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type { D1Database } from '@cloudflare/workers-types'
import { getRequest } from '@tanstack/react-start/server'
import { getEnvVar, getD1Binding } from '../src/lib/env'

type SupportedDatabase = DrizzleD1Database | LibSQLDatabase

let dbInstance: SupportedDatabase | null = null
let initPromise: Promise<SupportedDatabase> | null = null

async function initLocalDb(context?: any): Promise<SupportedDatabase> {
  console.log('[initLocalDb] Starting to initialize local database')
  const { drizzle } = await import('drizzle-orm/libsql')
  const { createClient } = await import('@libsql/client')

  const libsqlUrl = (await getEnvVar('LIBSQL_URL', context)) || 'file:./db/app.db'
  const libsqlAuthToken = await getEnvVar('LIBSQL_AUTH_TOKEN', context)
  console.log('[initLocalDb] Database URL:', libsqlUrl)
  console.log('[initLocalDb] Has auth token:', !!libsqlAuthToken)

  const client = createClient({
    url: libsqlUrl,
    ...(libsqlAuthToken ? { authToken: libsqlAuthToken } : {}),
  })
  console.log('[initLocalDb] libsql client created successfully')
  console.log(`✅ Initialized local database via libsql client (${libsqlUrl})`)
  const db = drizzle(client)
  console.log('[initLocalDb] Drizzle instance created successfully')
  return db
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
      console.log('[getDb] Starting to initialize database connection')

      // Try to find Cloudflare D1 binding using unified env utility
      let d1Binding: D1Database | undefined
      let requestContext: any

      try {
        console.log('[getDb] Attempting to get request object')
        requestContext = getRequest()
        console.log('[getDb] Request object obtained successfully')
        
        // Use the unified env utility to get D1 binding
        d1Binding = await getD1Binding(requestContext)
        console.log('[getDb] D1 binding check result:', !!d1Binding)
      } catch (e) {
        console.log('[getDb] Failed to get request context:', e)
        // Not in request context, try without context
        d1Binding = await getD1Binding()
        console.log('[getDb] D1 binding check result without context:', !!d1Binding)
      }

      if (d1Binding) {
        console.log('🚀 Using Cloudflare D1 database (detected)')
        console.log('[getDb] Using Cloudflare D1 database')
        const { drizzle } = await import('drizzle-orm/d1')
        dbInstance = drizzle(d1Binding)
        console.log('[getDb] D1 database instance created successfully')
        return dbInstance
      }

      console.log('🚀 Using local libsql database connection')
      console.log('[getDb] Using local libsql database connection')
      dbInstance = await initLocalDb(requestContext)
      console.log('[getDb] Database initialization completed')
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