// redux/slices/themeSlice.js
// Manages light/dark theme state.
// Syncs with <html> class and localStorage.

import { createSlice } from '@reduxjs/toolkit'

const THEME_KEY = 'assetflow_theme'

function getInitialTheme() {
  // Force light mode for now to ensure white-first enterprise UI
  localStorage.setItem(THEME_KEY, 'light')
  return 'light'
}

function applyTheme(theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

const initialState = {
  theme: initialTheme,
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      applyTheme(state.theme)
      localStorage.setItem(THEME_KEY, state.theme)
    },
    setTheme(state, action) {
      state.theme = action.payload
      applyTheme(state.theme)
      localStorage.setItem(THEME_KEY, action.payload)
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions

export const selectTheme    = (state) => state.theme.theme
export const selectIsDark   = (state) => state.theme.theme === 'dark'

export default themeSlice.reducer
