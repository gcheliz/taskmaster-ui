/**
 * Type definitions for Card component
 */

export interface CardProps {
  /**
   * Card title
   */
  title: string;
  /**
   * Optional subtitle
   */
  subtitle?: string;
  /**
   * elevation property
   */
  elevation?: number;
  /**
   * Make card clickable
   */
  onClick?: () => void;
  /**
   * Child elements to render
   */
  children?: React.ReactNode;
  /**
   * Accessible label for the component
   */
  ariaLabel?: string;
}

export type CardType = 'molecule';
