/**
 * Example usage patterns for the unified environment variable utility
 * This file demonstrates various ways to use getEnvVar and getEnvVarSync
 */

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { getEnvVar, getEnvVarSync } from './env'

// ============================================================================
// Example 1: Using in Server Functions (Recommended Pattern)
// ============================================================================

export const getApiConfigFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const req = getRequest()
    
    // Access environment variables with request context
    const apiUrl = await getEnvVar('VITE_API_URL', req)
    const apiKey = await getEnvVar('API_SECRET_KEY', req)
    
    return {
      apiUrl: apiUrl || 'http://localhost:3000',
      hasApiKey: !!apiKey,
    }
  })

// ============================================================================
// Example 2: Using in Config Files (Synchronous)
// ============================================================================

// This works well in config files that load synchronously
export const appConfig = {
  // Vite variables (available on client and server)
  apiUrl: getEnvVarSync('VITE_API_URL') || 'http://localhost:3000/api',
  appTitle: getEnvVarSync('VITE_APP_TITLE') || 'My Application',
  appVersion: getEnvVarSync('VITE_APP_VERSION') || '1.0.0',
  
  // Server-only variables
  databaseUrl: getEnvVarSync('DATABASE_URL'),
  
  // Vite built-in constants
  isDevelopment: getEnvVarSync('DEV') === 'true',
  isProduction: getEnvVarSync('PROD') === 'true',
  mode: getEnvVarSync('MODE'),
  baseUrl: getEnvVarSync('BASE_URL'),
}

// ============================================================================
// Example 3: Client-Side Usage (Vite Variables Only)
// ============================================================================

// In a React component - only VITE_* variables work on client
export async function getClientConfig() {
  // These work because they're VITE_* prefixed
  const apiUrl = await getEnvVar('VITE_API_URL')
  const appTitle = await getEnvVar('VITE_APP_TITLE')
  
  // This would be undefined on client (no VITE_ prefix)
  const secretKey = await getEnvVar('API_SECRET_KEY')
  
  return {
    apiUrl,
    appTitle,
    hasSecretKey: !!secretKey, // Will be false on client
  }
}

// ============================================================================
// Example 4: Type-Safe Environment Variables
// ============================================================================

// Helper to get typed environment variables
export async function getTypedEnvVar<T = string>(
  name: string,
  context?: any,
  converter?: (value: string) => T
): Promise<T | undefined> {
  const value = await getEnvVar(name, context)
  if (value === undefined) return undefined
  return converter ? converter(value) : (value as unknown as T)
}

// Usage examples:
export const getNumberConfig = createServerFn({ method: 'GET' })
  .handler(async () => {
    const req = getRequest()
    
    // Get as number
    const port = await getTypedEnvVar('PORT', req, (v) => parseInt(v, 10))
    
    // Get as boolean
    const debugMode = await getTypedEnvVar('DEBUG', req, (v) => v === 'true')
    
    // Get as JSON
    const features = await getTypedEnvVar('FEATURES', req, (v) => JSON.parse(v))
    
    return { port, debugMode, features }
  })

// ============================================================================
// Example 5: Environment-Specific Configuration
// ============================================================================

export async function getDatabaseConfig(context?: any) {
  const mode = await getEnvVar('MODE', context)
  
  switch (mode) {
    case 'production':
      return {
        url: await getEnvVar('DATABASE_URL', context),
        ssl: true,
        poolSize: 10,
      }
    case 'development':
      return {
        url: await getEnvVar('LIBSQL_URL', context) || 'file:./db/app.db',
        ssl: false,
        poolSize: 5,
      }
    default:
      return {
        url: 'file:./db/test.db',
        ssl: false,
        poolSize: 1,
      }
  }
}

// ============================================================================
// Example 6: Feature Flags
// ============================================================================

export const featureFlags = {
  // Use VITE_ prefix to make features available on client
  newUI: getEnvVarSync('VITE_FEATURE_NEW_UI') === 'true',
  analytics: getEnvVarSync('VITE_FEATURE_ANALYTICS') === 'true',
  
  // Server-only feature flags
  experimentalApi: getEnvVarSync('FEATURE_EXPERIMENTAL_API') === 'true',
  debugMode: getEnvVarSync('DEBUG') === 'true',
}
