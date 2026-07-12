// App.jsx
// Application root — composes all providers + router.

import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'

import { store } from '@/redux/store'
import queryClient from '@/config/queryClient'
import AppRouter from '@/routes'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import AppInitializer from '@/components/common/AppInitializer'

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {/* AppInitializer resolves auth state before rendering routes */}
          <AppInitializer>
            <AppRouter />
          </AppInitializer>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            richColors
            expand={false}
            duration={4000}
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
              },
            }}
          />

          {/* React Query Devtools (dev only) */}
          {/* {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
          )} */}
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  )
}
