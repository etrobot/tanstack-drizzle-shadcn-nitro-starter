import type { Config } from 'drizzle-kit';
import { getEnvVarSync } from './src/lib/env';

console.log('🔧 Drizzle configuration initializing...');

// Check if we're in a Cloudflare environment by detecting D1 credentials
const cloudflareAccountId = getEnvVarSync('CLOUDFLARE_ACCOUNT_ID');
const cloudflareDatabaseId = getEnvVarSync('CLOUDFLARE_DATABASE_ID');
const cloudflareApiToken = getEnvVarSync('CLOUDFLARE_API_TOKEN');

const isCloudflareEnv = cloudflareAccountId && cloudflareDatabaseId && cloudflareApiToken;

let config: Config;

if (isCloudflareEnv) {
  // Cloudflare D1 configuration (for wrangler)
  console.log('🚀 Using Cloudflare D1 via drizzle-kit d1-http driver');
  config = {
    schema: './db/schema.ts',
    out: './db/migrations',
    dialect: 'sqlite',
    driver: 'd1-http',
    dbCredentials: {
      accountId: cloudflareAccountId!,
      databaseId: cloudflareDatabaseId!,
      token: cloudflareApiToken!,
    },
    tablesFilter: ['/^(?!.*_cf_KV).*$/'],
  };
  console.log('🌥️ Cloudflare D1 configuration loaded');
} else {
  // Local development with libsql (for vite dev)
  const dbUrl = getEnvVarSync('LIBSQL_URL') || 'file:./db/app.db';
  console.log('🚀 Using local libsql via drizzle-kit libsql driver');
  config = {
    schema: './db/schema.ts',
    out: './db/migrations',
    dialect: 'sqlite',
    dbCredentials: {
      url: dbUrl,
    },
    tablesFilter: ['/^(?!.*_cf_KV).*$/'],
  };
  console.log(`💾 Database file: ${dbUrl}`);
}

console.log(`📁 Schema path: ${config.schema}`);
console.log(`📁 Output path: ${config.out}`);

export default config;