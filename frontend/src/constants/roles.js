// constants/roles.js
// User role definitions for AssetFlow.
// Used in RoleGuard, usePermissions, and Sidebar nav filtering.

export const ROLES = {
  ADMIN:            'admin',
  ASSET_MANAGER:    'asset_manager',
  DEPARTMENT_HEAD:  'department_head',
  EMPLOYEE:         'employee',
}

// Role display labels
export const ROLE_LABELS = {
  [ROLES.ADMIN]:           'Administrator',
  [ROLES.ASSET_MANAGER]:   'Asset Manager',
  [ROLES.DEPARTMENT_HEAD]: 'Department Head',
  [ROLES.EMPLOYEE]:        'Employee',
}

// Role hierarchy (higher index = higher privilege)
export const ROLE_HIERARCHY = [
  ROLES.EMPLOYEE,
  ROLES.DEPARTMENT_HEAD,
  ROLES.ASSET_MANAGER,
  ROLES.ADMIN,
]

/**
 * Check if a user's role has at least the required role level.
 * @param {string} userRole
 * @param {string} requiredRole
 * @returns {boolean}
 */
export function hasMinimumRole(userRole, requiredRole) {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(requiredRole)
}
