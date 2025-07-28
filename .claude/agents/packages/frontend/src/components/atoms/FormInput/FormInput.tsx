import React from 'react';
import { cn } from '@/utils/cn';
import styles from './FormInput.module.css';

export interface FormInputProps {
  label: string; // Input label
  value: string; // Input value
  onChange: (value: string) => void; // Change handler
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string; // Placeholder text
  error?: string; // Error message
  disabled?: boolean; // Disable input
  required?: boolean; // Required field
}

/**
 * Form input with validation and error states
 * @component
 * @atomic-type atom
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChange,
  type,
  placeholder,
  error,
  disabled,
  required,
}: FormInputProps) => {
  return (
    <div
      className={cn(
        'block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed px-4 py-2 text-base',
        styles.container
      )}
    >
      <span>FormInput Component</span>
    </div>
  );
};

FormInput.displayName = 'FormInput';
