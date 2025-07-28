import React from 'react';
import { cn } from '@/utils/cn';
import styles from './GridLayout.module.css';

export interface GridLayoutProps {
  cols: { sm?: number; md?: number; lg?: number }; // Column configuration
  gap?: '2' | '4' | '6' | '8';
  className?: string; // Additional classes
  children?: React.ReactNode;
}

/**
 * Responsive grid layout with configurable columns
 * @component
 * @atomic-type molecule
 */
export const GridLayout: React.FC<GridLayoutProps> = ({
  cols,
  gap,
  className,
  children,
}: GridLayoutProps) => {
  return (
    <div className={cn('relative flex flex-col', styles.container)}>
      {children}
    </div>
  );
};

GridLayout.displayName = 'GridLayout';
