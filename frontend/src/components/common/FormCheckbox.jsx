import React from 'react'
import { Controller } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

/**
 * Reusable FormCheckbox that integrates with react-hook-form.
 * 
 * @param {string} name - Field name for react-hook-form
 * @param {object} control - Control object from useForm()
 * @param {string} label - Label text
 * @param {string} description - Optional description below the label
 * @param {object} errors - Errors object from useFormState() or useForm()
 * @param {object} rules - Validation rules for react-hook-form
 */
export default function FormCheckbox({
  name,
  control,
  label,
  description,
  errors,
  rules,
  ...rest
}) {
  const errorMessage = errors?.[name]?.message

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex items-start space-x-3">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              className={`mt-0.5 ${errorMessage ? 'border-danger-600 text-danger-600' : ''}`}
              {...rest}
            />
            <div className="grid leading-none gap-1.5 pt-0.5">
              {label && (
                <Label 
                  htmlFor={name} 
                  className={`font-medium cursor-pointer ${errorMessage ? 'text-danger-600' : 'text-text-primary'}`}
                >
                  {label}
                </Label>
              )}
              {description && (
                <p className="text-sm text-text-secondary leading-snug">
                  {description}
                </p>
              )}
            </div>
          </div>
          {errorMessage && (
            <p className="text-xs text-danger-600 font-medium animate-fade-in pl-7">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    />
  )
}
