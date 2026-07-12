// hooks/useTheme.js
// Custom hook for theme toggle.

import { useSelector, useDispatch } from 'react-redux'
import { selectTheme, selectIsDark, toggleTheme, setTheme } from '@/redux/slices/themeSlice'

/**
 * @returns {{
 *   theme: 'light'|'dark',
 *   isDark: boolean,
 *   toggleTheme: Function,
 *   setTheme: Function,
 * }}
 */
export function useTheme() {
  const dispatch = useDispatch()
  const theme    = useSelector(selectTheme)
  const isDark   = useSelector(selectIsDark)

  return {
    theme,
    isDark,
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme:    (t) => dispatch(setTheme(t)),
  }
}
