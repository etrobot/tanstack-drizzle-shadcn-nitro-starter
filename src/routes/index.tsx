import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ArrowRight, Github, LayoutTemplate, Zap, Database, Code2 } from 'lucide-react'

// Example server function
const getWelcomeMessageFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    return {
      message: 'Build Faster with TanStack Start',
      timestamp: new Date().toISOString(),
    }
  })

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    return await getWelcomeMessageFn()
  },
})

function Home() {
  const data = Route.useLoaderData()

  return (
    // Light Mode: Specific Gradient. Dark Mode: Dark version of the light palette
    <div className="relative min-h-screen selection:bg-primary selection:text-primary-foreground overflow-hidden bg-[linear-gradient(135deg,#F0E0D0_0%,#A8B0BC_50%,#F5F5F0_100%)] dark:bg-[linear-gradient(135deg,#1A1512_0%,#111827_50%,#0F1115_100%)]">

      {/* Background Decor - Only valid in Dark Mode now */}
      <div className="hidden dark:block absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border/40 dark:bg-background/95 dark:backdrop-blur bg-transparent backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between mx-auto px-4">
          <div className="flex items-center space-x-2 font-bold text-xl tracking-tight text-[#121727] dark:text-foreground">
            <div className="w-8 h-8 rounded-lg bg-[#C27664] dark:bg-primary flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <span>brand</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 flex flex-col justify-center h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Dynamic Vertical Gap Spacer */}
        <div className="flex-1 max-h-16" />

        {/* Hero Section Container */}
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

          {/* Content Wrapper */}
          <div className="relative w-full rounded-xl p-0">

            <div className="flex flex-col items-center text-center">
              {/* Meta Tag Style */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-1 px-3 py-1 bg-white/40 dark:bg-secondary/50 rounded-full border border-black/10 dark:border-border">
                  <span className="w-2 h-2 rounded-full bg-[#C27664] dark:bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-[#C27664] dark:text-foreground uppercase tracking-wide">v1.0.0 Live</span>
                </div>
              </div>

              {/* Title Line 1 - Restored Size */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-none tracking-tighter text-black dark:text-foreground mb-1">
                Build Faster
              </h1>

              {/* Separator Line */}
              <div className="w-16 h-1 bg-[#A8B0BC] dark:bg-border my-4 rounded-full"></div>

              {/* Title Line 2 - Restored Size */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-none tracking-tighter text-black dark:text-foreground mb-4">
                With TanStack Start
              </h1>

              {/* Subtitle - Re-introduced Compact */}
              <p className="text-sm sm:text-base font-mono font-bold tracking-widest uppercase text-[#121727]/80 dark:text-muted-foreground mb-8">
                full-stack react template
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="/example"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#121727] dark:bg-primary px-8 text-sm font-semibold text-white dark:text-primary-foreground shadow transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a
                  href="https://github.com/etrobot/tanstack-drizzle-shadcn-nitro-starter"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#121727]/20 dark:border-input bg-transparent dark:bg-background px-8 text-sm font-semibold shadow-sm transition-transform hover:scale-105 active:scale-95 hover:bg-black/5 dark:hover:bg-accent hover:text-black dark:hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-[#121727] dark:text-foreground"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid - Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto w-full px-2">
          <FeatureCard
            icon={<LayoutTemplate className="w-6 h-6 text-[#C27664] dark:text-blue-500" />}
            title="Type Guide"
            description="Type-safe routing built-in."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-[#889C78] dark:text-yellow-500" />}
            title="Fast Edge"
            description="Deploy instantly to Cloudflare."
          />
          <FeatureCard
            icon={<Database className="w-6 h-6 text-[#121727] dark:text-emerald-500" />}
            title="D1 Ready"
            description="Serverless SQL support."
          />
          <FeatureCard
            icon={<Code2 className="w-6 h-6 text-[#C27664] dark:text-purple-500" />}
            title="Modern"
            description="Tailwind & Radix UI included."
          />
        </div>

        {/* Server Time - Bottom Anchor */}
        <div className="mt-8 text-center text-[10px] font-mono font-bold tracking-wider uppercase text-[#121727]/40 dark:text-muted-foreground pb-4">
          {new Date(data.timestamp).toLocaleString()}
        </div>

        <div className="flex-1 max-h-16" />
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/60 dark:border-border bg-white/40 dark:bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-white dark:hover:border-primary/20 backdrop-blur-sm">
      <div className="p-6 flex flex-col items-start space-y-4">
        <div className="p-2 rounded-lg bg-white/60 dark:bg-secondary/50 group-hover:bg-white dark:group-hover:bg-secondary transition-colors">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-[#121727] dark:text-foreground">{title}</h3>
          <p className="text-sm text-[#121727]/80 dark:text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
