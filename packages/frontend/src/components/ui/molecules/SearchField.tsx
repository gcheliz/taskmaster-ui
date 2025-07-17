import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Icon, EyeIcon, XMarkIcon } from '../atoms/Icon';

const searchFieldVariants = cva(
  'relative flex w-full',
  {
    variants: {
      variant: {
        default: '',
        compact: 'max-w-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SearchFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof searchFieldVariants> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
  showSearchButton?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ 
    className, 
    variant, 
    onSearch, 
    onClear, 
    showClearButton = true, 
    showSearchButton = false,
    inputSize = 'md',
    isLoading = false,
    value: controlledValue,
    onChange,
    placeholder = 'Search...',
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState('');
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(e);
    };

    const handleSearch = () => {
      onSearch?.(String(value));
    };

    const handleClear = () => {
      if (controlledValue === undefined) {
        setInternalValue('');
      }
      onClear?.();
      
      // Create a synthetic event for controlled components
      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
      props.onKeyDown?.(e);
    };

    const searchIcon = <Icon icon={EyeIcon} size="sm" />;
    const clearButton = value && showClearButton ? (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 p-0 hover:bg-transparent"
        onClick={handleClear}
        tabIndex={-1}
        aria-label="Clear search"
      >
        <Icon icon={XMarkIcon} size="sm" />
      </Button>
    ) : null;

    return (
      <div className={cn(searchFieldVariants({ variant, className }))}>
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          inputSize={inputSize}
          leftIcon={searchIcon}
          rightIcon={clearButton}
          className={showSearchButton ? 'rounded-r-none' : ''}
          {...props}
        />
        {showSearchButton && (
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="rounded-l-none border-l-0"
            size={inputSize}
            loading={isLoading}
          >
            Search
          </Button>
        )}
      </div>
    );
  }
);

SearchField.displayName = 'SearchField';

export { SearchField, searchFieldVariants };