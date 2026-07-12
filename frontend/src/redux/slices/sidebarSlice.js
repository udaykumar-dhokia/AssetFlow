// redux/slices/sidebarSlice.js
// Manages sidebar collapsed/expanded state.

import { createSlice } from '@reduxjs/toolkit'

const SIDEBAR_KEY = 'assetflow_sidebar_collapsed'

const initialState = {
  isCollapsed: localStorage.getItem(SIDEBAR_KEY) === 'true',
}

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isCollapsed = !state.isCollapsed
      localStorage.setItem(SIDEBAR_KEY, String(state.isCollapsed))
    },
    setSidebarCollapsed(state, action) {
      state.isCollapsed = action.payload
      localStorage.setItem(SIDEBAR_KEY, String(action.payload))
    },
  },
})

export const { toggleSidebar, setSidebarCollapsed } = sidebarSlice.actions

export const selectIsSidebarCollapsed = (state) => state.sidebar.isCollapsed

export default sidebarSlice.reducer
