/**
 * React Hook for Secure Form Validation
 * 
 * Provides reusable form validation with security-focused checks
 * and sanitization for TaskMaster UI components.
 */

import { useState, useCallback, useMemo } from 'react';
import type { ValidationResult } from '../utils/security';
import {
  validateRepositoryPath,
  validateProjectName,
  validateTaskId,
  validateTextInput,
  validateURL
} from '../utils/security';

export type ValidatorType = 
  | 'repositoryPath'
  | 'projectName'
  | 'taskId'
  | 'url'
  | 'text';

export interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  allowSpecialChars?: boolean;
}

export interface FieldValidation {
  value: string;
  error: string | null;
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
}

export interface UseSecureValidationOptions {
  initialValues?: Record<string, string>;
  validators: Record<string, {
    type: ValidatorType;
    options?: ValidationOptions;
  }>;
  onSubmit?: (values: Record<string, string>) => void | Promise<void>;
}

export const useSecureValidation = ({
  initialValues = {},
  validators,
  onSubmit
}: UseSecureValidationOptions) => {
  // Initialize field states
  const [fields, setFields] = useState<Record<string, FieldValidation>>(() => {
    const initialFields: Record<string, FieldValidation> = {};
    
    Object.keys(validators).forEach(fieldName => {
      initialFields[fieldName] = {
        value: initialValues[fieldName] || '',
        error: null,
        isValid: true,
        isDirty: false,
        isTouched: false
      };
    });
    
    return initialFields;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validation function for a specific field
  const validateField = useCallback((fieldName: string, value: string): ValidationResult => {
    const validator = validators[fieldName];
    if (!validator) {
      return { isValid: true, sanitizedValue: value };
    }

    const { type, options = {} } = validator;

    switch (type) {
      case 'repositoryPath':
        return validateRepositoryPath(value);
      
      case 'projectName':
        return validateProjectName(value);
      
      case 'taskId':
        return validateTaskId(value);
      
      case 'url':
        return validateURL(value);
      
      case 'text':
        return validateTextInput(value, options);
      
      default:
        return { isValid: true, sanitizedValue: value };
    }
  }, [validators]);

  // Update a field value and validate
  const updateField = useCallback((fieldName: string, value: string) => {
    const validation = validateField(fieldName, value);
    
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        error: validation.isValid ? null : validation.error || 'Invalid input',
        isValid: validation.isValid,
        isDirty: value !== (initialValues[fieldName] || ''),
        isTouched: true
      }
    }));

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  }, [validateField, initialValues, submitError]);

  // Mark field as touched (for blur events)
  const touchField = useCallback((fieldName: string) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isTouched: true
      }
    }));
  }, []);

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    let isFormValid = true;
    const newFields = { ...fields };

    Object.keys(validators).forEach(fieldName => {
      const field = fields[fieldName];
      const validation = validateField(fieldName, field.value);

      newFields[fieldName] = {
        ...field,
        error: validation.isValid ? null : validation.error || 'Invalid input',
        isValid: validation.isValid,
        isTouched: true
      };

      if (!validation.isValid) {
        isFormValid = false;
      }
    });

    setFields(newFields);
    return isFormValid;
  }, [fields, validators, validateField]);

  // Get sanitized values for all fields
  const getSanitizedValues = useCallback((): Record<string, string> => {
    const sanitizedValues: Record<string, string> = {};

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const validation = validateField(fieldName, field.value);
      sanitizedValues[fieldName] = validation.sanitizedValue || field.value;
    });

    return sanitizedValues;
  }, [fields, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const isValid = validateAllFields();
      
      if (!isValid) {
        throw new Error('Please fix validation errors before submitting');
      }

      if (onSubmit) {
        const sanitizedValues = getSanitizedValues();
        await onSubmit(sanitizedValues);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateAllFields, getSanitizedValues, onSubmit]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    const resetFields: Record<string, FieldValidation> = {};
    
    Object.keys(validators).forEach(fieldName => {
      resetFields[fieldName] = {
        value: initialValues[fieldName] || '',
        error: null,
        isValid: true,
        isDirty: false,
        isTouched: false
      };
    });

    setFields(resetFields);
    setSubmitError(null);
  }, [validators, initialValues]);

  // Reset a specific field
  const resetField = useCallback((fieldName: string) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        value: initialValues[fieldName] || '',
        error: null,
        isValid: true,
        isDirty: false,
        isTouched: false
      }
    }));
  }, [initialValues]);

  // Computed values
  const formState = useMemo(() => {
    const allValues = Object.fromEntries(
      Object.entries(fields).map(([key, field]) => [key, field.value])
    );

    const allErrors = Object.fromEntries(
      Object.entries(fields)
        .filter(([, field]) => field.error)
        .map(([key, field]) => [key, field.error])
    );

    const isFormValid = Object.values(fields).every(field => field.isValid);
    const isFormDirty = Object.values(fields).some(field => field.isDirty);
    const isFormTouched = Object.values(fields).some(field => field.isTouched);

    return {
      values: allValues,
      errors: allErrors,
      isValid: isFormValid,
      isDirty: isFormDirty,
      isTouched: isFormTouched,
      isSubmitting,
      submitError
    };
  }, [fields, isSubmitting, submitError]);

  // Field helpers for easy binding to form inputs
  const getFieldProps = useCallback((fieldName: string) => {
    const field = fields[fieldName];
    
    return {
      value: field?.value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        updateField(fieldName, e.target.value);
      },
      onBlur: () => touchField(fieldName),
      'aria-invalid': field?.error ? 'true' : 'false',
      'aria-describedby': field?.error ? `${fieldName}-error` : undefined
    };
  }, [fields, updateField, touchField]);

  return {
    fields,
    formState,
    updateField,
    touchField,
    validateField: (fieldName: string) => validateField(fieldName, fields[fieldName]?.value || ''),
    validateAllFields,
    getSanitizedValues,
    handleSubmit,
    resetForm,
    resetField,
    getFieldProps
  };
};

export default useSecureValidation;