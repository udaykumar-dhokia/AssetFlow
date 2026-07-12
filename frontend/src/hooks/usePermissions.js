// hooks/usePermissions.js

import { ROLES } from '@/constants/roles'
import { ROLE_PERMISSIONS } from '@/constants/permissions'
import { useAuth } from './useAuth'


export function usePermissions() {
  const { role } = useAuth()

  /**
   * Check if user has exactly a specific role.
   */
  const hasRole = (requiredRole) => role === requiredRole



  /**
   * Check if user's role is in the allowed roles array.
   */
  const canAccess = (allowedRoles = []) => {
    if (!role) return false
    if (allowedRoles.length === 0) return true
    return allowedRoles.includes(role)
  }

  /**
   * Named permission checks for business actions based on ROLE_PERMISSIONS mapping.
   */
  const can = (permission) => {
    if (!role) return false
    
    const rolePerms = ROLE_PERMISSIONS[role] || []
    return rolePerms.includes(permission)
  }

  return { can, hasRole, canAccess }
}
