import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId as createCuid } from '@paralleldrive/cuid2';

// Lazy initialization to avoid global scope issues in Cloudflare Workers
const createId = () => createCuid();

// Example: Users table (basic user management)
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'timestamp_ms' }),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
});

// Example: Sessions table (for authentication)
export const sessions = sqliteTable('sessions', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
});

// Add your own tables here following the same pattern
