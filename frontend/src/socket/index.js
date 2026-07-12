// socket/index.js
// Socket.IO client instance.
// Initialized lazily — call initSocket(token) after login.

import { io } from 'socket.io-client'
import env from '@/config/env'

let socket = null

/**
 * Initialize and return the Socket.IO client.
 * Call this after the user logs in with a valid token.
 *
 * @param {string} token - JWT token for authentication
 * @returns {import('socket.io-client').Socket}
 */
export function initSocket(token) {
  if (socket) {
    socket.disconnect()
  }

  socket = io(env.SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    autoConnect: true,
  })

  return socket
}

/**
 * Get the existing socket instance.
 * Returns null if socket hasn't been initialized.
 *
 * @returns {import('socket.io-client').Socket | null}
 */
export function getSocket() {
  return socket
}

/**
 * Disconnect and destroy the socket.
 * Call this on logout.
 */
export function destroySocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
