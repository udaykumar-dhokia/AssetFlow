// pages/auth/VerifyEmailPage.jsx
// POST /auth/verify-email — OTP sent after signup.
// Email passed via router state. Expires in 10 minutes.

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { Loader2, ArrowRight, MailCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'

import { verifyEmailSchema } from '@/utils/validators'
import { ROUTES } from '@/constants/routes'
import { loginSuccess } from '@/redux/slices/authSlice'
import { cn } from '@/lib/utils'
import authService from '@/services/authService'

const errorCls = 'mt-1 text-xs text-danger-600'

export default function VerifyEmailPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()

  const email = location.state?.email || ''

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email, otp: '' },
  })

  const { mutate: verifyEmailMutation, isPending: isVerifyPending } = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: (res) => {
      dispatch(loginSuccess(res.data))
      toast.success('Email verified! Welcome to AssetFlow.')
      navigate(ROUTES.DASHBOARD, { replace: true })
    },
    onError: (err) => {
      toast.error(err.message || 'Invalid or expired OTP')
    }
  })

  const onSubmit = (data) => verifyEmailMutation(data)

  const handleResend = async () => {
    try {
      await authService.requestLoginOtp({ email })
      toast.info('A new OTP has been sent to your email.')
    } catch {
      toast.info('Failed to resend OTP. Please try again.')
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      {/* Icon badge */}
      <motion.div variants={fadeIn} className="w-14 h-14 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mb-8">
        <MailCheck size={26} className="text-accent-500" />
      </motion.div>

      <motion.div variants={fadeIn} className="mb-9">
        <h1 className="text-[28px] font-bold text-text-primary tracking-[-0.025em] leading-[1.2] mb-2">
          Check your email
        </h1>
        <p className="text-sm text-text-tertiary leading-[1.65]">
          We sent a 6-digit verification code to{' '}
          <span className="text-text-primary font-medium">{email || 'your email'}</span>.
          {' '}Enter it below to verify your account. Expires in <span className="text-text-secondary font-medium">10 minutes</span>.
        </p>
      </motion.div>

      <motion.form variants={fadeIn} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <input type="hidden" {...register('email')} />

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2.5">
            Verification code
          </label>
          <input
            id="verify-otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
            placeholder="0 0 0 0 0 0"
            className={cn(
              'w-full h-[72px] text-center text-[32px] font-mono font-bold tracking-[0.4em] rounded-xl border transition-colors outline-none',
              'bg-bg-subtle text-text-primary placeholder:text-text-disabled placeholder:text-2xl placeholder:tracking-[0.25em]',
              errors.otp
                ? 'border-border-danger focus:ring-2 focus:ring-danger-600/15'
                : 'border-border-default focus:border-border-accent focus:ring-2 focus:ring-accent-500/10'
            )}
            {...register('otp')}
          />
          {errors.otp && <p className={errorCls}>{errors.otp.message}</p>}
        </div>

        <button id="verify-submit" type="submit" disabled={isVerifyPending}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/60 text-white text-sm font-semibold tracking-[-0.01em] transition-colors cursor-pointer disabled:cursor-not-allowed">
          {isVerifyPending
            ? <><Loader2 size={15} className="animate-spin" /> Verifying...</>
            : <>Verify Email <ArrowRight size={15} /></>}
        </button>
      </motion.form>

      <motion.div variants={fadeIn} className="mt-8 space-y-3.5 text-center">
        <p className="text-[14px] text-text-tertiary">
          Didn&apos;t receive the code?{' '}
          <button type="button" onClick={handleResend} className="text-accent-500 font-semibold hover:text-accent-600 cursor-pointer">
            Resend
          </button>
        </p>
        <p className="text-[14px] text-text-tertiary">
          Wrong account?{' '}
          <Link to={ROUTES.REGISTER} className="text-accent-500 font-semibold hover:text-accent-600">
            Sign up again
          </Link>
        </p>
      </motion.div>
    </motion.div>
  )
}
