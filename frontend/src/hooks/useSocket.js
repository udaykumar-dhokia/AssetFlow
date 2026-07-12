// hooks/useSocket.js
// Custom hook for subscribing to socket events.
// Handles automatic cleanup via useEffect return.

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getSocket, initSocket } from '@/socket'
import { onEvent } from '@/socket/socketService'
import { SOCKET_EVENTS } from '@/socket/events'
import { socketConnected, socketDisconnected, socketError } from '@/redux/slices/socketSlice'
import { pushNotification } from '@/redux/slices/notificationSlice'

/**
 * Initialize socket for an authenticated user.
 * Should be called once in AppLayout after login.
 *
 * @param {string|null} token
 */
export function useSocketInit(token) {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!token) return

    const socket = initSocket(token)

    const cleanupConnect    = onEvent(SOCKET_EVENTS.CONNECT,       () => dispatch(socketConnected()))
    const cleanupDisconnect = onEvent(SOCKET_EVENTS.DISCONNECT,    () => dispatch(socketDisconnected()))
    const cleanupError      = onEvent(SOCKET_EVENTS.CONNECT_ERROR, (err) => dispatch(socketError(err.message)))

    // Push live notifications to Redux
    const cleanupNotif = onEvent(SOCKET_EVENTS.NOTIFICATION_NEW, (data) => {
      dispatch(pushNotification(data))
    })

    return () => {
      cleanupConnect()
      cleanupDisconnect()
      cleanupError()
      cleanupNotif()
    }
  }, [token, dispatch])
}

/**
 * Subscribe to a socket event and run handler.
 * Auto-cleans up on unmount.
 *
 * @param {string} event - from SOCKET_EVENTS
 * @param {Function} handler
 * @param {Array} deps - additional dependencies
 */
export function useSocketEvent(event, handler, deps = []) {
  useEffect(() => {
    const cleanup = onEvent(event, handler)
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps])
}

/**
 * Get the raw socket instance (for advanced use cases).
 * @returns {import('socket.io-client').Socket|null}
 */
export function useSocket() {
  return getSocket()
}
