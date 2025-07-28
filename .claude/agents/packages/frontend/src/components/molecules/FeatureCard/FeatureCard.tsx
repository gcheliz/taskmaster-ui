import React from 'react';
import { cn } from '@/utils/cn';
import styles from './FeatureCard.module.css';

export interface FeatureCardProps {
  title: string; // Feature title
  description: string; // Feature description
  icon?: React.ReactNode; // Feature icon
  href?: string; // Link URL
  highlighted?: boolean; // Highlight card
  ariaLabel?: string; // Accessible label
  children?: React.ReactNode;
}

/**
 * Feature showcase card with icon and hover effects
 * @component
 * @atomic-type molecule
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  href,
  highlighted,
  ariaLabel,
  children,
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow',
        styles.container
      )}
      role="article"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};

FeatureCard.displayName = 'FeatureCard';
