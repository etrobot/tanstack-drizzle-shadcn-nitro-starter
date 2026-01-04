import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, updateUser, deleteUser, type User } from './api/example'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, BarChart3, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/example')({
  loader: async () => {
    // Load users data via the loader instead of client-side query
    const response = await getUsers()
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch users')
    }
    return response
  },
  component: ExamplePage,
})

function ExamplePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Use the type-safe loader data from the route
  const data = Route.useLoaderData()

  // Helper function to refresh the route data
  const refreshData = () => {
    // Invalidate queries and navigate to refresh loader
    queryClient.invalidateQueries()
    navigate({ to: '/example', replace: true })
  }

  // Mutation: Create user
  const createMutation = useMutation({
    mutationFn: async (userData: { name?: string; email: string }) => {
      const result = await createUser({ data: userData })
      if (!result.success) {
        throw new Error(result.error || 'Failed to create user')
      }
      return result
    },
    onSuccess: () => {
      toast.success('User created successfully!')
      setName('')
      setEmail('')
      // Refresh the data by reloading the route
      refreshData()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Mutation: Update user
  const updateMutation = useMutation({
    mutationFn: async (userData: { userId: string; name?: string; email?: string }) => {
      const result = await updateUser({ data: userData })
      if (!result.success) {
        throw new Error(result.error || 'Failed to update user')
      }
      return result
    },
    onSuccess: () => {
      toast.success('User updated successfully!')
      setEditingUser(null)
      setName('')
      setEmail('')
      // Refresh the data by reloading the route
      refreshData()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Mutation: Delete user
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await deleteUser({ data: { userId } })
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user')
      }
      return result
    },
    onSuccess: () => {
      toast.success('User deleted successfully!')
      // Refresh the data by reloading the route
      refreshData()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter email address')
      return
    }

    if (editingUser) {
      updateMutation.mutate({ userId: editingUser.id, name: name || undefined, email })
    } else {
      createMutation.mutate({ name: name || undefined, email })
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setName(user.name || '')
    setEmail(user.email)
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setName('')
    setEmail('')
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="container mx-auto p-4">
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
            Database Example with TanStack Query
          </h1>
          <p className="text-muted-foreground text-lg">
            CRUD operations using TanStack Query, Drizzle ORM and libSQL/D1
          </p>
        </div>

        {/* Create/Update User Form */}
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{editingUser ? '✏️' : '➕'}</span>
              {editingUser ? 'Update User' : 'Create New User'}
            </CardTitle>
            <CardDescription>
              {editingUser ? 'Update user information' : 'Add new user to database'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter user name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
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
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? 'Processing...' : editingUser ? 'Update User' : 'Create User'}
              </Button>
              {editingUser && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="w-full md:w-auto"
                >
                  Cancel
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              User List
              {data && (
                <span className="ml-auto text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                  Total {data.count} records
                </span>
              )}
            </CardTitle>
            <CardDescription>
              User data fetched using TanStack Query
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!data?.data || data.data.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-4">📭</p>
                <p>No user data available</p>
                <p className="text-sm mt-2">Use the form above to create the first user</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.data.map((user: User) => (
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'N/A'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        disabled={isLoading}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this user? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteMutation.mutate(user.id)
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
