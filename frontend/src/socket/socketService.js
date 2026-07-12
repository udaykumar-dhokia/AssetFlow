// socket/socketService.js
// Helper functions for subscribing to and emitting socket events.
// Use these in hooks and components — never use socket directly.

import { getSocket } from './index'
import { SOCKET_EVENTS } from './events'

/**
 * Subscribe to a socket event.
 * Returns an unsubscribe function for cleanup in useEffect.
 *
 * @param {string} event - Event name from SOCKET_EVENTS
 * @param {Function} handler - Callback function
 * @returns {Function} Unsubscribe cleanup function
 */
export function onEvent(event, handler) {
  const socket = getSocket()
  if (!socket) return () => {}

  socket.on(event, handler)

  return () => {
    socket.off(event, handler)
  }
}

/**
 * Emit a socket event with optional data.
 *
 * @param {string} event - Event name from SOCKET_EVENTS
 * @param {*} data - Payload to send
 */
export function emitEvent(event, data) {
  const socket = getSocket()
  if (!socket) {
    console.warn('[Socket] Attempted to emit before socket was initialized')
    return
  }
  socket.emit(event, data)
}

/**
 * Subscribe to a one-time socket event.
 *
 * @param {string} event - Event name from SOCKET_EVENTS
 * @param {Function} handler - Callback function
 */
export function onceEvent(event, handler) {
  const socket = getSocket()
  if (!socket) return
  socket.once(event, handler)
}

/**
 * Notify server that all notifications have been read.
 */
export function markAllNotificationsRead() {
  emitEvent(SOCKET_EVENTS.NOTIFICATION_ALL_READ, null)
}

const socketService = {
  onEvent,
  emitEvent,
  onceEvent,
  markAllNotificationsRead,
}

export default socketService
