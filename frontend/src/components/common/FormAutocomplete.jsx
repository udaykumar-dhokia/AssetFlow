import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

/**
 * Reusable FormAutocomplete that integrates with react-hook-form.
 * Uses the shadcn Combobox pattern (Popover + Command).
 * 
 * @param {string} name - Field name for react-hook-form
 * @param {object} control - Control object from useForm()
 * @param {string} label - Label text
 * @param {Array} options - Array of objects with { label, value }
 * @param {string} placeholder - Placeholder text
 * @param {object} errors - Errors object from useFormState() or useForm()
 * @param {object} rules - Validation rules for react-hook-form
 */
export default function FormAutocomplete({
  name,
  control,
  label,
  options = [],
  placeholder = "Select an option...",
  errors,
  rules,
  size = 'h-11',
  ...rest
}) {
  const errorMessage = errors?.[name]?.message
  const [open, setOpen] = useState(false)

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
        render={({ field }) => {
          const selectedOption = options.find(opt => opt.value === field.value)
          
          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                id={name}
                className={`
                  ${size} w-full px-4 flex items-center justify-between text-left rounded-lg
                  bg-bg-subtle hover:bg-bg-canvas data-[state=open]:bg-bg-canvas text-text-primary
                  transition-colors outline-hidden
                  ${errorMessage 
                    ? 'border border-border-danger focus-visible:ring-1 focus-visible:ring-danger-600/15' 
                    : 'border border-border-default focus-visible:border-border-accent focus-visible:ring-1 focus-visible:ring-accent-500/10'}
                `}
                {...rest}
              >
                <span className={!selectedOption ? "text-text-disabled" : ""}>
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDownIcon className="size-4 opacity-50 shrink-0" />
              </PopoverTrigger>
              <PopoverContent className="w-[--var(--popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label} // CommandItem matches against value, standard shadcn uses label or value depending on config. It's safer to use label for searchability if we don't have a custom filter.
                          onSelect={() => {
                            field.onChange(option.value)
                            setOpen(false)
                          }}
                        >
                          {option.label}
                          <CheckIcon
                            className={`ml-auto size-4 ${
                              field.value === option.value ? "opacity-100" : "opacity-0"
                            }`}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )
        }}
      />
      
      {errorMessage && (
        <p className="text-xs text-danger-600 font-medium animate-fade-in">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
