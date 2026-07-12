// pages/auth/RegisterPage.jsx
// Signup: name, email, password, role → POST /auth/signup → redirect to /verify-email

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { User, Mail, Lock, Loader2, ArrowRight, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

import { registerSchema } from '@/utils/validators'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import authService from '@/services/authService'
import FormInputField from '@/components/common/FormInputField'

const inputWrap = (err) => cn(
  'flex items-center gap-2.5 h-11 px-4 rounded-input border transition-colors',
  'bg-bg-subtle focus-within:bg-bg-canvas',
  err
    ? 'border-border-danger focus-within:ring-2 focus-within:ring-danger-600/15'
    : 'border-border-default focus-within:border-border-accent focus-within:ring-2 focus-within:ring-accent-500/10'
)
const inputCls = 'flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-disabled font-sans'
const labelCls = 'block text-xs font-medium text-text-secondary mb-1.5'
const errorCls = 'mt-1 text-xs text-danger-600'



export default function RegisterPage() {
  const navigate  = useNavigate()

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const { mutate: signupMutation, isPending: isSignupPending } = useMutation({
    mutationFn: authService.signup,
    onSuccess: (res, data) => {
      toast.success(res.message || 'Account created! Check your email for OTP.')
      navigate(ROUTES.VERIFY_EMAIL, { state: { email: data.email } })
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Registration failed'
      if (err.response?.status === 409) {
        toast.error('This email is already registered.')
      } else {
        toast.error(msg)
      }
    }
  })

  const onSubmit = (data) => {
    signupMutation({ ...data, role: 'EMPLOYEE' })
  }

  return (
    <div>
      <div className="mb-9">
        <h1 className="text-[28px] font-bold text-text-primary tracking-[-0.025em] leading-[1.2] mb-2">
          Create your account
        </h1>
        <p className="text-sm text-text-tertiary">
          Join AssetFlow — verify your email after signup.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Full Name */}
        <FormInputField
          name="name"
          control={control}
          label="Full name"
          placeholder="Enter full name"
          errors={errors}
          icon={<User size={15} />}
        />

        {/* Email */}
        <FormInputField
          name="email"
          control={control}
          label="Work email"
          type="email"
          placeholder="Enter email"
          errors={errors}
          icon={<Mail size={15} />}
        />



        {/* Password */}
        <FormInputField
          name="password"
          control={control}
          label="Password"
          type="password"
          placeholder="Enter password"
          errors={errors}
          icon={<Lock size={15} />}
        />


        <button id="reg-submit" type="submit" disabled={isSignupPending}
          className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-btn bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/60 text-white text-sm font-semibold tracking-[-0.01em] transition-colors cursor-pointer disabled:cursor-not-allowed">
          {isSignupPending
            ? <><Loader2 size={14} className="animate-spin" /> Creating account...</>
            : <>Create Account <ArrowRight size={14} /></>}
        </button>
      </form>

      <p className="text-center text-[13px] text-text-tertiary mt-7">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-accent-500 font-semibold hover:text-accent-600">Sign in</Link>
      </p>
    </div>
  )
}
