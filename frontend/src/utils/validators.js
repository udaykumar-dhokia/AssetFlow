// utils/validators.js
// Shared Zod schemas for reuse across multiple forms.
// Import specific schemas in feature-level form schemas.

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

export const phoneNumber = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
  .optional()
  .or(z.literal(''))

export const positiveNumber = z
  .number({ invalid_type_error: 'Must be a number' })
  .positive('Must be a positive number')

export const optionalString = z.string().optional().or(z.literal(''))

// ── Auth Schemas ─────────────────────────────────────────────

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    name:             requiredString,
    email,
    password,
    confirmPassword:  z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email,
})

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
