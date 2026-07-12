import React from 'react'
import { Controller } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

/**
 * Reusable FormTextarea that integrates with react-hook-form.
 * 
 * @param {string} name - Field name for react-hook-form
 * @param {object} control - Control object from useForm()
 * @param {string} label - Label text
 * @param {string} placeholder - Placeholder text
 * @param {object} errors - Errors object from useFormState() or useForm()
 * @param {object} rules - Validation rules for react-hook-form
 * @param {number} rows - Number of rows for the textarea
 */
export default function FormTextarea({
  name,
  control,
  label,
  placeholder,
  errors,
  rules,
  rows = 3,
  ...rest
}) {
  const errorMessage = errors?.[name]?.message

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
          <Textarea
            id={name}
            placeholder={placeholder}
            rows={rows}
            className={`
              w-full px-4 py-3
              bg-bg-subtle focus-within:bg-bg-canvas text-text-primary resize-y
              ${errorMessage 
                ? 'border-border-danger focus-visible:ring-danger-600/15' 
                : 'border-border-default focus-visible:border-border-accent focus-visible:ring-accent-500/10'}
            `}
            {...field}
            {...rest}
          />
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
