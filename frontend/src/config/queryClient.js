// config/queryClient.js
// TanStack Query client configuration.
// Shared across the entire app.

import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 60 seconds
      staleTime: 60 * 1000,

      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,

      // Retry failed requests once
      retry: 1,

      // Refetch on window focus in production only
      refetchOnWindowFocus: import.meta.env.PROD,

      // Do not refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 0,
    },
  },
})

export default queryClient
