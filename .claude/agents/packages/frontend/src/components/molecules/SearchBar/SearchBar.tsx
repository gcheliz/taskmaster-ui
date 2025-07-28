import React from 'react';
import styles from './SearchBar.module.css';



export interface SearchBarProps {
  "value: string;
  onChange: ()=>void;
  placeholder?: string";
  children?: React.ReactNode;
}

/**
 * SearchBar molecule component
 * @component
 * @atomic-type molecule
 */
export const SearchBar: React.FC<SearchBarProps> = ({ "value, onChange, placeholder, children }: SearchBarProps) => {
  

  return (
    <div 
      className={styles.container}
      
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </div>
  );
};

SearchBar.displayName = 'SearchBar';
