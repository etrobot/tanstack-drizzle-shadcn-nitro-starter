// Example API endpoint demonstrating database queries with libsql/D1
// This file shows how to create server-side API endpoints with database access

import { createServerFn } from '@tanstack/react-start'
import { getDb, users } from '../../../db'
import { eq, desc } from 'drizzle-orm'

// Example data type
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// GET: Fetch all users from database
export const getUsers = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const db = await getDb()
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(10)

      return {
        success: true,
        data: allUsers,
        count: allUsers.length,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Database query error:', error)
      return {
        success: false,
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    }
  }
)

// POST: Create a new user
export const createUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { name?: string; email: string }) => data)
  .handler(async ({ data }) => {
    try {
      // Validate input
      if (!data.email || !data.email.includes('@')) {
        return {
          success: false,
          error: 'Valid email is required',
          timestamp: new Date().toISOString(),
        }
      }

      const db = await getDb()

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, data.email))
      if (existingUser.length > 0) {
        return {
          success: false,
          error: 'User with this email already exists',
          timestamp: new Date().toISOString(),
        }
      }

      // Insert new user
      await db.insert(users).values({
        name: data.name || 'Anonymous',
        email: data.email,
      })

      // Fetch the newly created user
      const newUser = await db.select().from(users).where(eq(users.email, data.email))

      return {
        success: true,
        data: newUser[0],
        message: 'User created successfully!',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Database insert error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
        timestamp: new Date().toISOString(),
      }
    }
  }
)

// DELETE: Delete a user by ID
export const deleteUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    try {
      if (!data.userId) {
        return {
          success: false,
          error: 'User ID is required',
          timestamp: new Date().toISOString(),
        }
      }

      const db = await getDb()

      await db.delete(users).where(eq(users.id, data.userId))

      return {
        success: true,
        message: 'User deleted successfully!',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Database delete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
        timestamp: new Date().toISOString(),
      }
    }
  }
)

// Legacy example endpoint (kept for backwards compatibility)
export const getExampleData = createServerFn({ method: 'GET' }).handler(
  async () => {
    return {
      message: 'Hello from API!',
      timestamp: new Date().toISOString(),
    }
  }
)
