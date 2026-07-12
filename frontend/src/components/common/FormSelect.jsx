import React from 'react'
import { Controller } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

/**
 * Reusable FormSelect that integrates with react-hook-form.
 * 
 * @param {string} name - Field name for react-hook-form
 * @param {object} control - Control object from useForm()
 * @param {string} label - Label text
 * @param {Array} options - Array of objects with { label, value }
 * @param {string} placeholder - Placeholder text
 * @param {object} errors - Errors object from useFormState() or useForm()
 * @param {object} rules - Validation rules for react-hook-form
 */
export default function FormSelect({
  name,
  control,
  label,
  options = [],
  placeholder = "Select an option",
  errors,
  rules,
  size = 'h-12',
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
          <Select 
            onValueChange={field.onChange} 
            value={field.value || ""} 
            disabled={rest.disabled}
          >
            <SelectTrigger
              id={name}
              className={`
                ${size} px-4 w-full
                bg-bg-subtle focus:bg-bg-canvas text-text-primary
                ${errorMessage 
                  ? 'border-border-danger focus:ring-danger-600/15' 
                  : 'border-border-default focus:border-border-accent focus:ring-accent-500/10'}
              `}
              {...rest}
            >
              <SelectValue placeholder={placeholder}>
                {field.value ? options.find(o => String(o.value) === String(field.value))?.label || field.value : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} label={option.label} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
