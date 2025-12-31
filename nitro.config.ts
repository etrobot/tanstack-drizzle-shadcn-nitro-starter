import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
  compatibilityDate: '2025-03-25',
  // Use cloudflare_module preset for Cloudflare Workers deployment
  preset: 'cloudflare_module',

  // Cloudflare configuration
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
  },

  // Route rules
  routeRules: {
    // Static assets with aggressive caching
    '/assets/**': {
      headers: { 'cache-control': 'public, max-age=31536000, immutable' }
    },
    // API routes - enable CORS and disable caching
    '/api/**': {
      cors: true,
      headers: { 'cache-control': 'no-cache' }
    },
  },

  // Runtime configuration - add your environment variables here
  runtimeConfig: {
    // Add your environment variables here
    // example: process.env.YOUR_ENV_VAR,
  },
})
