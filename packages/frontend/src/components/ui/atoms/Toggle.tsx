import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const toggleVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-600 data-[state=unchecked]:bg-secondary-300',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-14',
      },
      variant: {
        default: 'data-[state=checked]:bg-primary-600',
        error: 'data-[state=checked]:bg-error-600',
        success: 'data-[state=checked]:bg-success-600',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const toggleThumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4',
        md: 'h-5 w-5 data-[state=checked]:translate-x-5',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-7',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
    VariantProps<typeof toggleVariants> {
  /**
   * Whether the toggle is checked
   * @default false
   */
  checked?: boolean;
  /**
   * Callback function when the toggle state changes
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Shows error state styling
   * @default false
   */
  error?: boolean;
  /**
   * Shows success state styling
   * @default false
   */
  success?: boolean;
  /**
   * Size of the toggle switch
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Visual style variant of the toggle
   * @default 'default'
   */
  variant?: 'default' | 'error' | 'success';
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      size,
      variant,
      checked = false,
      onCheckedChange,
      error,
      success,
      disabled,
      ...props
    },
    ref
  ) => {
    const computedVariant = error ? 'error' : success ? 'success' : variant;
    const dataState = checked ? 'checked' : 'unchecked';

    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={dataState}
        className={cn(
          toggleVariants({ size, variant: computedVariant, className })
        )}
        onClick={handleClick}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        <span
          data-state={dataState}
          className={cn(toggleThumbVariants({ size }))}
        />
      </button>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle, toggleVariants };
