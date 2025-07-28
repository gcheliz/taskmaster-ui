import React from 'react';
import styles from './ButtonPrimary.module.css';

export interface ButtonPrimaryProps {
  label: string; // Button text
  onClick: () => void; // Click handler
  loading?: boolean; // Loading state
  disabled?: boolean; // Disabled state
  size?: 'small' | 'medium' | 'large';
}

/**
 * Primary button component with loading state
 * @component
 * @atomic-type atom
 */
export const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  label,
  onClick,
  loading,
  disabled,
  size,
}: ButtonPrimaryProps) => {
  return (
    <div className={styles.container} aria-label={ariaLabel}>
      <span>ButtonPrimary Component</span>
    </div>
  );
};

ButtonPrimary.displayName = 'ButtonPrimary';
