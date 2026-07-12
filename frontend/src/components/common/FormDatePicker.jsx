import React from 'react'
import { Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'

export default function FormDatePicker({
  name,
  control,
  label,
  placeholder = "Pick a date",
  errors,
  rules,
  size = 'h-12',
  ...rest
}) {
  const errorMessage = errors?.[name]?.message

  return (
    <div className="space-y-1.5 w-full flex flex-col">
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`
                  ${size} w-full px-4 justify-start text-left font-normal
                  bg-bg-subtle hover:bg-bg-canvas
                  ${!field.value ? "text-slate-500 dark:text-slate-400" : "text-text-primary"}
                  ${errorMessage 
                    ? 'border-border-danger focus-visible:ring-danger-600/15' 
                    : 'border-border-default focus-visible:border-border-accent focus-visible:ring-accent-500/10'}
                `}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? format(new Date(field.value), "PPP") : <span>{placeholder}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  // Pass the ISO string back to the form
                  field.onChange(date ? date.toISOString() : undefined)
                }}
                initialFocus
                {...rest}
              />
            </PopoverContent>
          </Popover>
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
