// services/authService.js
// All auth API calls. Never call api.js directly from pages.

import api from './api'

const authService = {
  /** POST /auth/signup */
  signup: (data) => api.post('/auth/signup', data).then(r => r.data),

  /** POST /auth/verify-email */
  verifyEmail: (data) => api.post('/auth/verify-email', data).then(r => r.data),

  /** POST /auth/login */
  login: (data) => api.post('/auth/login', data).then(r => r.data),

  /** POST /auth/login-otp/request */
  requestLoginOtp: (data) => api.post('/auth/login-otp/request', data).then(r => r.data),

  /** POST /auth/login-otp/verify */
  verifyLoginOtp: (data) => api.post('/auth/login-otp/verify', data).then(r => r.data),

  /** POST /auth/forgot-password */
  forgotPassword: (data) => api.post('/auth/forgot-password', data).then(r => r.data),

  /** POST /auth/reset-password */
  resetPassword: (data) => api.post('/auth/reset-password', data).then(r => r.data),
}

export default authService
