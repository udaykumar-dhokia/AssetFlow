// constants/roles.js
// User role definitions for AssetFlow.
// Used in RoleGuard, usePermissions, and Sidebar nav filtering.

export const ROLES = {
  ADMIN:            'ADMIN',
  ASSET_MANAGER:    'ASSET_MANAGER',
  DEPT_HEAD:        'DEPT_HEAD',
  EMPLOYEE:         'EMPLOYEE',
}

// Role display labels
export const ROLE_LABELS = {
  [ROLES.ADMIN]:           'Administrator',
  [ROLES.ASSET_MANAGER]:   'Asset Manager',
  [ROLES.DEPT_HEAD]:       'Department Head',
  [ROLES.EMPLOYEE]:        'Employee',
}

