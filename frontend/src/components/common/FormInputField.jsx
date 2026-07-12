import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Reusable FormInputField that integrates with react-hook-form.
 * 
 * @param {string} name - Field name for react-hook-form
 * @param {object} control - Control object from useForm()
 * @param {string} label - Label text
 * @param {string} type - Input type (text, password, email, etc.)
 * @param {string} placeholder - Input placeholder
 * @param {object} errors - Errors object from useFormState() or useForm()
 * @param {object} rules - Validation rules for react-hook-form
 * @param {React.ReactNode} icon - Optional icon to render inside the left of the input
 * @param {React.ReactNode} rightElement - Optional element to render on the right
 */
export default function FormInputField({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  errors,
  rules,
  icon,
  rightElement,
  size = 'h-11',
  ...rest
}) {
  const errorMessage = errors?.[name]?.message
  const [showPw, setShowPw] = useState(false)
  
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPw ? 'text' : 'password') : type

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <Label htmlFor={name} className={errorMessage ? 'text-danger-600' : 'text-text-secondary'}>
          {label}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <div className="relative">
            {icon && (
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${errorMessage ? 'text-danger-600' : 'text-text-disabled'}`}>
                {icon}
              </div>
            )}
            <Input
              id={name}
              type={inputType}
              placeholder={placeholder}
              className={`
                ${size} px-4
                bg-bg-subtle focus-within:bg-bg-canvas text-text-primary
                ${icon ? '!pl-10' : ''} 
                ${isPassword || rightElement ? '!pr-10' : ''}
                ${errorMessage 
                  ? 'border-border-danger focus-visible:ring-danger-600/15' 
                  : 'border-border-default focus-visible:border-border-accent focus-visible:ring-accent-500/10'}
              `}
              {...field}
              {...rest}
            />
            {isPassword ? (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors cursor-pointer"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            ) : rightElement ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {rightElement}
              </div>
            ) : null}
          </div>
        )}
      />
      
      {errorMessage && (
        <p className="text-xs text-danger-600 font-medium animate-fade-in">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
