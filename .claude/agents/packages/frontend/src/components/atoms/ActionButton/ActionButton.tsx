import React from 'react';
import { cn } from '@/utils/cn';
import styles from './ActionButton.module.css';

export interface ActionButtonProps {
  label: string; // Button text
  onClick: () => void; // Click handler
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean; // Show loading spinner
  disabled?: boolean; // Disable button
  fullWidth?: boolean; // Full width button
  icon?: React.ReactNode; // Icon to display
  ariaLabel?: string; // Accessible label
}

/**
 * Versatile action button with multiple variants and sizes
 * @component
 * @atomic-type atom
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  variant,
  size,
  loading,
  disabled,
  fullWidth,
  icon,
  ariaLabel,
}: ActionButtonProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 px-4 py-2 text-base rounded-full',
        styles.container
      )}
      aria-label={ariaLabel}
    >
      <span>ActionButton Component</span>
    </div>
  );
};

ActionButton.displayName = 'ActionButton';
