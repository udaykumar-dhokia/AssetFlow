// hooks/usePermissions.js
// Role-based permission checks for UI rendering and route guards.

import { ROLES, ROLE_HIERARCHY, hasMinimumRole } from '@/constants/roles'
import { useAuth } from './useAuth'

/**
 * Returns permission check helpers based on the current user's role.
 *
 * @returns {{
 *   can: (permission: string) => boolean,
 *   hasRole: (role: string) => boolean,
 *   hasMinRole: (role: string) => boolean,
 *   canAccess: (allowedRoles: string[]) => boolean,
 * }}
 */
export function usePermissions() {
  const { role } = useAuth()

  /**
   * Check if user has exactly a specific role.
   */
  const hasRole = (requiredRole) => role === requiredRole

  /**
   * Check if user has at least the required role level (hierarchy check).
   */
  const hasMinRole = (requiredRole) => {
    if (!role) return false
    return hasMinimumRole(role, requiredRole)
  }

  /**
   * Check if user's role is in the allowed roles array.
   */
  const canAccess = (allowedRoles = []) => {
    if (!role) return false
    if (allowedRoles.length === 0) return true
    return allowedRoles.includes(role)
  }

  /**
   * Named permission checks for business actions.
   * Add more as features are built out.
   */
  const can = (permission) => {
    switch (permission) {
      // Org Setup
      case 'manage_departments':
      case 'manage_categories':
      case 'manage_employees':
        return hasMinRole(ROLES.ADMIN)

      // Assets
      case 'register_asset':
      case 'edit_asset':
      case 'delete_asset':
        return hasMinRole(ROLES.ASSET_MANAGER)

      case 'view_assets':
        return hasMinRole(ROLES.EMPLOYEE)

      // Allocation
      case 'allocate_asset':
      case 'approve_transfer':
        return hasMinRole(ROLES.ASSET_MANAGER)

      case 'request_transfer':
        return hasMinRole(ROLES.DEPARTMENT_HEAD)

      // Booking
      case 'book_resource':
        return hasMinRole(ROLES.EMPLOYEE)

      case 'manage_bookings':
        return hasMinRole(ROLES.ASSET_MANAGER)

      // Maintenance
      case 'raise_maintenance':
        return hasMinRole(ROLES.EMPLOYEE)

      case 'approve_maintenance':
      case 'assign_technician':
        return hasMinRole(ROLES.ASSET_MANAGER)

      // Audit
      case 'conduct_audit':
        return hasMinRole(ROLES.ASSET_MANAGER)

      // Reports
      case 'view_reports':
        return hasMinRole(ROLES.DEPARTMENT_HEAD)

      case 'export_reports':
        return hasMinRole(ROLES.ASSET_MANAGER)

      default:
        return false
    }
  }

  return { can, hasRole, hasMinRole, canAccess }
}
