import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getUsers, createUser, deleteUser, type User } from './api/example'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/example')({
  component: ExamplePage,
  loader: async () => {
    const response = await getUsers()
    return { users: response.data || [], count: response.count || 0, error: response.error }
  },
})

function ExamplePage() {
  const { users, count, error } = Route.useLoaderData()
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter email address' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const result = await createUser({ data: { name: name || undefined, email } })

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'User created successfully!' })
        setName('')
        setEmail('')
        // Refresh the page data
        router.invalidate()
      } else {
        setMessage({ type: 'error', text: result.error || 'Creation failed' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    setLoading(true)
    try {
      const result = await deleteUser({ data: { userId } })

      if (result.success) {
        setMessage({ type: 'success', text: 'User deleted successfully!' })
        router.invalidate()
      } else {
        setMessage({ type: 'error', text: result.error || 'Deletion failed' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <Button asChild variant="outline">
          <a href="/"><ArrowLeft className="h-4 w-4" /></a>
        </Button>
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">
            Database Example
          </h1>
          <p className="text-muted-foreground text-lg">
            This page demonstrates how to query the database using Drizzle ORM and libSQL/D1 through backend API
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {message.text}
          </div>
        )}

        {/* Create User Form */}
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">➕</span>
              Create New User
            </CardTitle>
            <CardDescription>
              Add new user to database using POST request
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateUser}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter user name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? 'Processing...' : 'Create User'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              User List
              <span className="ml-auto text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                Total {count} records
              </span>
            </CardTitle>
            <CardDescription>
              User data fetched from database using GET request
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
                <p className="font-medium">Database query error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-4">📭</p>
                <p>No user data available</p>
                <p className="text-sm mt-2">Use the form above to create the first user</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user: User) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.name || 'Unnamed User'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'N/A'}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
