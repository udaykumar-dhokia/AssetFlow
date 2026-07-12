// redux/store.js
// Redux Toolkit store — central state management.
// Only stores: auth, sidebar, theme, notifications, socket.
// API / server data NEVER goes here — use TanStack Query.

import { configureStore } from '@reduxjs/toolkit'
import authReducer         from './slices/authSlice'
import sidebarReducer      from './slices/sidebarSlice'
import themeReducer        from './slices/themeSlice'
import notificationReducer from './slices/notificationSlice'
import socketReducer       from './slices/socketSlice'

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    sidebar:       sidebarReducer,
    theme:         themeReducer,
    notifications: notificationReducer,
    socket:        socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Suppress serializability warnings for socket instance
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
})

export default store
