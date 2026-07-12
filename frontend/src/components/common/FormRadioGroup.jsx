import React from 'react'
import { Controller } from 'react-hook-form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

/**
 * Reusable FormRadioGroup that integrates with react-hook-form.
 * 
 * @param {string} name - Field name for react-hook-form
 * @param {object} control - Control object from useForm()
 * @param {string} label - Group label text
 * @param {Array} options - Array of objects with { label, value }
 * @param {object} errors - Errors object from useFormState() or useForm()
 * @param {object} rules - Validation rules for react-hook-form
 * @param {string} orientation - 'vertical' or 'horizontal'
 */
export default function FormRadioGroup({
  name,
  control,
  label,
  options = [],
  errors,
  rules,
  className,
  orientation = 'vertical',
  ...rest
}) {
  const errorMessage = errors?.[name]?.message

  return (
    <div className={`space-y-3 w-full ${className || ''}`}>
      {label && (
        <Label className={errorMessage ? 'text-danger-600' : 'text-text-secondary'}>
          {label}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className={`flex ${orientation === 'vertical' ? 'flex-col space-y-2' : 'flex-row flex-wrap gap-4'}`}
            {...rest}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.value} 
                  id={`${name}-${option.value}`} 
                  className={errorMessage ? 'border-danger-600 text-danger-600' : ''}
                />
                <Label 
                  htmlFor={`${name}-${option.value}`} 
                  className={`font-normal cursor-pointer ${errorMessage ? 'text-danger-600' : 'text-text-primary'}`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
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
