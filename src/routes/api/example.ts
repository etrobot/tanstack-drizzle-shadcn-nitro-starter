// Example API endpoint using TanStack Start
// This file demonstrates how to create server-side API endpoints

import { createServerFn } from '@tanstack/react-start'

// Example GET endpoint
export const getExampleData = createServerFn({ method: 'GET' }).handler(
  async () => {
    return {
      message: 'Hello from API!',
      timestamp: new Date().toISOString(),
    }
  }
)

// Example POST endpoint
export const postExampleData = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: { message: string } }) => {
    // Validate and process your data here
    return {
      message: 'Data received!',
      data,
      timestamp: new Date().toISOString(),
    }
  }
)
