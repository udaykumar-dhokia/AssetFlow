// layouts/AppLayout.jsx
// Main app layout: Sidebar + Header + page content outlet.
// Initializes socket connection on mount.

import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useSocketInit } from '@/hooks/useSocket'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import Sidebar from './Sidebar'
import Header  from './Header'
import { cn }  from '@/lib/utils'

// Map route paths to page titles for the header
const ROUTE_TITLES = {
  '/':              'Dashboard',
  '/org-setup':     'Organization Setup',
  '/assets':        'Assets',
  '/allocation':    'Allocation & Transfer',
  '/booking':       'Resource Booking',
  '/maintenance':   'Maintenance',
  '/audit':         'Audit',
  '/reports':       'Reports & Analytics',
  '/notifications': 'Notifications',
  '/profile':       'My Profile',
  '/settings':      'Settings',
}

export default function AppLayout() {
  const { token } = useAuth()
  const location  = useLocation()

  // Initialize socket with auth token
  useSocketInit(token)

  // Derive page title from current route
  const pageTitle = ROUTE_TITLES[location.pathname] ?? ''

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="app-main">
        {/* Header */}
        <Header title={pageTitle} />

        {/* Page Content */}
        <main
          className={cn(
            'app-content',
            'animate-fade-in',
          )}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
