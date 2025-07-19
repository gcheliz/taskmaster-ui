import React, { useState, createContext, useContext } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const tabsVariants = cva('w-full');

const tabsListVariants = cva(
  'inline-flex items-center justify-center rounded-md p-1 transition-all duration-200 ease-in-out',
  {
    variants: {
      variant: {
        default:
          'bg-secondary-100 text-secondary-600 dark:bg-surface-800 dark:text-secondary-400',
        line: 'border-b border-secondary-200 dark:border-surface-700 bg-transparent',
        pills: 'bg-secondary-100 p-1 dark:bg-surface-800',
        card: 'bg-white border border-secondary-200 shadow-sm dark:bg-surface-900 dark:border-surface-700',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      responsive: {
        true: 'flex-wrap sm:flex-nowrap overflow-x-auto',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      responsive: false,
    },
  }
);

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium ring-offset-2 transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-100 dark:focus-visible:ring-offset-surface-900 disabled:pointer-events-none disabled:opacity-50 transform-gpu hover:scale-[1.02] active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'hover:bg-secondary-50 dark:hover:bg-surface-700 data-[state=active]:bg-white data-[state=active]:text-secondary-950 data-[state=active]:shadow-sm dark:data-[state=active]:bg-surface-700 dark:data-[state=active]:text-secondary-100',
        line: 'border-b-2 border-transparent rounded-none hover:bg-secondary-50 dark:hover:bg-surface-800/50 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 dark:data-[state=active]:border-primary-400 dark:data-[state=active]:text-primary-400',
        pills:
          'hover:bg-secondary-50 dark:hover:bg-surface-700 data-[state=active]:bg-white data-[state=active]:text-secondary-950 data-[state=active]:shadow-sm dark:data-[state=active]:bg-surface-700 dark:data-[state=active]:text-secondary-100',
        card: 'hover:bg-secondary-50 dark:hover:bg-surface-800 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 data-[state=active]:border-primary-200 dark:data-[state=active]:bg-primary-900/20 dark:data-[state=active]:text-primary-300 dark:data-[state=active]:border-primary-700',
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const tabsContentVariants = cva(
  'mt-2 ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-100 dark:focus-visible:ring-offset-surface-900 animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
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

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: 'default' | 'line' | 'pills' | 'card';
  size: 'sm' | 'md' | 'lg';
  responsive: boolean;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

export interface TabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsVariants> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'line' | 'pills' | 'card';
  size?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      defaultValue,
      value,
      onValueChange,
      variant = 'default',
      size = 'md',
      responsive = false,
      children,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const activeTab = value !== undefined ? value : internalValue;

    const handleTabChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <TabsContext.Provider
        value={{
          activeTab,
          setActiveTab: handleTabChange,
          variant,
          size,
          responsive,
        }}
      >
        <div ref={ref} className={cn(tabsVariants({ className }))} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

export interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {
  /**
   * Whether to show a dropdown menu on mobile for better responsive behavior
   */
  showMobileDropdown?: boolean;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  (
    {
      className,
      variant: propVariant,
      size: propSize,
      responsive: propResponsive,
      showMobileDropdown = false,
      ...props
    },
    ref
  ) => {
    const {
      variant: contextVariant,
      size: contextSize,
      responsive: contextResponsive,
    } = useTabsContext();
    const variant = propVariant || contextVariant;
    const size = propSize || contextSize;
    const responsive = propResponsive || contextResponsive;

    const handleKeyDown = (event: React.KeyboardEvent) => {
      const tablist = event.currentTarget;
      const tabs = Array.from(
        tablist.querySelectorAll('[role="tab"]')
      ) as HTMLElement[];
      const currentIndex = tabs.findIndex(
        tab => tab === document.activeElement
      );

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex]?.focus();
        tabs[nextIndex]?.click();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex =
          currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        tabs[prevIndex]?.focus();
        tabs[prevIndex]?.click();
      } else if (event.key === 'Home') {
        event.preventDefault();
        tabs[0]?.focus();
        tabs[0]?.click();
      } else if (event.key === 'End') {
        event.preventDefault();
        tabs[tabs.length - 1]?.focus();
        tabs[tabs.length - 1]?.click();
      }
    };

    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(
          tabsListVariants({ variant, size, responsive, className })
        )}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabsTriggerVariants> {
  value: string;
  /**
   * Icon to display before the tab text
   */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /**
   * Badge content to display after the tab text
   */
  badge?: React.ReactNode;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    {
      className,
      variant: propVariant,
      size: propSize,
      value,
      icon: Icon,
      badge,
      children,
      ...props
    },
    ref
  ) => {
    const {
      activeTab,
      setActiveTab,
      variant: contextVariant,
      size: contextSize,
    } = useTabsContext();
    const variant = propVariant || contextVariant;
    const size = propSize || contextSize;
    const isActive = activeTab === value;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${value}`}
        data-state={isActive ? 'active' : 'inactive'}
        className={cn(tabsTriggerVariants({ variant, size, className }))}
        onClick={() => setActiveTab(value)}
        {...props}
      >
        <div className="flex items-center space-x-2">
          {Icon && (
            <Icon
              className={cn(
                'flex-shrink-0',
                size === 'sm' && 'h-3 w-3',
                size === 'md' && 'h-4 w-4',
                size === 'lg' && 'h-5 w-5'
              )}
              aria-hidden="true"
            />
          )}
          {children && <span>{children}</span>}
          {badge && (
            <span className="inline-flex items-center rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-medium text-secondary-800 dark:bg-surface-700 dark:text-secondary-200">
              {badge}
            </span>
          )}
        </div>
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsContentVariants> {
  value: string;
  /**
   * Whether to animate the content transition
   * @default true
   */
  animate?: boolean;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  (
    { className, size: propSize, value, animate = true, children, ...props },
    ref
  ) => {
    const { activeTab, size: contextSize } = useTabsContext();
    const size = propSize || contextSize;
    const isActive = activeTab === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`panel-${value}`}
        aria-labelledby={`tab-${value}`}
        className={cn(
          tabsContentVariants({ size, className }),
          !animate && 'animate-none'
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsVariants,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants,
};
