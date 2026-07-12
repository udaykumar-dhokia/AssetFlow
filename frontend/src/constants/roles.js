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

