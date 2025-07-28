/**
 * Type definitions for FeatureCard component
 */

export interface FeatureCardProps {
  /**
   * Feature title
   */
  title: string;
  /**
   * Feature description
   */
  description: string;
  /**
   * Feature icon
   */
  icon?: React.ReactNode;
  /**
   * Link URL
   */
  href?: string;
  /**
   * Highlight card
   */
  highlighted?: boolean;
  /**
   * Child elements to render
   */
  children?: React.ReactNode;
  /**
   * Accessible label for the component
   */
  ariaLabel?: string;
}

export type FeatureCardType = 'molecule';
