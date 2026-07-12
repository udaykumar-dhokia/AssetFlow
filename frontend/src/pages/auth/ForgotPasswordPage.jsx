// pages/auth/ForgotPasswordPage.jsx
// POST /auth/forgot-password → redirect to /reset-password with email in state.

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Mail, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

import { forgotPasswordSchema } from '@/utils/validators'
import { ROUTES } from '@/constants/routes'
import authService from '@/services/authService'
import FormInputField from '@/components/common/FormInputField'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const { mutate: forgotPasswordMutation, isPending: isForgotPending } = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (_, data) => {
      toast.success('Password reset OTP sent to your email.')
      navigate(ROUTES.RESET_PASSWORD, { state: { email: data.email } })
    },
    onError: (err) => {
      const msg = err.response?.status === 404
        ? 'No account found with this email address.'
        : (err.message || 'Failed to send reset OTP')
      toast.error(msg)
    }
  })

  const onSubmit = (data) => forgotPasswordMutation(data)

  return (
    <div>
      <div className="mb-9">
        <h1 className="text-[28px] font-bold text-text-primary tracking-[-0.025em] leading-[1.2] mb-2">
          Forgot password?
        </h1>
        <p className="text-sm text-text-tertiary leading-[1.65]">
          No worries. Enter your email and we'll send you a reset OTP.
          It expires in <span className="text-text-secondary font-medium">15 minutes</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormInputField
          name="email"
          control={control}
          label="Email"
          type="email"
          placeholder="Enter email"
          errors={errors}
          icon={<Mail size={15} />}
          autoFocus
        />

        <button id="forgot-submit" type="submit" disabled={isForgotPending}
          className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-btn bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/60 text-white text-sm font-semibold tracking-[-0.01em] transition-colors cursor-pointer disabled:cursor-not-allowed">
          {isForgotPending
            ? <><Loader2 size={14} className="animate-spin" /> Sending OTP...</>
            : <>Send Reset OTP <ArrowRight size={14} /></>}
        </button>
      </form>

      <p className="text-center text-[13px] text-text-tertiary mt-7">
        Remembered it?{' '}
        <Link to={ROUTES.LOGIN} className="text-accent-500 font-semibold hover:text-accent-600">Back to login</Link>
      </p>
    </div>
  )
}
