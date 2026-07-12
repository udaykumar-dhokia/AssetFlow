// config/env.js
// Centralised access to environment variables.
// All env vars are prefixed with VITE_ (Vite requirement).

const env = {
  /** Base URL for all API requests */
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',

  /** Socket.IO server URL */
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8000',

  /** App environment */
  MODE: import.meta.env.MODE ?? 'development',

  /** Is production build */
  IS_PROD: import.meta.env.PROD,

  /** Is development build */
  IS_DEV: import.meta.env.DEV,
}

export default env
