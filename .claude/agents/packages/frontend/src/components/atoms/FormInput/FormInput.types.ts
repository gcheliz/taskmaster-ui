/**
 * Type definitions for FormInput component
 */

export interface FormInputProps {
  /**
   * Input label
   */
  label: string;
  /**
   * Input value
   */
  value: string;
  /**
   * Change handler
   */
  onChange: (value: string) => void;
  /**
   * type property
   */
  type?: 'text' | 'email' | 'password' | 'number';
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Error message
   */
  error?: string;
  /**
   * Disable input
   */
  disabled?: boolean;
  /**
   * Required field
   */
  required?: boolean;
}

export type FormInputType = 'atom';
