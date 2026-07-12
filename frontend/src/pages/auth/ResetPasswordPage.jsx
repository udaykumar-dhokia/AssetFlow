// pages/auth/ResetPasswordPage.jsx
// POST /auth/reset-password — OTP + new password.
// Email passed via router state from ForgotPasswordPage.

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { resetPasswordSchema } from '@/utils/validators'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import authService from '@/services/authService'
import FormInputField from '@/components/common/FormInputField'

const labelCls = 'block text-xs font-medium text-text-secondary mb-1.5'
const errorCls = 'mt-1 text-xs text-danger-600'

export default function ResetPasswordPage() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const email = location.state?.email || ''

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
  })

  const { mutate: resetPasswordMutation, isPending: isResetPending } = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully. Please sign in.')
      navigate(ROUTES.LOGIN, { replace: true })
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Reset failed'
      toast.error(msg)
    }
  })

  const onSubmit = (data) => {
    const { confirmPassword, ...payload } = data
    resetPasswordMutation({ email, ...payload })
  }

  return (
    <div>
      {/* Icon badge */}
      <div className="w-14 h-14 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mb-8">
        <ShieldCheck size={26} className="text-accent-500" />
      </div>

      <div className="mb-9">
        <h1 className="text-[28px] font-bold text-text-primary tracking-[-0.025em] leading-[1.2] mb-2">
          Reset your password
        </h1>
        <p className="text-sm text-text-tertiary leading-[1.65]">
          Enter the 6-digit OTP sent to{' '}
          <span className="text-text-primary font-medium">{email || 'your email'}</span>{' '}
          and choose a new password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* OTP */}
        <div>
          <label className={labelCls}>Reset OTP</label>
          <input
            id="reset-otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
            placeholder="000000"
            className={cn(
              'w-full h-14 text-center text-[28px] font-mono font-bold tracking-[0.4em] rounded-input border transition-colors outline-none',
              'bg-bg-subtle text-text-primary placeholder:text-text-disabled placeholder:text-lg placeholder:tracking-[0.2em]',
              errors.otp
                ? 'border-border-danger focus:ring-2 focus:ring-danger-600/15'
                : 'border-border-default focus:border-border-accent focus:ring-2 focus:ring-accent-500/10'
            )}
            {...register('otp')}
          />
          {errors.otp && <p className={errorCls}>{errors.otp.message}</p>}
        </div>

        {/* New Password */}
        <FormInputField
          name="newPassword"
          control={control}
          label="New password"
          type="password"
          placeholder="Enter new password"
          errors={errors}
          icon={<Lock size={15} />}
        />

        {/* Confirm Password */}
        <FormInputField
          name="confirmPassword"
          control={control}
          label="Confirm new password"
          type="password"
          placeholder="Confirm new password"
          errors={errors}
          icon={<Lock size={15} />}
        />

        <button id="reset-submit" type="submit" disabled={isResetPending}
          className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-btn bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/60 text-white text-sm font-semibold tracking-[-0.01em] transition-colors cursor-pointer disabled:cursor-not-allowed">
          {isResetPending
            ? <><Loader2 size={14} className="animate-spin" /> Resetting...</>
            : <>Reset Password <ArrowRight size={14} /></>}
        </button>
      </form>

      <p className="text-center text-[13px] text-text-tertiary mt-7">
        Remembered it?{' '}
        <Link to={ROUTES.LOGIN} className="text-accent-500 font-semibold hover:text-accent-600">Back to login</Link>
      </p>
    </div>
  )
}
