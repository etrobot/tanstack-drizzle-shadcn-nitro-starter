import { createFileRoute } from '@tanstack/react-router'
import { getExampleData } from './api/example'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/example')({
  component: ExamplePage,
  loader: async () => {
    const data = await getExampleData()
    return { data }
  },
})

function ExamplePage() {
  const { data } = Route.useLoaderData()

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Example Page</h1>
        <p className="text-muted-foreground">
          This page demonstrates how to use server functions to fetch data.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Server Response</CardTitle>
            <CardDescription>Data fetched from the server</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button asChild>
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
