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

// Shadcn UI components
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

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
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area wrapped in SidebarInset */}
          <SidebarInset className="flex w-full flex-col">
            {/* Header */}
            <Header title={pageTitle} />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden animate-fade-in p-4">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
