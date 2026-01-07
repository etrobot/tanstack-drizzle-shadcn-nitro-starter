# TanStack Drizzle Shadcn Nitro Starter

A clean, production-ready full-stack React template built with TanStack Start, featuring type-safe routing, server functions, and dual database support.

<img width="2658" height="1558" alt="image" src="https://github.com/user-attachments/assets/54dc70db-6e28-4e27-aaaa-0ec0b4ca8617" />
<img width="1237" height="833" alt="image" src="https://github.com/user-attachments/assets/0a663c6a-7639-4370-8cd1-f0fa76c6b1b1" />


## ✨ Features

- 🚀 **TanStack Start** - Full-stack React framework with SSR/SSG
- 🎯 **Type-Safe Routing** - File-based routing with TanStack Router
- 🗄️ **Dual Database** - Auto-switching between SQLite (local) and Cloudflare D1 (production)
- 🎨 **Modern UI** - Tailwind CSS v4 + Radix UI components
- ⚡ **Cloudflare Ready** - Optimized for Workers deployment
- 🔧 **TypeScript** - Strict mode with path aliases

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Deploy to Cloudflare
pnpm cf:deploy
```

Visit `http://localhost:3000` to see your app!

## 📁 Project Structure

```
├── db/
│   ├── index.ts          # Database connection (auto-switches SQLite/D1)
│   ├── schema.ts         # Database schema definitions
│   └── migrations/       # Auto-generated migrations
├── src/
│   ├── components/ui/    # Reusable UI components (Radix UI)
│   ├── lib/              # Utility functions
│   ├── routes/           # File-based routes
│   │   ├── __root.tsx   # Root layout
│   │   ├── index.tsx    # Home page
│   │   ├── example.tsx  # Example with data loading
│   │   └── api/         # Server functions
│   └── styles.css        # Global styles + Tailwind
├── public/               # Static assets
└── wrangler.jsonc        # Cloudflare Workers config
```

## 📝 Common Tasks

### Add a New Route

```tsx
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return <div>About Page</div>
}
```

### Create Server Function (API)

```typescript
// src/routes/api/posts.ts
import { createServerFn } from '@tanstack/react-start'

export const getPosts = createServerFn({ method: 'GET' }).handler(
  async () => {
    return { posts: [] }
  }
)
```

### Use in Components

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router'
import { getPosts } from './api/posts'

export const Route = createFileRoute('/posts')({
  component: Posts,
  loader: async () => await getPosts(),
})

function Posts() {
  const data = Route.useLoaderData()
  return <div>{JSON.stringify(data)}</div>
}
```

### Add Database Tables

```typescript
// db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date()),
})
```

Then generate and apply migrations:

```bash
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Apply to local SQLite
```

### Query Database

```typescript
import { db } from '@/db'
import { posts } from '@/db/schema'

// Get all posts
const allPosts = await db.select().from(posts)

// Insert a post
await db.insert(posts).values({
  title: 'Hello',
  content: 'World',
})
```

## 🌍 Environment Variables

This template includes a **unified environment variable utility** that works seamlessly across different runtime contexts:

### Supported Environments

- ✅ **Cloudflare Workers** - `context.env`, `cloudflare:workers`
- ✅ **Vite** - `import.meta.env` (client + server)
- ✅ **Node.js** - `process.env`
- ✅ **Nitro/H3** - `event.context.cloudflare.env`
- ✅ **TanStack Start** - Request context patterns

### Configuration Files

This template supports multiple environment file formats depending on your use case:

#### Standard Environment Files

Create these files in your project root for Vite and Node.js environments:

```env
# .env (shared across all environments)
LIBSQL_URL=file:./db/app.db

# .env.local (local overrides, gitignored)
LIBSQL_AUTH_TOKEN=your-token

# .env.production (production-specific)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-db-id

# Vite variables (VITE_* prefix exposed to client)
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
```

#### Cloudflare Workers Development (.dev.vars)

For local Cloudflare Workers development with `wrangler dev`, use `.dev.vars`:

```bash
# .dev.vars (Cloudflare Workers local dev, gitignored)
# This file simulates Cloudflare Workers environment bindings locally
# Copy from .dev.vars.example

# Database (remote Turso/libsql)
LIBSQL_URL=libsql://your-database.turso.io
LIBSQL_AUTH_TOKEN=your-auth-token

# Server-only secrets (NOT accessible to client)
API_SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...

# Feature flags
ENABLE_EXPERIMENTAL_FEATURES=false
DEBUG_MODE=true
```

**Important:** `.dev.vars` is specifically for Wrangler local development and simulates the environment bindings you'll have in production Cloudflare Workers. Variables in `.dev.vars` are automatically available in your Workers context during local development.

**Setup Steps:**
1. Copy `.dev.vars.example` to `.dev.vars`
2. Fill in your actual values
3. Run `pnpm cf:dev` to start local development with these variables

#### File Usage Matrix

| File | Environment | Accessible From | Gitignored |
|------|-------------|-----------------|------------|
| `.env` | All (Vite, Node) | Server + Client (VITE_*) | ❌ |
| `.env.local` | Local dev (Vite, Node) | Server + Client (VITE_*) | ✅ |
| `.env.production` | Production build | Server + Client (VITE_*) | ❌ |
| `.dev.vars` | Cloudflare Workers local dev | Server only | ✅ |
| `wrangler.jsonc` vars | Cloudflare Workers | Server only | ❌ (no secrets!) |

#### Production Cloudflare Workers Secrets

For production deployments, use Wrangler's secret management (encrypted and not visible in dashboard):

```bash
# Set individual secrets for production
echo "your-secret-value" | npx wrangler secret put API_SECRET_KEY
echo "your-jwt-secret" | npx wrangler secret put JWT_SECRET
echo "sk_live_..." | npx wrangler secret put STRIPE_SECRET_KEY

# List all secrets (values are hidden)
npx wrangler secret list

# Delete a secret
npx wrangler secret delete API_SECRET_KEY
```

**Best Practices:**
- ✅ Use `.dev.vars` for local Cloudflare Workers development
- ✅ Use `wrangler secret put` for production secrets
- ✅ Use `wrangler.jsonc` vars section for non-sensitive config
- ❌ Never commit `.dev.vars` to git
- ❌ Never put secrets in `wrangler.jsonc`

**Git Ignore Configuration:**
All sensitive environment files are automatically ignored by git:
```gitignore
# All environment files are ignored
.env
.env.*              # Covers .env.local, .env.production, etc.
.dev.vars

# Except .example files (these should be committed)
!.env.example
!.dev.vars.example
```

### Usage Examples

#### Server-Side (Full Access)

```typescript
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { getEnvVar } from '@/lib/env'

export const getConfig = createServerFn({ method: 'GET' })
  .handler(async () => {
    const req = getRequest()
    
    // Access any environment variable
    // Works with: .env, .dev.vars, wrangler secrets, process.env
    const dbUrl = await getEnvVar('DATABASE_URL', req)
    const apiKey = await getEnvVar('API_SECRET_KEY', req)
    
    return { dbUrl, hasApiKey: !!apiKey }
  })
```

**How it works:**
- In **Vite dev** (`pnpm dev`): Reads from `.env` and `.env.local`
- In **Wrangler dev** (`pnpm cf:dev`): Reads from `.dev.vars` and Cloudflare context
- In **Production**: Reads from Wrangler secrets and Cloudflare Workers environment

#### Client-Side (VITE_* Only)

```typescript
import { getEnvVar } from '@/lib/env'

function MyComponent() {
  const [config, setConfig] = useState<any>()
  
  useEffect(() => {
    // Only VITE_* prefixed variables work on client
    Promise.all([
      getEnvVar('VITE_API_URL'),
      getEnvVar('VITE_APP_TITLE'),
    ]).then(([apiUrl, title]) => {
      setConfig({ apiUrl, title })
    })
  }, [])
  
  return <div>API: {config?.apiUrl}</div>
}
```

#### Config Files (Synchronous)

```typescript
import { getEnvVarSync } from '@/lib/env'

export const appConfig = {
  apiUrl: getEnvVarSync('VITE_API_URL') || 'http://localhost:3000',
  isDev: getEnvVarSync('DEV') === 'true',
  mode: getEnvVarSync('MODE'),
}
```

### Built-in Vite Constants

Access Vite's built-in environment constants:

```typescript
import { getEnvVarSync } from '@/lib/env'

const isDev = getEnvVarSync('DEV') === 'true'
const isProd = getEnvVarSync('PROD') === 'true'
const mode = getEnvVarSync('MODE') // 'development' | 'production'
const baseUrl = getEnvVarSync('BASE_URL')
const isSSR = getEnvVarSync('SSR') === 'true'
```

### Environment Resolution Priority

Variables are resolved in this order (highest to lowest priority):

1. **Cloudflare Workers context** - `context.env`, `context.cloudflare.env`
2. **Vite import.meta.env** - Build-time replacements for `VITE_*` variables
3. **Node.js process.env** - Traditional environment variables

### Security Notes

⚠️ **Important Security Guidelines:**

- **Client-side exposure:** Only `VITE_*` prefixed variables are exposed to client code
- **Server-only secrets:** Keep sensitive data (API keys, database credentials) WITHOUT the `VITE_*` prefix
- **Gitignore sensitive files:** Add `.env.local` and `.env*.local` to `.gitignore`

```env
# ✅ Safe for client (VITE_* prefix)
VITE_API_URL=https://api.example.com
VITE_APP_VERSION=1.0.0

# ❌ Server-only (no VITE_* prefix)
DATABASE_URL=postgres://...
API_SECRET_KEY=secret123
CLOUDFLARE_API_TOKEN=token456
```

### API Reference

| Function | Description | Usage |
|----------|-------------|-------|
| `getEnvVar(name, context?)` | Async method for runtime access | Server functions, async contexts |
| `getEnvVarSync(name, context?)` | Synchronous method | Config files, sync contexts |
| `getD1Binding(context?)` | Get Cloudflare D1 database binding | Cloudflare Workers |
| `getCloudflareEnvBindings(context?)` | Get all Cloudflare env bindings | Advanced Cloudflare usage |

For more examples, see `src/lib/env.example.ts`.

## 🗄️ Database Setup

### Local Development (SQLite)

Automatically uses SQLite at `db/app.db`. No configuration needed!

```bash
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Apply migrations
pnpm db:studio    # Open Drizzle Studio
```

### Production (Cloudflare D1)

1. Create D1 database:
```bash
npx wrangler d1 create my-database
```

2. Update `wrangler.jsonc` with the database ID

3. Apply migrations:
```bash
npx wrangler d1 migrations apply my-database
```

4. Deploy:
```bash
pnpm cf:deploy
```

The app automatically detects and uses D1 in production!

## 🎨 Styling

### Tailwind + Dark Mode

```tsx
<div className="bg-background text-foreground">
  <h1 className="text-4xl font-bold">Hello</h1>
</div>
```

Dark mode is automatic. Customize colors in `src/styles.css`:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.2 0 0);
  --primary: oklch(0.18 0 0);
}

.dark {
  --background: oklch(0.15 0 0);
  --foreground: oklch(0.985 0 0);
}
```

### UI Components

Pre-built components available:

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Click me</Button>
  </CardContent>
</Card>
```

## 🚀 Deployment

### Cloudflare Workers

This template uses **Nitro** as the server engine to deploy TanStack Start to Cloudflare Workers. Nitro automatically compiles your app into the optimized Worker format using the `cloudflare_module` preset configured in `nitro.config.ts`.

```bash
# Login to Cloudflare
wrangler login

# Configure wrangler.jsonc with your settings

# Deploy
pnpm cf:deploy
```

Your app will be live on Cloudflare's global edge network!

**How it works:**
- `pnpm build` → Vite builds the app with Nitro plugin
- Nitro outputs optimized Cloudflare Worker code to `.output/`
- `wrangler deploy` publishes the Worker to Cloudflare's edge

You can customize the Nitro configuration in `nitro.config.ts` for route rules, caching, CORS, and more.

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests |
| `pnpm db:generate` | Generate migrations |
| `pnpm db:migrate` | Apply migrations locally |
| `pnpm db:push` | Push schema (dev only) |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm cf:dev` | Test Workers locally |
| `pnpm cf:deploy` | Deploy to Cloudflare |

## 📦 Tech Stack

- [TanStack Start](https://tanstack.com/start) - Full-stack React framework
- [TanStack Router](https://tanstack.com/router) - Type-safe routing
- [Nitro](https://nitro.build/) - Universal server engine for deployment
- [Drizzle ORM](https://orm.drizzle.team/) - Database toolkit
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge deployment

## 📚 Learn More

- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Router Docs](https://tanstack.com/router)
- [Nitro Docs](https://nitro.unjs.io/) - Learn about deploy presets and configuration
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

## 📄 License

MIT
