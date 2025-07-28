/**
 * Type definitions for SearchBar component
 */

export interface SearchBarProps {
  /**
   * "value property
   */
  "value: string;
  /**
   * onChange property
   */
  onChange: ()=>void;
  /**
   * placeholder property
   */
  placeholder?: string";
  /**
   * Child elements to render
   */
  children?: React.ReactNode;
  /**
   * Accessible label for the component
   */
  ariaLabel?: string;
  /**
   * ID of element that describes this component
   */
  ariaDescribedBy?: string;
}

export type SearchBarType = 'molecule';
