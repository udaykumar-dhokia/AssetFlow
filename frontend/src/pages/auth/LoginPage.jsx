import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { Mail, Lock, EyeOff, Loader2, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'

import { loginSchema, loginOtpRequestSchema, loginOtpVerifySchema } from '@/utils/validators'
import { ROUTES } from '@/constants/routes'
import { loginSuccess } from '@/redux/slices/authSlice'
import { cn } from '@/lib/utils'
import authService from '@/services/authService'
import FormInputField from '@/components/common/FormInputField'

const errorCls = 'mt-1 text-xs text-danger-600'

export default function LoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [mode, setMode]       = useState('password')
  const [otpEmail, setOtpEmail] = useState('')

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD

  const pwForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const otpEmailForm = useForm({
    resolver: zodResolver(loginOtpRequestSchema),
    defaultValues: { email: '' },
  })

  const otpVerifyForm = useForm({
    resolver: zodResolver(loginOtpVerifySchema),
    defaultValues: { email: '', otp: '' },
  })

  const { mutate: loginMutation, isPending: isLoginPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      dispatch(loginSuccess(res.data))
      toast.success('Signed in successfully')
      navigate(from, { replace: true })
    },
    onError: (err, variables) => {
      if (err.message === 'Please verify your email before logging in') {
        toast.error('Email not verified. Sending OTP...')
        authService.requestLoginOtp({ email: variables.email })
          .catch(() => {}) // Ignore errors here, just redirect
          .finally(() => {
            navigate(ROUTES.VERIFY_EMAIL, { state: { email: variables.email } })
          })
        return
      }
      toast.error(err.message || 'Invalid credentials')
    }
  })

  const { mutate: requestOtpMutation, isPending: isOtpRequestPending } = useMutation({
    mutationFn: authService.requestLoginOtp,
    onSuccess: (_, variables) => {
      setOtpEmail(variables.email)
      otpVerifyForm.setValue('email', variables.email)
      setMode('otp-verify')
      toast.success('OTP sent to your email')
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send OTP')
    }
  })

  const { mutate: verifyOtpMutation, isPending: isOtpVerifyPending } = useMutation({
    mutationFn: authService.verifyLoginOtp,
    onSuccess: (res) => {
      dispatch(loginSuccess(res.data))
      toast.success('Signed in successfully')
      navigate(from, { replace: true })
    },
    onError: (err) => {
      toast.error(err.message || 'Invalid or expired OTP')
    }
  })

  const onPasswordLogin = (data) => loginMutation(data)
  const onRequestOtp = (data) => requestOtpMutation(data)
  const onVerifyOtp = (data) => verifyOtpMutation(data)

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  if (mode === 'password') {
    const { handleSubmit, formState: { errors } } = pwForm
    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        <motion.div variants={fadeIn} className="mb-9">
          <h1 className="text-[30px] font-bold text-text-primary tracking-[-0.025em] leading-[1.2] mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-text-tertiary">
            <span className="text-accent-500 font-medium">Sign in</span>{' '}
            to your AssetFlow account to continue.
          </p>
        </motion.div>

        <motion.form variants={fadeIn} onSubmit={handleSubmit(onPasswordLogin)} noValidate className="space-y-4">
          <FormInputField
            name="email"
            control={pwForm.control}
            label="Email"
            type="email"
            placeholder="Enter email"
            errors={errors}
            icon={<Mail size={15} />}
          />

          <div>
          
            <FormInputField
              name="password"
              control={pwForm.control}
              label="Password"
              type="password"
              placeholder="Enter password"
              errors={errors}
              icon={<Lock size={15} />}
            />
              <div className="flex items-center justify-end mb-1.5 mt-2">
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-accent-500 font-medium hover:text-accent-600">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button id="login-submit" type="submit" disabled={isLoginPending}
            className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-btn bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/60 text-white text-sm font-semibold tracking-[-0.01em] transition-colors cursor-pointer disabled:cursor-not-allowed">
            {isLoginPending ? <><Loader2 size={14} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={14} /></>}
          </button>
        </motion.form>

        <motion.div variants={fadeIn}>
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-border-default" />
            <span className="text-[11px] text-text-disabled uppercase tracking-[0.06em]">or</span>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          <button onClick={() => setMode('otp-email')}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-btn border border-border-default hover:border-border-strong hover:bg-bg-subtle text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            <KeyRound size={14} /> Login with OTP
          </button>

          <p className="text-center text-[13px] text-text-tertiary mt-7">
            Don&apos;t have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-accent-500 font-semibold hover:text-accent-600">Create an account</Link>
          </p>
        </motion.div>
      </motion.div>
    )
  }

  if (mode === 'otp-email') {
    const { handleSubmit, formState: { errors } } = otpEmailForm
    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        <motion.button variants={fadeIn} type="button" onClick={() => setMode('password')} className="flex items-center gap-1.5 text-sm font-medium text-text-tertiary hover:text-text-primary mb-8 transition-colors cursor-pointer">
          <ArrowLeft size={16} /> Back to password login
        </motion.button>
        <motion.div variants={fadeIn} className="mb-9">
          <h1 className="text-[28px] font-bold text-text-primary tracking-[-0.025em] leading-[1.2] mb-2">Login with OTP</h1>
          <p className="text-sm text-text-tertiary">Enter your email and we'll send a one-time passcode.</p>
        </motion.div>
        <motion.form variants={fadeIn} onSubmit={handleSubmit(onRequestOtp)} noValidate className="space-y-4">
          <FormInputField
            name="email"
            control={otpEmailForm.control}
            label="Email"
            type="email"
            placeholder="Enter email"
            errors={errors}
            icon={<Mail size={15} />}
          />
          <button type="submit" disabled={isOtpRequestPending}
            className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-btn bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/60 text-white text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed">
            {isOtpRequestPending ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <>Send OTP <ArrowRight size={14} /></>}
          </button>
        </motion.form>
      </motion.div>
    )
  }

  const { register, handleSubmit, formState: { errors } } = otpVerifyForm
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <motion.button variants={fadeIn} type="button" onClick={() => setMode('otp-email')} className="flex items-center gap-1.5 text-sm font-medium text-text-tertiary hover:text-text-primary mb-8 transition-colors cursor-pointer">
        <ArrowLeft size={16} /> Change email
      </motion.button>
      <motion.div variants={fadeIn} className="mb-9">
        <h1 className="text-[28px] font-bold text-text-primary tracking-[-0.025em] leading-[1.2] mb-2">Enter your OTP</h1>
        <p className="text-sm text-text-tertiary">
          We sent a 6-digit code to{' '}
          <span className="text-text-primary font-medium">{otpEmail}</span>.{' '}
          Expires in 5 minutes.
        </p>
      </motion.div>
      <motion.form variants={fadeIn} onSubmit={handleSubmit(onVerifyOtp)} noValidate className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2.5">6-digit OTP</label>
          <input type="text" inputMode="numeric" maxLength={6} autoComplete="one-time-code"
            placeholder="0 0 0 0 0 0"
            className={cn(
              'w-full h-[72px] text-center text-[32px] font-mono font-bold tracking-[0.4em] rounded-xl border transition-colors outline-none',
              'bg-bg-subtle text-text-primary placeholder:text-text-disabled placeholder:text-2xl placeholder:tracking-[0.25em]',
              errors.otp
                ? 'border-border-danger focus:ring-2 focus:ring-danger-600/15'
                : 'border-border-default focus:border-border-accent focus:ring-2 focus:ring-accent-500/10'
            )}
            {...register('otp')} />
          {errors.otp && <p className={errorCls}>{errors.otp.message}</p>}
        </div>
        <input type="hidden" {...register('email')} />
        <button type="submit" disabled={isOtpVerifyPending}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/60 text-white text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed">
          {isOtpVerifyPending ? <><Loader2 size={15} className="animate-spin" /> Verifying...</> : <>Verify & Sign In <ArrowRight size={15} /></>}
        </button>
      </motion.form>
      <motion.p variants={fadeIn} className="text-center text-[14px] text-text-tertiary mt-8">
        Didn&apos;t receive it?{' '}
        <button 
          type="button" 
          disabled={isOtpRequestPending}
          onClick={() => requestOtpMutation({ email: otpEmail })} 
          className="text-accent-500 font-semibold hover:text-accent-600 disabled:opacity-50 cursor-pointer"
        >
          {isOtpRequestPending ? 'Resending...' : 'Resend OTP'}
        </button>
      </motion.p>
    </motion.div>
  )
}
