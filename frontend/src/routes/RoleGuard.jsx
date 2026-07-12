// routes/RoleGuard.jsx
// Blocks access to routes that require specific roles.
// Renders a 403 Forbidden view for unauthorized roles.

import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'
import { ShieldAlert } from 'lucide-react'

/**
 * @param {object} props
 * @param {string[]} props.allowedRoles - Array of role strings that may access this route
 * @param {React.ReactNode} props.children
 */
export default function RoleGuard({ allowedRoles = [], children }) {
  const { canAccess } = usePermissions()

  if (!canAccess(allowedRoles)) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          'min-h-[60vh] gap-4 text-center px-6'
        )}
      >
        <div className="rounded-full bg-red-50 dark:bg-red-900/20 p-4">
          <ShieldAlert
            size={40}
            className="text-red-500 dark:text-red-400"
          />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Access Denied
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            You don&apos;t have permission to access this page.
            Contact your administrator if you believe this is a mistake.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
