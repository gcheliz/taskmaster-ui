import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { Button } from '../atoms/Button';
import { Icon, ChevronDownIcon, CheckIcon } from '../atoms/Icon';

const dropdownContentVariants = cva(
  'z-50 min-w-[8rem] overflow-hidden rounded-md border border-secondary-200 bg-white p-1 text-secondary-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      size: {
        sm: 'min-w-[6rem] text-xs',
        md: 'min-w-[8rem] text-sm',
        lg: 'min-w-[12rem] text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const dropdownItemVariants = cva(
  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-secondary-100 focus:text-secondary-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-secondary-100',
        destructive: 'hover:bg-error-100 hover:text-error-900 focus:bg-error-100 focus:text-error-900',
      },
      size: {
        sm: 'px-1.5 py-1 text-xs',
        md: 'px-2 py-1.5 text-sm',
        lg: 'px-3 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const dropdownTriggerVariants = cva(
  'flex items-center justify-between gap-2 [&[data-state=open]>svg]:rotate-180',
  {
    variants: {
      variant: {
        default: '',
        outline: '',
        ghost: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface DropdownProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DropdownTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof dropdownTriggerVariants> {
  asChild?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
}

export interface DropdownContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownContentVariants> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}

export interface DropdownItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownItemVariants> {
  disabled?: boolean;
  onSelect?: (event: React.SyntheticEvent) => void;
}

export type DropdownLabelProps = React.HTMLAttributes<HTMLDivElement>;

export type DropdownSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export interface DropdownCheckboxItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownItemVariants> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export interface DropdownRadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export interface DropdownRadioItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownItemVariants> {
  value: string;
  disabled?: boolean;
}

// Context for managing dropdown state
interface DropdownContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
};

// Radio group context
interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

const useRadioGroupContext = () => {
  const context = useContext(RadioGroupContext);
  return context;
};

const Dropdown: React.FC<DropdownProps> = ({ 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange, 
  children 
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, onOpenChange]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (open && event.key === 'Escape') {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onOpenChange]);

  return (
    <DropdownContext.Provider value={{ open, onOpenChange, triggerRef, contentRef }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownTrigger = React.forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ className, variant, size, children, asChild, ...props }, ref) => {
    const { open, onOpenChange, triggerRef } = useDropdownContext();

    const handleClick = () => {
      onOpenChange(!open);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpenChange(true);
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref: ref || triggerRef,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        'data-state': open ? 'open' : 'closed',
        'aria-expanded': open,
        'aria-haspopup': 'menu',
        ...(children.props || {}),
      } as any);
    }

    return (
      <Button
        ref={ref || triggerRef}
        variant={variant === 'default' ? 'primary' : variant}
        size={size}
        className={cn(dropdownTriggerVariants({ variant, className }))}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        data-state={open ? 'open' : 'closed'}
        aria-expanded={open}
        aria-haspopup="menu"
        {...props}
      >
        {children}
        <Icon icon={ChevronDownIcon} size="sm" className="transition-transform duration-200" />
      </Button>
    );
  }
);
DropdownTrigger.displayName = 'DropdownTrigger';

const DropdownContent = React.forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ className, size, align = 'center', side = 'bottom', sideOffset = 4, children, ...props }, ref) => {
    const { open, onOpenChange, triggerRef, contentRef } = useDropdownContext();
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Calculate position
    useEffect(() => {
      if (open && triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = 0;
        let left = 0;

        // Calculate vertical position
        if (side === 'top') {
          top = triggerRect.top - sideOffset;
        } else {
          top = triggerRect.bottom + sideOffset;
        }

        // Calculate horizontal position
        if (align === 'start') {
          left = triggerRect.left;
        } else if (align === 'end') {
          left = triggerRect.right;
        } else {
          left = triggerRect.left + triggerRect.width / 2;
        }

        // Adjust for viewport boundaries
        if (left + 200 > viewportWidth) {
          left = viewportWidth - 200 - 10;
        }
        if (left < 10) {
          left = 10;
        }

        setPosition({ top, left });
      }
    }, [open, align, side, sideOffset]);

    // Focus management
    useEffect(() => {
      if (open && contentRef.current) {
        const firstItem = contentRef.current.querySelector('[role="menuitem"]:not([data-disabled="true"])') as HTMLElement;
        if (firstItem) {
          firstItem.focus();
        }
      }
    }, [open]);

    if (!open) return null;

    const handleKeyDown = (event: React.KeyboardEvent) => {
      const items = Array.from(
        contentRef.current?.querySelectorAll('[role="menuitem"]:not([data-disabled="true"])') || []
      ) as HTMLElement[];

      const currentIndex = items.indexOf(event.target as HTMLElement);

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[nextIndex]?.focus();
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prevIndex]?.focus();
          break;
        }
        case 'Home':
          event.preventDefault();
          items[0]?.focus();
          break;
        case 'End':
          event.preventDefault();
          items[items.length - 1]?.focus();
          break;
      }
    };

    return (
      <div
        ref={ref || contentRef}
        className={cn(
          dropdownContentVariants({ size, className }),
          'fixed'
        )}
        style={{ top: position.top, left: position.left }}
        data-state={open ? 'open' : 'closed'}
        data-side={side}
        role="menu"
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownContent.displayName = 'DropdownContent';

const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ className, variant, size, disabled, onSelect, children, ...props }, ref) => {
    const { onOpenChange } = useDropdownContext();

    const handleClick = (event: React.MouseEvent) => {
      if (disabled) return;
      
      onSelect?.(event);
      
      if (!event.defaultPrevented) {
        onOpenChange(false);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
        event.preventDefault();
        handleClick(event as any);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(dropdownItemVariants({ variant, size, className }))}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        data-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownItem.displayName = 'DropdownItem';

const DropdownLabel = React.forwardRef<HTMLDivElement, DropdownLabelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-2 py-1.5 text-sm font-semibold text-secondary-900', className)}
      {...props}
    />
  )
);
DropdownLabel.displayName = 'DropdownLabel';

const DropdownSeparator = React.forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-secondary-200', className)}
      {...props}
    />
  )
);
DropdownSeparator.displayName = 'DropdownSeparator';

const DropdownCheckboxItem = React.forwardRef<HTMLDivElement, DropdownCheckboxItemProps>(
  ({ className, variant, size, checked, onCheckedChange, disabled, children, ...props }, ref) => {
    const { onOpenChange } = useDropdownContext();

    const handleClick = (event: React.MouseEvent) => {
      if (disabled) return;
      event.preventDefault();
      onCheckedChange?.(!checked);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
        event.preventDefault();
        onCheckedChange?.(!checked);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(dropdownItemVariants({ variant, size, className }), 'pr-8')}
        role="menuitemcheckbox"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        data-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        {checked && (
          <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
            <Icon icon={CheckIcon} size="sm" />
          </span>
        )}
      </div>
    );
  }
);
DropdownCheckboxItem.displayName = 'DropdownCheckboxItem';

const DropdownRadioGroup: React.FC<DropdownRadioGroupProps> = ({
  value,
  onValueChange,
  children,
  ...props
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div role="group" {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

const DropdownRadioItem = React.forwardRef<HTMLDivElement, DropdownRadioItemProps>(
  ({ className, variant, size, value, disabled, children, ...props }, ref) => {
    const { onOpenChange } = useDropdownContext();
    const radioContext = useRadioGroupContext();
    const isSelected = radioContext?.value === value;

    const handleClick = (event: React.MouseEvent) => {
      if (disabled) return;
      event.preventDefault();
      radioContext?.onValueChange?.(value);
      onOpenChange(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
        event.preventDefault();
        radioContext?.onValueChange?.(value);
        onOpenChange(false);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(dropdownItemVariants({ variant, size, className }), 'pr-8')}
        role="menuitemradio"
        aria-checked={isSelected}
        tabIndex={disabled ? -1 : 0}
        data-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        {isSelected && (
          <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
            <Icon icon={CheckIcon} size="sm" />
          </span>
        )}
      </div>
    );
  }
);
DropdownRadioItem.displayName = 'DropdownRadioItem';

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownCheckboxItem,
  DropdownRadioGroup,
  DropdownRadioItem,
  dropdownContentVariants,
  dropdownItemVariants,
  dropdownTriggerVariants,
};