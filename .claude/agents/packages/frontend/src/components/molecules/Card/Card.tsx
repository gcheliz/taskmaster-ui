import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  title: string; // Card title
  subtitle?: string; // Optional subtitle
  elevation?: number;
  onClick?: () => void; // Make card clickable
  children?: React.ReactNode;
}

/**
 * Flexible card component for content display
 * @component
 * @atomic-type molecule
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  elevation,
  onClick,
  children,
}: CardProps) => {
  return (
    <div className={styles.container} role="article" aria-label={ariaLabel}>
      {children}
    </div>
  );
};

Card.displayName = 'Card';
