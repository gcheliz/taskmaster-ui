import { useState, useCallback, useEffect } from 'react'

export interface UseFormFieldOptions<T> {
  initialValue: T
  validate?: (value: T) => string | undefined
  transform?: (value: T) => T
  debounceMs?: number
}

export interface UseFormFieldReturn<T> {
  value: T
  error: string | undefined
  touched: boolean
  setValue: (value: T) => void
  setError: (error: string | undefined) => void
  setTouched: (touched: boolean) => void
  reset: () => void
  validate: () => boolean
}

/**
 * Hook for managing individual form field state
 * Handles value, validation, error state, and touched state
 */
export function useFormField<T>({
  initialValue,
  validate,
  transform,
  debounceMs = 0,
}: UseFormFieldOptions<T>): UseFormFieldReturn<T> {
  const [value, setValue] = useState<T>(initialValue)
  const [error, setError] = useState<string | undefined>()
  const [touched, setTouched] = useState(false)
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  // Debounce value changes
  useEffect(() => {
    if (debounceMs > 0) {
      const timer = setTimeout(() => {
        setDebouncedValue(value)
      }, debounceMs)
      return () => clearTimeout(timer)
    } else {
      setDebouncedValue(value)
    }
  }, [value, debounceMs])

  // Run validation when debounced value changes
  useEffect(() => {
    if (touched && validate) {
      const validationError = validate(debouncedValue)
      setError(validationError)
    }
  }, [debouncedValue, touched, validate])

  const handleSetValue = useCallback(
    (newValue: T) => {
      const transformedValue = transform ? transform(newValue) : newValue
      setValue(transformedValue)
      if (!touched) {
        setTouched(true)
      }
    },
    [transform, touched]
  )

  const handleValidate = useCallback((): boolean => {
    if (validate) {
      const validationError = validate(value)
      setError(validationError)
      setTouched(true)
      return !validationError
    }
    return true
  }, [validate, value])

  const reset = useCallback(() => {
    setValue(initialValue)
    setError(undefined)
    setTouched(false)
  }, [initialValue])

  return {
    value,
    error,
    touched,
    setValue: handleSetValue,
    setError,
    setTouched,
    reset,
    validate: handleValidate,
  }
}