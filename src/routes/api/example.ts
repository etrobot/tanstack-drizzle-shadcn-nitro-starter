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
    console.log('[getUsers] 开始执行，入参:', JSON.stringify(data, null, 2))
    
    const db = await getDb()
    console.log('[getUsers] 数据库连接成功，db类型:', db.constructor.name)
    
    console.log('[getUsers] 准备执行查询: select from users order by createdAt desc limit 10')
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(10)
    console.log('[getUsers] 查询成功，返回数据数量:', allUsers.length)
    console.log('[getUsers] 查询结果:', JSON.stringify(allUsers, null, 2))

    const result = {
      success: true,
      data: allUsers,
      count: allUsers.length,
      timestamp: new Date().toISOString(),
    }
    console.log('[getUsers] 返回结果:', JSON.stringify(result, null, 2))
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
    console.log('[createUser] 开始执行，入参:', JSON.stringify(data, null, 2))
    
    const db = await getDb()
    console.log('[createUser] 数据库连接成功')

    // Check if user already exists
    console.log('[createUser] 检查用户是否已存在，email:', data.email)
    const existingUser = await db.select().from(users).where(eq(users.email, data.email))
    console.log('[createUser] 已存在用户查询结果:', existingUser.length)
    if (existingUser.length > 0) {
      console.log('[createUser] 用户已存在，返回错误')
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
    console.log('[createUser] 准备插入用户数据:', JSON.stringify(insertData, null, 2))
    await db.insert(users).values(insertData)
    console.log('[createUser] 用户插入成功')

    // Fetch the newly created user
    const newUser = await db.select().from(users).where(eq(users.email, data.email))
    console.log('[createUser] 查询新创建的用户:', JSON.stringify(newUser, null, 2))

    const result = {
      success: true,
      data: newUser[0],
      message: 'User created successfully!',
      timestamp: new Date().toISOString(),
    }
    console.log('[createUser] 返回结果:', JSON.stringify(result, null, 2))
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
    console.log('[updateUser] 开始执行，入参:', JSON.stringify(data, null, 2))
    
    if (!data.userId) {
      console.log('[updateUser] 缺少userId，返回错误')
      return {
        success: false,
        error: 'User ID is required',
        timestamp: new Date().toISOString(),
      }
    }

    const db = await getDb()
    console.log('[updateUser] 数据库连接成功')

    // Check if user exists
    console.log('[updateUser] 检查用户是否存在，userId:', data.userId)
    const existingUser = await db.select().from(users).where(eq(users.id, data.userId))
    console.log('[updateUser] 用户查询结果:', existingUser.length)
    if (existingUser.length === 0) {
      console.log('[updateUser] 用户不存在，返回错误')
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
    console.log('[updateUser] 准备更新用户数据:', JSON.stringify(updateData, null, 2))
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, data.userId))
    console.log('[updateUser] 用户更新成功')

    // Fetch updated user
    const updatedUser = await db.select().from(users).where(eq(users.id, data.userId))
    console.log('[updateUser] 查询更新后的用户:', JSON.stringify(updatedUser, null, 2))

    const result = {
      success: true,
      data: updatedUser[0],
      message: 'User updated successfully!',
      timestamp: new Date().toISOString(),
    }
    console.log('[updateUser] 返回结果:', JSON.stringify(result, null, 2))
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
    console.log('[deleteUser] 开始执行，入参:', JSON.stringify(data, null, 2))
    
    if (!data.userId) {
      console.log('[deleteUser] 缺少userId，返回错误')
      return {
        success: false,
        error: 'User ID is required',
        timestamp: new Date().toISOString(),
      }
    }

    const db = await getDb()
    console.log('[deleteUser] 数据库连接成功')

    console.log('[deleteUser] 准备删除用户，userId:', data.userId)
    await db.delete(users).where(eq(users.id, data.userId))
    console.log('[deleteUser] 用户删除成功')

    const result = {
      success: true,
      message: 'User deleted successfully!',
      timestamp: new Date().toISOString(),
    }
    console.log('[deleteUser] 返回结果:', JSON.stringify(result, null, 2))
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
