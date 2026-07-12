// pages/auth/LoginPage.jsx
// Design inspired by ConnectVision: large "Welcome back" heading,
// icon-prefixed inputs, full-width CTA button.

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

import { loginSchema } from '@/utils/validators'
import { ROUTES } from '@/constants/routes'
import { loginSuccess, setAuthLoading } from '@/redux/slices/authSlice'

// ── Shared styles ─────────────────────────────────────────────
const inputWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  height: '48px',
  padding: '0 16px',
  borderRadius: '10px',
  border: '1.5px solid #e4e4e7',
  background: '#fafafa',
  transition: 'border-color 0.15s, background 0.15s',
}

const inputStyle = {
  flex: 1,
  border: 'none',
  background: 'transparent',
  outline: 'none',
  fontSize: '14px',
  color: '#18181b',
  fontFamily: 'inherit',
}

export default function LoginPage() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [showPw, setShowPw] = useState(false)
  const [emailFocus, setEmailFocus] = useState(false)
  const [pwFocus, setPwFocus]       = useState(false)

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data) => {
    try {
      dispatch(setAuthLoading(true))
      // TODO: replace with authService.login(data)
      await new Promise((r) => setTimeout(r, 700))
      dispatch(loginSuccess({
        token: 'mock-token',
        user: { id: '1', name: 'Demo User', email: data.email, role: 'admin' },
      }))
      toast.success('Signed in successfully')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Invalid credentials')
      dispatch(setAuthLoading(false))
    }
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{
          fontSize: '30px',
          fontWeight: 700,
          color: '#09090b',
          letterSpacing: '-0.025em',
          lineHeight: 1.2,
          marginBottom: '8px',
        }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '14px', color: '#71717a', lineHeight: 1.6 }}>
          <span style={{ color: '#2563eb', fontWeight: 500 }}>Sign in</span>
          {' '}to your AssetFlow account to continue managing your assets.
        </p>
      </div>

      {/* ── Form ───────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: '#3f3f46',
            marginBottom: '7px',
          }}>
            Email
          </label>
          <div style={{
            ...inputWrapStyle,
            borderColor: errors.email ? '#e11d48' : emailFocus ? '#2563eb' : '#e4e4e7',
            background: emailFocus ? '#ffffff' : '#fafafa',
            boxShadow: emailFocus ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
          }}>
            <Mail size={16} color={errors.email ? '#e11d48' : emailFocus ? '#2563eb' : '#a1a1aa'} />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              style={inputStyle}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p style={{ fontSize: '12px', color: '#e11d48', marginTop: '5px' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#3f3f46' }}>
              Password
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              style={{ fontSize: '12.5px', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
            >
              Forgot Password?
            </Link>
          </div>
          <div style={{
            ...inputWrapStyle,
            borderColor: errors.password ? '#e11d48' : pwFocus ? '#2563eb' : '#e4e4e7',
            background: pwFocus ? '#ffffff' : '#fafafa',
            boxShadow: pwFocus ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
          }}>
            <Lock size={16} color={errors.password ? '#e11d48' : pwFocus ? '#2563eb' : '#a1a1aa'} />
            <input
              id="login-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              style={inputStyle}
              onFocus={() => setPwFocus(true)}
              onBlur={() => setPwFocus(false)}
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw((p) => !p)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#a1a1aa', lineHeight: 0 }}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ fontSize: '12px', color: '#e11d48', marginTop: '5px' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            height: '48px',
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '10px',
            border: 'none',
            background: isSubmitting ? '#93c5fd' : '#2563eb',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            letterSpacing: '-0.01em',
            transition: 'background 0.15s, transform 0.1s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#1d4ed8' }}
          onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = '#2563eb' }}
        >
          {isSubmitting
            ? <><Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Signing in...</>
            : <>Sign In <ArrowRight size={15} /></>
          }
        </button>
      </form>

      {/* ── Divider ────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        margin: '28px 0',
      }}>
        <div style={{ flex: 1, height: '1px', background: '#e4e4e7' }} />
        <span style={{ fontSize: '12px', color: '#a1a1aa', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
          NEW TO ASSETFLOW?
        </span>
        <div style={{ flex: 1, height: '1px', background: '#e4e4e7' }} />
      </div>

      {/* ── Register link ──────────────────────────────────── */}
      <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#71717a' }}>
        Don&apos;t have an account?{' '}
        <Link
          to={ROUTES.REGISTER}
          style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}
