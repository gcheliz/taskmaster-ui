import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
// import { Button } from '../atoms/Button';
import { Icon, ChevronDownIcon } from '../atoms/Icon';

const paginationVariants = cva(
  'mx-auto flex w-full justify-center',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const paginationContentVariants = cva(
  'flex flex-row items-center gap-1',
  {
    variants: {
      size: {
        sm: 'gap-1',
        md: 'gap-2',
        lg: 'gap-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const paginationItemVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-secondary-100 hover:text-secondary-900',
        outline: 'border border-secondary-300 bg-transparent hover:bg-secondary-50',
      },
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-9 w-9 text-sm',
        lg: 'h-10 w-10 text-base',
      },
      isActive: {
        true: 'bg-primary-600 text-white hover:bg-primary-700',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      isActive: false,
    },
  }
);

export interface PaginationProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof paginationVariants> {}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, size, ...props }, ref) => (
    <nav
      ref={ref}
      role="navigation"
      aria-label="pagination"
      className={cn(paginationVariants({ size, className }))}
      {...props}
    />
  )
);
Pagination.displayName = 'Pagination';

export interface PaginationContentProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof paginationContentVariants> {}

const PaginationContent = React.forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ className, size, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(paginationContentVariants({ size, className }))}
      {...props}
    />
  )
);
PaginationContent.displayName = 'PaginationContent';

export type PaginationItemProps = React.HTMLAttributes<HTMLLIElement>;

const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
  )
);
PaginationItem.displayName = 'PaginationItem';

export interface PaginationLinkProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof paginationItemVariants> {
  isActive?: boolean;
}

const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, variant, size, isActive, ...props }, ref) => (
    <button
      ref={ref}
      aria-current={isActive ? 'page' : undefined}
      className={cn(paginationItemVariants({ variant, size, isActive, className }))}
      {...props}
    />
  )
);
PaginationLink.displayName = 'PaginationLink';

export interface PaginationPreviousProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof paginationItemVariants> {}

const PaginationPrevious = React.forwardRef<HTMLButtonElement, PaginationPreviousProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      aria-label="Go to previous page"
      className={cn(
        paginationItemVariants({ variant, size }),
        'gap-1 pl-2.5',
        className
      )}
      {...props}
    >
      <Icon icon={ChevronDownIcon} size="sm" className="rotate-90" />
      <span>Previous</span>
    </button>
  )
);
PaginationPrevious.displayName = 'PaginationPrevious';

export interface PaginationNextProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof paginationItemVariants> {}

const PaginationNext = React.forwardRef<HTMLButtonElement, PaginationNextProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      aria-label="Go to next page"
      className={cn(
        paginationItemVariants({ variant, size }),
        'gap-1 pr-2.5',
        className
      )}
      {...props}
    >
      <span>Next</span>
      <Icon icon={ChevronDownIcon} size="sm" className="-rotate-90" />
    </button>
  )
);
PaginationNext.displayName = 'PaginationNext';

export type PaginationEllipsisProps = React.HTMLAttributes<HTMLSpanElement>;

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <span>...</span>
      <span className="sr-only">More pages</span>
    </span>
  )
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

// Helper component for complete pagination
export interface CompletePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPreviousNext?: boolean;
  maxVisiblePages?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
}

const CompletePagination = React.forwardRef<HTMLElement, CompletePaginationProps>(
  ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    showPreviousNext = true,
    maxVisiblePages = 5,
    size = 'md',
    variant = 'default',
    ...props 
  }, ref) => {
    const getVisiblePages = () => {
      const delta = Math.floor(maxVisiblePages / 2);
      const range: (number | 'ellipsis')[] = [];
      const rangeWithDots: (number | 'ellipsis')[] = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, 'ellipsis');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('ellipsis', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    const visiblePages = totalPages <= maxVisiblePages ? 
      Array.from({ length: totalPages }, (_, i) => i + 1) : 
      getVisiblePages();

    return (
      <Pagination ref={ref} size={size} {...props}>
        <PaginationContent size={size}>
          {showPreviousNext && (
            <PaginationItem>
              <PaginationPrevious
                size={size}
                variant={variant}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              />
            </PaginationItem>
          )}

          {visiblePages.map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  size={size}
                  variant={variant}
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {showPreviousNext && (
            <PaginationItem>
              <PaginationNext
                size={size}
                variant={variant}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  }
);
CompletePagination.displayName = 'CompletePagination';

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  CompletePagination,
  paginationVariants,
  paginationContentVariants,
  paginationItemVariants,
};