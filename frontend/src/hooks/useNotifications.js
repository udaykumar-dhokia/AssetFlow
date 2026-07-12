import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { notificationService, activityLogService } from '@/services/notificationService'
import { setUnreadCount, markAllRead as markAllReadAction } from '@/redux/slices/notificationSlice'

export const NOTIFICATION_KEYS = {
  all: ['notifications'],
  list: (params) => [...NOTIFICATION_KEYS.all, params],
  activityLogs: (params) => ['activity-logs', params],
}

/**
 * Fetch notifications for the current user.
 * Also syncs the Redux unreadCount badge.
 */
export const useNotifications = (params = {}) => {
  const dispatch = useDispatch()
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => notificationService.getNotifications(params),
    select: (res) => {
      const notifications = res?.data ?? res ?? []
      return notifications
    },
    onSuccess: (notifications) => {
      const unread = notifications.filter(n => !n.isRead).length
      dispatch(setUnreadCount(unread))
    },
  })
}

/**
 * Mark a single notification as read.
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || 'Failed to mark as read.'),
  })
}

/**
 * Mark all notifications as read.
 */
export const useMarkAllRead = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      dispatch(markAllReadAction())
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || 'Failed to mark all as read.'),
  })
}

/**
 * Fetch activity logs (ADMIN / ASSET_MANAGER only).
 */
export const useActivityLogs = (params = {}) => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.activityLogs(params),
    queryFn: () => activityLogService.getActivityLogs(params),
    select: (res) => res?.data ?? res ?? [],
  })
}
