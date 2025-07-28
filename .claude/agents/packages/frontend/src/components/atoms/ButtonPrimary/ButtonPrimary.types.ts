/**
 * Type definitions for ButtonPrimary component
 */

export interface ButtonPrimaryProps {
  /**
   * Button text
   */
  label: string;
  /**
   * Click handler
   */
  onClick: () => void;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * size property
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Accessible label for the component
   */
  ariaLabel?: string;
}

export type ButtonPrimaryType = 'atom';
