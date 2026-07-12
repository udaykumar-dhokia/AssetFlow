// redux/slices/notificationSlice.js
// Manages in-app notification state.
// Populated by Socket.IO events — not by API fetch (use TanStack Query for that).

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  /** Array of live notification objects received via socket */
  liveNotifications: [],

  /** Unread count badge (set from API or socket) */
  unreadCount: 0,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Push a new notification received via socket.
     * Keeps only the latest 20 in memory.
     */
    pushNotification(state, action) {
      state.liveNotifications = [
        action.payload,
        ...state.liveNotifications,
      ].slice(0, 20)
      state.unreadCount += 1
    },

    /**
     * Set the unread count (from API response).
     */
    setUnreadCount(state, action) {
      state.unreadCount = action.payload
    },

    /**
     * Mark all notifications as read.
     */
    markAllRead(state) {
      state.unreadCount = 0
      state.liveNotifications = state.liveNotifications.map((n) => ({
        ...n,
        read: true,
      }))
    },

    /**
     * Clear all live notifications (e.g. on logout).
     */
    clearNotifications(state) {
      state.liveNotifications = []
      state.unreadCount = 0
    },
  },
})

export const {
  pushNotification,
  setUnreadCount,
  markAllRead,
  clearNotifications,
} = notificationSlice.actions

export const selectLiveNotifications = (state) => state.notifications.liveNotifications
export const selectUnreadCount       = (state) => state.notifications.unreadCount

export default notificationSlice.reducer
