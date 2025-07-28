/**
 * Type definitions for UserProfile component
 */

export interface UserProfileProps {
  /**
   * User ID to display
   */
  userId: string;
  /**
   * showActions property
   */
  showActions?: boolean;

  /**
   * Accessible label for the component
   */
  ariaLabel?: string;
}

export type UserProfileType = 'organism';
