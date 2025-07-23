import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'
import { ChevronDownIcon } from './Icon'

const breadcrumbVariants = cva('flex items-center space-x-2 text-sm', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const breadcrumbLinkVariants = cva(
  'inline-flex items-center font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-100 dark:focus-visible:ring-offset-surface-900 disabled:pointer-events-none disabled:opacity-50 transform-gpu',
  {
    variants: {
      variant: {
        default:
          'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100',
        primary:
          'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300',
        current: 'text-secondary-900 dark:text-secondary-100 cursor-default',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

const breadcrumbSeparatorVariants = cva(
  'text-secondary-400 dark:text-secondary-500 flex-shrink-0 transition-colors duration-200',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface BreadcrumbProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof breadcrumbVariants> {
  /**
   * Custom separator between breadcrumb items
   * @default '/'
   */
  separator?: React.ReactNode
  /**
   * Maximum number of items to show before collapsing
   */
  maxItems?: number
  /**
   * Whether to show the collapse button on mobile
   * @default true
   */
  responsive?: boolean
}

export interface BreadcrumbLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof breadcrumbLinkVariants> {
  /**
   * Whether this is the current/active breadcrumb item
   * @default false
   */
  isCurrent?: boolean
  /**
   * Whether the link is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Icon to display before the link text
   */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  /**
   * Custom component to render as (e.g., Link from react-router)
   */
  as?: React.ElementType
}

export interface BreadcrumbSeparatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof breadcrumbSeparatorVariants> {
  /**
   * Custom separator content
   */
  children?: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, size, separator = '/', maxItems, responsive = true, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children)
    const shouldCollapse = maxItems && childrenArray.length > maxItems
    const [isExpanded, setIsExpanded] = React.useState(false)

    const renderItems = () => {
      if (!shouldCollapse || isExpanded) {
        return childrenArray
      }

      const firstItem = childrenArray[0]
      const lastItems = childrenArray.slice(-(maxItems - 1))
      const hiddenCount = childrenArray.length - maxItems

      return [
        firstItem,
        <BreadcrumbSeparator key="separator-before-collapse" size={size}>
          {separator}
        </BreadcrumbSeparator>,
        <button
          key="collapse-button"
          onClick={() => setIsExpanded(true)}
          className={cn(
            breadcrumbLinkVariants({ size }),
            'rounded-md px-2 py-1 hover:bg-secondary-100 dark:hover:bg-surface-800 focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
          aria-label={`Show ${hiddenCount} more items`}
        >
          <ChevronDownIcon className="h-4 w-4 rotate-90" />
          <span className="ml-1">+{hiddenCount}</span>
        </button>,
        <BreadcrumbSeparator key="separator-after-collapse" size={size}>
          {separator}
        </BreadcrumbSeparator>,
        ...lastItems,
      ]
    }

    return (
      <nav
        ref={ref}
        className={cn(breadcrumbVariants({ size, className }))}
        aria-label="Breadcrumb"
        {...props}
      >
        <ol className="flex flex-wrap items-center space-x-2 sm:space-x-3">
          {React.Children.map(renderItems(), (child, index) => (
            <li key={index} className="flex items-center">
              {child}
            </li>
          ))}
        </ol>
      </nav>
    )
  }
)

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  (
    {
      className,
      variant,
      size,
      isCurrent = false,
      disabled = false,
      icon: Icon,
      as: Component = 'a',
      children,
      ...props
    },
    ref
  ) => {
    const effectiveVariant = isCurrent ? 'current' : variant

    return (
      <Component
        ref={ref}
        className={cn(
          breadcrumbLinkVariants({
            variant: effectiveVariant,
            size,
            className,
          }),
          disabled && 'pointer-events-none opacity-50',
          isCurrent && 'font-semibold'
        )}
        aria-current={isCurrent ? 'page' : undefined}
        aria-disabled={disabled}
        {...props}
      >
        {Icon && (
          <Icon
            className={cn(
              'flex-shrink-0',
              children ? 'mr-1.5' : '',
              size === 'sm' && 'h-3 w-3',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-5 w-5'
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </Component>
    )
  }
)

const BreadcrumbSeparator = React.forwardRef<HTMLSpanElement, BreadcrumbSeparatorProps>(
  ({ className, size, children = '/', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(breadcrumbSeparatorVariants({ size, className }))}
      aria-hidden="true"
      {...props}
    >
      {children}
    </span>
  )
)

Breadcrumb.displayName = 'Breadcrumb'
BreadcrumbLink.displayName = 'BreadcrumbLink'
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

export {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbSeparator,
  breadcrumbVariants,
  breadcrumbLinkVariants,
  breadcrumbSeparatorVariants,
}
