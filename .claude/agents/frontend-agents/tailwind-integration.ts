/**
 * Tailwind CSS Integration for Component Development Agent
 * 
 * Provides design system tokens and utility class generation
 */

export interface DesignTokens {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, string>;
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
  animation: Record<string, string>;
}

export interface TailwindStyleOptions {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  rounded?: boolean;
  elevation?: 0 | 1 | 2 | 3 | 4;
  animation?: 'none' | 'pulse' | 'bounce' | 'spin' | 'ping';
}

export class TailwindIntegration {
  private designTokens: DesignTokens = {
    colors: {
      primary: 'blue-600',
      secondary: 'gray-600',
      danger: 'red-600',
      success: 'green-600',
      warning: 'yellow-600',
      ghost: 'transparent',
    },
    spacing: {
      xs: '0.5',
      sm: '1',
      md: '2',
      lg: '3',
      xl: '4',
    },
    typography: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    shadows: {
      0: 'shadow-none',
      1: 'shadow-sm',
      2: 'shadow',
      3: 'shadow-md',
      4: 'shadow-lg',
    },
    borderRadius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    },
    animation: {
      none: '',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
      spin: 'animate-spin',
      ping: 'animate-ping',
    },
  };

  /**
   * Generate Tailwind classes for a button component
   */
  generateButtonClasses(options: TailwindStyleOptions): string {
    const classes: string[] = [
      // Base styles
      'inline-flex items-center justify-center',
      'font-medium transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ];

    // Variant styles
    if (options.variant) {
      const variantClasses = this.getVariantClasses(options.variant);
      classes.push(...variantClasses);
    }

    // Size styles
    if (options.size) {
      const sizeClasses = this.getSizeClasses(options.size);
      classes.push(...sizeClasses);
    }

    // Width
    if (options.fullWidth) {
      classes.push('w-full');
    }

    // Border radius
    classes.push(options.rounded ? this.designTokens.borderRadius.full : this.designTokens.borderRadius.md);

    // Animation
    if (options.animation && options.animation !== 'none') {
      classes.push(this.designTokens.animation[options.animation]);
    }

    return classes.join(' ');
  }

  /**
   * Generate Tailwind classes for a card component
   */
  generateCardClasses(options: TailwindStyleOptions): string {
    const classes: string[] = [
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700',
      this.designTokens.borderRadius.lg,
      'overflow-hidden',
    ];

    // Elevation
    if (options.elevation !== undefined && options.elevation > 0) {
      classes.push(this.designTokens.shadows[options.elevation]);
    }

    return classes.join(' ');
  }

  /**
   * Generate Tailwind classes for an input component
   */
  generateInputClasses(options: TailwindStyleOptions): string {
    const classes: string[] = [
      'block w-full',
      'border border-gray-300 dark:border-gray-600',
      'bg-white dark:bg-gray-800',
      'text-gray-900 dark:text-gray-100',
      this.designTokens.borderRadius.md,
      'shadow-sm',
      'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      'disabled:bg-gray-100 dark:disabled:bg-gray-700',
      'disabled:cursor-not-allowed',
    ];

    // Size
    if (options.size) {
      const paddingMap = {
        xs: 'px-2 py-1',
        sm: 'px-3 py-1.5',
        md: 'px-4 py-2',
        lg: 'px-4 py-2.5',
        xl: 'px-5 py-3',
      };
      classes.push(paddingMap[options.size]);
      classes.push(this.designTokens.typography[options.size]);
    }

    return classes.join(' ');
  }

  /**
   * Generate responsive container classes
   */
  generateContainerClasses(maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'): string {
    const classes = ['mx-auto px-4 sm:px-6 lg:px-8'];
    
    if (maxWidth && maxWidth !== 'full') {
      classes.push(`max-w-${maxWidth}`);
    }

    return classes.join(' ');
  }

  /**
   * Generate grid classes
   */
  generateGridClasses(cols: number | { sm?: number; md?: number; lg?: number }, gap?: string): string {
    const classes = ['grid'];
    
    if (typeof cols === 'number') {
      classes.push(`grid-cols-${cols}`);
    } else {
      if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
      if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
      if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    }

    if (gap) {
      classes.push(`gap-${gap}`);
    }

    return classes.join(' ');
  }

  /**
   * Get variant-specific classes
   */
  private getVariantClasses(variant: string): string[] {
    const variantMap: Record<string, string[]> = {
      primary: [
        'bg-blue-600 hover:bg-blue-700',
        'text-white',
        'focus:ring-blue-500',
      ],
      secondary: [
        'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600',
        'text-gray-900 dark:text-gray-100',
        'focus:ring-gray-500',
      ],
      danger: [
        'bg-red-600 hover:bg-red-700',
        'text-white',
        'focus:ring-red-500',
      ],
      success: [
        'bg-green-600 hover:bg-green-700',
        'text-white',
        'focus:ring-green-500',
      ],
      warning: [
        'bg-yellow-500 hover:bg-yellow-600',
        'text-white',
        'focus:ring-yellow-500',
      ],
      ghost: [
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
        'text-gray-700 dark:text-gray-300',
        'focus:ring-gray-500',
      ],
    };

    return variantMap[variant] || [];
  }

  /**
   * Get size-specific classes
   */
  private getSizeClasses(size: string): string[] {
    const sizeMap: Record<string, string[]> = {
      xs: ['px-2.5 py-1.5', 'text-xs'],
      sm: ['px-3 py-2', 'text-sm'],
      md: ['px-4 py-2', 'text-base'],
      lg: ['px-5 py-2.5', 'text-lg'],
      xl: ['px-6 py-3', 'text-xl'],
    };

    return sizeMap[size] || [];
  }

  /**
   * Generate accessibility classes
   */
  generateA11yClasses(options: {
    srOnly?: boolean;
    focusable?: boolean;
    role?: string;
  }): string {
    const classes: string[] = [];

    if (options.srOnly) {
      classes.push('sr-only');
      if (options.focusable) {
        classes.push('focus:not-sr-only');
      }
    }

    return classes.join(' ');
  }

  /**
   * Generate animation classes with custom timing
   */
  generateAnimationClasses(
    animation: string,
    options?: {
      duration?: string;
      delay?: string;
      timing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    }
  ): string {
    const classes: string[] = [animation];

    if (options?.duration) {
      classes.push(`duration-${options.duration}`);
    }
    if (options?.delay) {
      classes.push(`delay-${options.delay}`);
    }
    if (options?.timing) {
      classes.push(options.timing);
    }

    return classes.join(' ');
  }

  /**
   * Get design tokens for use in custom components
   */
  getDesignTokens(): DesignTokens {
    return { ...this.designTokens };
  }

  /**
   * Update design tokens (for theme customization)
   */
  updateDesignTokens(tokens: Partial<DesignTokens>): void {
    this.designTokens = {
      ...this.designTokens,
      ...tokens,
    };
  }
}

export const tailwindIntegration = new TailwindIntegration();