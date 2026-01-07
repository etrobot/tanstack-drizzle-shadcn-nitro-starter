// Example API endpoint demonstrating database queries with libsql/D1
// This file shows how to create server-side API endpoints with database access

import { createServerFn } from '@tanstack/react-start'
import { getDb, users } from '../../../db'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

// Example data type
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// GET: Fetch all users from database
export const getUsers = createServerFn({ method: 'GET' })
  .inputValidator((data: Record<string, never> = {}) => data)
  .handler(async ({ data }) => {
    console.log('[getUsers] Starting execution, input params:', JSON.stringify(data, null, 2))
    
    const db = await getDb()
    console.log('[getUsers] Database connection successful, db type:', db.constructor.name)
    
    console.log('[getUsers] Preparing to execute query: select from users order by createdAt desc limit 10')
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(10)
    console.log('[getUsers] Query successful, returned data count:', allUsers.length)
    console.log('[getUsers] Query result:', JSON.stringify(allUsers, null, 2))

    const result = {
      success: true,
      data: allUsers,
      count: allUsers.length,
      timestamp: new Date().toISOString(),
    }
    console.log('[getUsers] Return result:', JSON.stringify(result, null, 2))
    return result
  })

// POST: Create a new user
export const createUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { name?: string; email: string }) => {
    const schema = z.object({
      name: z.string().optional(),
      email: z.string().email('Valid email is required'),
    })
    return schema.parse(data)
  })
  .handler(async ({ data }) => {
    console.log('[createUser] Starting execution, input params:', JSON.stringify(data, null, 2))
    
    const db = await getDb()
    console.log('[createUser] Database connection successful')

    // Check if user already exists
    console.log('[createUser] Checking if user already exists, email:', data.email)
    const existingUser = await db.select().from(users).where(eq(users.email, data.email))
    console.log('[createUser] Existing user query result:', existingUser.length)
    if (existingUser.length > 0) {
      console.log('[createUser] User already exists, returning error')
      return {
        success: false,
        error: 'User with this email already exists',
        timestamp: new Date().toISOString(),
      }
    }

    // Insert new user
    const insertData = {
      name: data.name || 'Anonymous',
      email: data.email,
    }
    console.log('[createUser] Preparing to insert user data:', JSON.stringify(insertData, null, 2))
    await db.insert(users).values(insertData)
    console.log('[createUser] User insertion successful')

    // Fetch the newly created user
    const newUser = await db.select().from(users).where(eq(users.email, data.email))
    console.log('[createUser] Querying newly created user:', JSON.stringify(newUser, null, 2))

    const result = {
      success: true,
      data: newUser[0],
      message: 'User created successfully!',
      timestamp: new Date().toISOString(),
    }
    console.log('[createUser] Return result:', JSON.stringify(result, null, 2))
    return result
  }
)

// PUT: Update a user
export const updateUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; name?: string; email?: string }) => {
    const schema = z.object({
      userId: z.string(),
      name: z.string().optional(),
      email: z.string().email().optional(),
    })
    return schema.parse(data)
  })
  .handler(async ({ data }) => {
    console.log('[updateUser] Starting execution, input params:', JSON.stringify(data, null, 2))
    
    if (!data.userId) {
      console.log('[updateUser] Missing userId, returning error')
      return {
        success: false,
        error: 'User ID is required',
        timestamp: new Date().toISOString(),
      }
    }

    const db = await getDb()
    console.log('[updateUser] Database connection successful')

    // Check if user exists
    console.log('[updateUser] Checking if user exists, userId:', data.userId)
    const existingUser = await db.select().from(users).where(eq(users.id, data.userId))
    console.log('[updateUser] User query result:', existingUser.length)
    if (existingUser.length === 0) {
      console.log('[updateUser] User does not exist, returning error')
      return {
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      }
    }

    // Update user
    const updateData = {
      name: data.name,
      email: data.email,
      updatedAt: new Date(),
    }
    console.log('[updateUser] Preparing to update user data:', JSON.stringify(updateData, null, 2))
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, data.userId))
    console.log('[updateUser] User update successful')

    // Fetch updated user
    const updatedUser = await db.select().from(users).where(eq(users.id, data.userId))
    console.log('[updateUser] Querying updated user:', JSON.stringify(updatedUser, null, 2))

    const result = {
      success: true,
      data: updatedUser[0],
      message: 'User updated successfully!',
      timestamp: new Date().toISOString(),
    }
    console.log('[updateUser] Return result:', JSON.stringify(result, null, 2))
    return result
  }
)

// DELETE: Delete a user by ID
export const deleteUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string }) => {
    const schema = z.object({
      userId: z.string(),
    })
    return schema.parse(data)
  })
  .handler(async ({ data }) => {
    console.log('[deleteUser] Starting execution, input params:', JSON.stringify(data, null, 2))
    
    if (!data.userId) {
      console.log('[deleteUser] Missing userId, returning error')
      return {
        success: false,
        error: 'User ID is required',
        timestamp: new Date().toISOString(),
      }
    }

    const db = await getDb()
    console.log('[deleteUser] Database connection successful')

    console.log('[deleteUser] Preparing to delete user, userId:', data.userId)
    await db.delete(users).where(eq(users.id, data.userId))
    console.log('[deleteUser] User deletion successful')

    const result = {
      success: true,
      message: 'User deleted successfully!',
      timestamp: new Date().toISOString(),
    }
    console.log('[deleteUser] Return result:', JSON.stringify(result, null, 2))
    return result
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
