/**
 * Type definitions for GridLayout component
 */

export interface GridLayoutProps {
  /**
   * Column configuration
   */
  cols: { sm?: number; md?: number; lg?: number };
  /**
   * gap property
   */
  gap?: '2' | '4' | '6' | '8';
  /**
   * Additional classes
   */
  className?: string;
  /**
   * Child elements to render
   */
  children?: React.ReactNode;
}

export type GridLayoutType = 'molecule';
