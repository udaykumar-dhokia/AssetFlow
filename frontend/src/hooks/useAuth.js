// hooks/useAuth.js
// Custom hook for authentication state.
// Provides a clean API for components and routes to access auth data.

import { useSelector, useDispatch } from 'react-redux'
import { ROLES } from '@/constants/roles'
import {
  selectToken,
  selectUser,
  selectUserRole,
  selectIsAuthenticated,
  selectIsInitializing,
  selectIsAuthLoading,
  logout as logoutAction,
} from '@/redux/slices/authSlice'

/**
 * @returns {{
 *   token: string|null,
 *   user: object|null,
 *   role: string|null,
 *   isAuthenticated: boolean,
 *   isInitializing: boolean,
 *   isAuthLoading: boolean,
 *   logout: Function,
 *   isAdmin: boolean,
 *   isAssetManager: boolean,
 *   isDepartmentHead: boolean,
 *   isEmployee: boolean,
 * }}
 */
export function useAuth() {
  const dispatch    = useDispatch()
  const token       = useSelector(selectToken)
  const user        = useSelector(selectUser)
  const role        = useSelector(selectUserRole)
  const isAuthenticated  = useSelector(selectIsAuthenticated)
  const isInitializing   = useSelector(selectIsInitializing)
  const isAuthLoading    = useSelector(selectIsAuthLoading)

  const logout = () => dispatch(logoutAction())

  return {
    token,
    user,
    role,
    isAuthenticated,
    isInitializing,
    isAuthLoading,
    logout,
    // Role shorthand flags
    isAdmin:          role === ROLES.ADMIN,
    isAssetManager:   role === ROLES.ASSET_MANAGER,
    isDepartmentHead: role === ROLES.DEPARTMENT_HEAD,
    isEmployee:       role === ROLES.EMPLOYEE,
  }
}
