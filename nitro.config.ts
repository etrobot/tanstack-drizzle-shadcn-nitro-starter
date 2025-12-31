import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
  compatibilityDate: '2025-03-25',
  // 使用 cloudflare_module preset，适用于 Cloudflare Worker
  preset: 'cloudflare_module',

  // Cloudflare 配置
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
  },

  // 路由规则
  routeRules: {
    // 静态资源强缓存
    '/assets/**': {
      headers: { 'cache-control': 'public, max-age=31536000, immutable' }
    },
    // API 路由 - 启用 CORS
    '/api/**': {
      cors: true,
      headers: { 'cache-control': 'no-cache' }
    },
  },

  // 运行时配置 - 添加你的环境变量
  runtimeConfig: {
    // Add your environment variables here
    // example: process.env.YOUR_ENV_VAR,
  },
})
