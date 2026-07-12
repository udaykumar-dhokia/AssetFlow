import api from './api'

export const notificationService = {
  /**
   * Fetch all notifications for the current user.
   * @param {{ unreadOnly?: boolean }} params
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  /**
   * Mark a single notification as read.
   * @param {string} id
   */
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`)
    return response.data
  },

  /**
   * Mark all notifications as read.
   */
  markAllRead: async () => {
    const response = await api.patch('/notifications/read-all')
    return response.data
  },
}

export const activityLogService = {
  /**
   * Fetch system-wide activity logs (ADMIN / ASSET_MANAGER only).
   * @param {{ userId?: string, action?: string, entityType?: string }} params
   */
  getActivityLogs: async (params = {}) => {
    const response = await api.get('/activity-logs', { params })
    return response.data
  },
}
