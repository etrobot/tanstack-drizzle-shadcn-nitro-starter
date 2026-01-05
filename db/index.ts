import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type { D1Database } from '@cloudflare/workers-types'
import { getRequest } from '@tanstack/react-start/server'

type SupportedDatabase = DrizzleD1Database | LibSQLDatabase

let dbInstance: SupportedDatabase | null = null
let initPromise: Promise<SupportedDatabase> | null = null

async function initLocalDb(): Promise<SupportedDatabase> {
  console.log('[initLocalDb] 开始初始化本地数据库')
  const { drizzle } = await import('drizzle-orm/libsql')
  const { createClient } = await import('@libsql/client')

  const libsqlUrl = process.env.LIBSQL_URL || 'file:./db/app.db'
  const libsqlAuthToken = process.env.LIBSQL_AUTH_TOKEN
  console.log('[initLocalDb] 数据库URL:', libsqlUrl)
  console.log('[initLocalDb] 是否有认证Token:', !!libsqlAuthToken)

  const client = createClient({
    url: libsqlUrl,
    ...(libsqlAuthToken ? { authToken: libsqlAuthToken } : {}),
  })
  console.log('[initLocalDb] libsql客户端创建成功')
  console.log(`✅ Initialized local database via libsql client (${libsqlUrl})`)
  const db = drizzle(client)
  console.log('[initLocalDb] Drizzle实例创建成功')
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
      console.log('[getDb] 开始初始化数据库连接')

      // Try to find Cloudflare D1 binding
      let d1Binding: D1Database | undefined

      try {
        console.log('[getDb] 尝试获取请求对象')
        const req = getRequest()
        console.log('[getDb] 请求对象获取成功')
        // Check various places where environment might be attached
        const context = (req as any).context || (req as any).env
        console.log('[getDb] 检查环境变量绑定')
        // Nitro/H3/Vinxi pattern: event.context.cloudflare.env
        // Or sometimes attached directly to request
        d1Binding = (req as any).env?.DB || (req as any).DB || context?.cloudflare?.env?.DB || context?.env?.DB
        console.log('[getDb] D1绑定检查结果:', !!d1Binding)

        if (!d1Binding) {
          console.log('[getDb] 尝试全局导入cloudflare:workers')
          // Try global import as last resort
          try {
            // @ts-ignore
            const cfWorkers = await import('cloudflare:workers')
            d1Binding = (cfWorkers.env as any)?.DB
            console.log('[getDb] cloudflare:workers导入成功，D1绑定:', !!d1Binding)
          } catch (e) {
            console.log('[getDb] cloudflare:workers导入失败:', e)
          }
        }
      } catch (e) {
        console.log('[getDb] 获取请求上下文失败:', e)
        // Not in request context or import failed
      }

      if (d1Binding) {
        console.log('🚀 Using Cloudflare D1 database (detected)')
        console.log('[getDb] 使用Cloudflare D1数据库')
        const { drizzle } = await import('drizzle-orm/d1')
        dbInstance = drizzle(d1Binding)
        console.log('[getDb] D1数据库实例创建成功')
        return dbInstance
      }

      console.log('🚀 Using local libsql database connection')
      console.log('[getDb] 使用本地libsql数据库连接')
      dbInstance = await initLocalDb()
      console.log('[getDb] 数据库初始化完成')
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