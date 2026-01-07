/**
 * Unified Environment Variable Utility
 * 
 * Provides a robust, adaptive way to access environment variables across different
 * runtime contexts including:
 * - Cloudflare Workers (cloudflare:workers, context.env, context.cloudflare.env)
 * - Vite (import.meta.env - for VITE_* prefixed variables)
 * - Node.js (process.env)
 * - Nitro/H3/Vinxi (event.context.cloudflare.env, event.context.env)
 * - TanStack Start (request context patterns)
 * 
 * ## Environment Variable Priority
 * 
 * Variables are resolved in the following order:
 * 1. Cloudflare Workers context (highest priority for server-side in Workers)
 * 2. Vite import.meta.env (works in both client and SSR builds)
 * 3. Node.js process.env (fallback for Node.js environments)
 * 
 * ## Vite Environment Variables
 * 
 * When using Vite, only variables prefixed with `VITE_` are exposed to client-side code.
 * Server-side code can access all environment variables. Example:
 * 
 * ```env
 * VITE_API_URL=https://api.example.com  # Available on client & server
 * DATABASE_URL=postgres://...            # Only available on server
 * ```
 * 
 * ## Usage Examples
 * 
 * ### In Server Functions (Async)
 * ```typescript
 * import { getRequest } from '@tanstack/react-start/server';
 * import { getEnvVar } from './lib/env';
 * 
 * export const myServerFn = createServerFn({ method: 'GET' })
 *   .handler(async () => {
 *     const req = getRequest();
 *     const apiKey = await getEnvVar('API_KEY', req);
 *     return { apiKey };
 *   });
 * ```
 * 
 * ### In Client Components (Vite Variables)
 * ```typescript
 * import { getEnvVar } from './lib/env';
 * 
 * function MyComponent() {
 *   const [apiUrl, setApiUrl] = useState<string>();
 *   
 *   useEffect(() => {
 *     // Access VITE_* prefixed variables on the client
 *     getEnvVar('VITE_API_URL').then(setApiUrl);
 *   }, []);
 *   
 *   return <div>API: {apiUrl}</div>;
 * }
 * ```
 * 
 * ### In Config Files (Sync)
 * ```typescript
 * import { getEnvVarSync } from './lib/env';
 * 
 * const config = {
 *   apiUrl: getEnvVarSync('VITE_API_URL') || 'http://localhost:3000',
 *   environment: getEnvVarSync('NODE_ENV') || 'development',
 *   mode: getEnvVarSync('MODE') || 'production',
 * };
 * ```
 * 
 * ### Getting D1 Database Binding (Cloudflare Workers)
 * ```typescript
 * import { getD1Binding } from './lib/env';
 * 
 * const d1 = await getD1Binding(requestContext);
 * if (d1) {
 *   // Use D1 database
 * }
 * ```
 * 
 * ### Direct Access to All Vite Constants
 * ```typescript
 * import { getEnvVarSync } from './lib/env';
 * 
 * // Built-in Vite constants
 * const isDev = getEnvVarSync('DEV') === 'true';
 * const isProd = getEnvVarSync('PROD') === 'true';
 * const mode = getEnvVarSync('MODE'); // 'development' | 'production' | custom
 * const baseUrl = getEnvVarSync('BASE_URL');
 * const isSSR = getEnvVarSync('SSR') === 'true';
 * ```
 */

/**
 * Helper function to get Cloudflare Workers environment context
 * Checks multiple common patterns where env might be attached
 */
async function getCloudflareEnv(context?: any): Promise<any> {
  if (context) {
    // Direct env object with DB binding
    if (context.env?.DB) return context.env;
    
    // Nested cloudflare.env pattern (Nitro/H3)
    if (context.cloudflare?.env?.DB) return context.cloudflare.env;
    
    // Platform env pattern
    if (context.platform?.env?.DB) return context.platform.env;
    
    // Direct DB binding on context
    if (context.DB) return context;
  }

  try {
    // Try importing cloudflare:workers module (available in Workers runtime)
    // @ts-ignore - This import only works in Cloudflare Workers
    const cf = await import('cloudflare:workers');
    return cf.env;
  } catch {
    // Not in Cloudflare Workers environment
    return null;
  }
}

/**
 * Helper function to safely access import.meta.env
 * Returns undefined if not available (e.g., in Node.js contexts)
 */
function getImportMetaEnv(): Record<string, any> | undefined {
  try {
    // Check if import.meta.env is available (Vite build)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env as Record<string, any>;
    }
  } catch {
    // import.meta not available in this context
  }
  return undefined;
}

/**
 * Robust Environment Variable Getter
 * 
 * Attempts to retrieve environment variables from multiple sources in order:
 * 1. Cloudflare Workers env (via context or cloudflare:workers)
 * 2. Vite import.meta.env (for VITE_* prefixed variables)
 * 3. Node.js process.env
 * 
 * @param name - The environment variable name to retrieve
 * @param context - Optional context object (request, event, etc.)
 * @returns The environment variable value or undefined if not found
 * 
 * @example
 * // In a TanStack Start server function
 * const req = getRequest();
 * const dbUrl = await getEnvVar('LIBSQL_URL', req);
 * 
 * @example
 * // In a Vite-based client/server context
 * const apiUrl = await getEnvVar('VITE_API_URL');
 * 
 * @example
 * // In a Node.js context
 * const apiKey = await getEnvVar('API_KEY');
 */
export async function getEnvVar(name: string, context?: any): Promise<string | undefined> {
  // Try Cloudflare environment first
  const cfEnv = await getCloudflareEnv(context);
  if (cfEnv && cfEnv[name]) {
    return cfEnv[name];
  }

  // Try Vite's import.meta.env (for both client and server builds)
  const metaEnv = getImportMetaEnv();
  if (metaEnv && metaEnv[name] !== undefined) {
    return String(metaEnv[name]);
  }

  // Fall back to Node.js process.env
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }

  return undefined;
}

/**
 * Synchronous version of getEnvVar for environments where async is not needed
 * Checks import.meta.env, process.env, and direct context properties
 * 
 * @param name - The environment variable name to retrieve
 * @param context - Optional context object
 * @returns The environment variable value or undefined if not found
 */
export function getEnvVarSync(name: string, context?: any): string | undefined {
  // Check context patterns synchronously
  if (context) {
    if (context.env?.[name]) return context.env[name];
    if (context.cloudflare?.env?.[name]) return context.cloudflare.env[name];
    if (context.platform?.env?.[name]) return context.platform.env[name];
    if (context[name]) return context[name];
  }

  // Check Vite's import.meta.env
  const metaEnv = getImportMetaEnv();
  if (metaEnv && metaEnv[name] !== undefined) {
    return String(metaEnv[name]);
  }

  // Check Node.js process.env
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }

  return undefined;
}

/**
 * Get Cloudflare D1 Database binding
 * 
 * @param context - Optional context object (request, event, etc.)
 * @returns The D1 Database binding or undefined if not found
 */
export async function getD1Binding(context?: any): Promise<any> {
  const cfEnv = await getCloudflareEnv(context);
  return cfEnv?.DB;
}

/**
 * Get all Cloudflare environment bindings
 * Useful when you need access to multiple bindings (KV, R2, D1, etc.)
 * 
 * @param context - Optional context object (request, event, etc.)
 * @returns The full environment object or null if not in Cloudflare context
 */
export async function getCloudflareEnvBindings(context?: any): Promise<any> {
  return await getCloudflareEnv(context);
}
