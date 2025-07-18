import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const cardVariants = cva(
  'rounded-lg border bg-white text-secondary-950 shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-secondary-200',
        outline: 'border-secondary-300',
        elevated: 'border-secondary-200 shadow-md',
        ghost: 'border-transparent shadow-none',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer transition-colors hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
    },
  }
);

const cardHeaderVariants = cva('flex flex-col space-y-1.5', {
  variants: {
    alignment: {
      left: 'items-start text-left',
      center: 'items-center text-center',
      right: 'items-end text-right',
    },
  },
  defaultVariants: {
    alignment: 'left',
  },
});

const cardContentVariants = cva('pt-0');

const cardFooterVariants = cva('flex items-center pt-6', {
  variants: {
    alignment: {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    },
  },
  defaultVariants: {
    alignment: 'left',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Visual style variant of the card
   * @default 'default'
   */
  variant?: 'default' | 'outline' | 'elevated' | 'ghost';
  /**
   * Size/padding of the card
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the card is interactive (clickable)
   * @default false
   */
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, onClick, ...props }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (
        interactive &&
        onClick &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault();
        onClick(event as any);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, interactive, className }))}
        role={interactive ? 'button' : 'region'}
        tabIndex={interactive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, alignment, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ alignment, className }))}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-headline-medium font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-body-medium text-secondary-600', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ className }))}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, alignment, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ alignment, className }))}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
  cardHeaderVariants,
  cardContentVariants,
  cardFooterVariants,
};
