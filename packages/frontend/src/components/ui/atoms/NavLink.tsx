import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const navLinkVariants = cva(
  'inline-flex items-center justify-center text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-100 dark:focus-visible:ring-offset-surface-900 disabled:pointer-events-none disabled:opacity-50 transform-gpu',
  {
    variants: {
      variant: {
        default:
          'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:bg-surface-800/50',
        primary:
          'text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20',
        ghost:
          'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:text-secondary-100 dark:hover:bg-surface-800',
        underline:
          'text-secondary-700 hover:text-secondary-900 border-b-2 border-transparent hover:border-secondary-300 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:border-secondary-600',
        active:
          'text-primary-600 bg-primary-50 border-primary-500 dark:text-primary-400 dark:bg-primary-900/20 dark:border-primary-500',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
        xl: 'px-6 py-4 text-lg',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    compoundVariants: [
      {
        variant: 'underline',
        class: 'rounded-none',
      },
      {
        variant: 'active',
        class: 'border-l-2 pl-3',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'md',
    },
  }
);

export interface NavLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof navLinkVariants> {
  /**
   * Whether the link is currently active
   * @default false
   */
  isActive?: boolean;
  /**
   * Whether the link is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * External link behavior - opens in new tab
   * @default false
   */
  external?: boolean;
  /**
   * Icon to display before the link text
   */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /**
   * Icon to display after the link text
   */
  endIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /**
   * Custom component to render as (e.g., Link from react-router)
   */
  as?: React.ElementType;
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      isActive = false,
      disabled = false,
      external = false,
      icon: Icon,
      endIcon: EndIcon,
      as: Component = 'a',
      children,
      ...props
    },
    ref
  ) => {
    const effectiveVariant = isActive ? 'active' : variant;
    const externalProps = external
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {};

    return (
      <Component
        ref={ref}
        className={cn(
          navLinkVariants({
            variant: effectiveVariant,
            size,
            rounded,
            className,
          }),
          disabled && 'pointer-events-none opacity-50',
          isActive && 'font-semibold',
          'hover:scale-[1.02] active:scale-[0.98]'
        )}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={disabled}
        {...externalProps}
        {...props}
      >
        {Icon && (
          <Icon
            className={cn(
              'flex-shrink-0',
              children ? 'mr-2' : '',
              size === 'sm' && 'h-3 w-3',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-5 w-5',
              size === 'xl' && 'h-6 w-6'
            )}
            aria-hidden="true"
          />
        )}
        {children}
        {EndIcon && (
          <EndIcon
            className={cn(
              'flex-shrink-0',
              children ? 'ml-2' : '',
              size === 'sm' && 'h-3 w-3',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-5 w-5',
              size === 'xl' && 'h-6 w-6'
            )}
            aria-hidden="true"
          />
        )}
      </Component>
    );
  }
);

NavLink.displayName = 'NavLink';

export { NavLink, navLinkVariants };
