// utils/validators.js
// Shared Zod schemas — import per form.

import { z } from 'zod'

// ── Primitives ───────────────────────────────────────────────
export const requiredString = z.string().min(1, 'This field is required')

export const email = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')

export const otp = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits')

export const phoneNumber = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
  .optional()
  .or(z.literal(''))

export const positiveNumber = z
  .number({ invalid_type_error: 'Must be a number' })
  .positive('Must be a positive number')

export const optionalString = z.string().optional().or(z.literal(''))

// ── Role enum ────────────────────────────────────────────────
export const ROLES = ['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD', 'EMPLOYEE']

export const roleEnum = z.enum(ROLES, {
  errorMap: () => ({ message: 'Please select a valid role' }),
})

// ── Auth Schemas ─────────────────────────────────────────────

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

export const loginOtpRequestSchema = z.object({ email })

export const loginOtpVerifySchema = z.object({ email, otp })

export const registerSchema = z
  .object({
    name:            requiredString,
    email,
    password,
  })

export const verifyEmailSchema = z.object({ email, otp })

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({
    otp,
    newPassword:     password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
