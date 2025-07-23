import React, { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="flex items-center">
        <input
          id={radioId}
          ref={ref}
          type="radio"
          className={cn(
            'h-4 w-4 border-secondary-300 bg-white text-primary-500',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            className={cn(
              'ml-2 text-sm text-secondary-700',
              'cursor-pointer select-none',
              props.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'

export interface RadioGroupProps {
  name: string
  value?: string
  onChange?: (value: string) => void
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
  error?: string
  label?: string
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ name, value, onChange, options, error, label, orientation = 'vertical', className }, ref) => {
    const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${groupId}-error`

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {label && <div className="text-sm font-medium text-secondary-700">{label}</div>}
        <div
          className={cn('space-y-2', orientation === 'horizontal' && 'flex space-x-4 space-y-0')}
          role="radiogroup"
          aria-labelledby={label ? groupId : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        >
          {options.map((option) => (
            <Radio
              key={option.value}
              name={name}
              value={option.value}
              label={option.label}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={option.disabled}
            />
          ))}
        </div>
        {error && (
          <p id={errorId} className="text-xs text-error-500" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'

export { Radio, RadioGroup }
