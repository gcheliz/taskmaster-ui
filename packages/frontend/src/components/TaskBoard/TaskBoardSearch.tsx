/**
 * TaskBoard Search Component
 * Real-time search functionality for task filtering
 */

import React from 'react';
import { Icon } from '../ui/atoms/Icon';
import { cn } from '../../utils/cn';

interface TaskBoardSearchProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS class name */
  className?: string;
  /** Whether the search is loading */
  isLoading?: boolean;
}

export const TaskBoardSearch: React.FC<TaskBoardSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search tasks...',
  className,
  isLoading = false,
}) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={cn('relative w-full max-w-md', className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon
            icon={SearchIcon}
            size="sm"
            className={cn(
              'text-slate-400 transition-colors',
              isLoading && 'animate-pulse'
            )}
          />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-slate-800 text-slate-300 border border-slate-700',
            'rounded-lg pl-10 pr-10 py-2 text-sm',
            'placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent',
            'hover:border-slate-600 transition-colors'
          )}
        />
        
        {value && (
          <button
            onClick={handleClear}
            className={cn(
              'absolute inset-y-0 right-0 pr-3 flex items-center',
              'text-slate-400 hover:text-slate-300 transition-colors'
            )}
            aria-label="Clear search"
          >
            <Icon icon={XMarkIcon} size="sm" />
          </button>
        )}
      </div>
      
      {isLoading && (
        <div className="absolute top-full left-0 mt-1 text-xs text-slate-500">
          Searching...
        </div>
      )}
    </div>
  );
};

// Search icon SVG
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

// X Mark icon SVG
const XMarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);

export default TaskBoardSearch;