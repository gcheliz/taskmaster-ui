/**
 * Type definitions for ActionButton component
 */

export interface ActionButtonProps {
  /**
   * Button text
   */
  label: string;
  /**
   * Click handler
   */
  onClick: () => void;
  /**
   * variant property
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  /**
   * size property
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Show loading spinner
   */
  loading?: boolean;
  /**
   * Disable button
   */
  disabled?: boolean;
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * Icon to display
   */
  icon?: React.ReactNode;

  /**
   * Accessible label for the component
   */
  ariaLabel?: string;
}

export type ActionButtonType = 'atom';
