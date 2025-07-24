// Design System Tokens - Single source of truth for design values
// This file defines all design tokens used throughout the application

export const designTokens = {
  // Color Palette
  colors: {
    // Primary brand colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main primary color
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },

    // Neutral colors (using slate)
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },

    // Semantic colors
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
    },

    // Task status colors
    status: {
      pending: '#64748b',
      inProgress: '#3b82f6',
      done: '#22c55e',
      blocked: '#ef4444',
      deferred: '#f59e0b',
    },

    // Priority colors
    priority: {
      low: '#64748b',
      medium: '#f59e0b',
      high: '#ef4444',
    },

    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      dark: {
        primary: '#020617',
        secondary: '#0f172a',
        tertiary: '#1e293b',
      },
    },

    // Text colors
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      disabled: '#94a3b8',
      inverse: '#ffffff',
      dark: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        disabled: '#64748b',
      },
    },

    // Border colors
    border: {
      light: '#e2e8f0',
      default: '#cbd5e1',
      strong: '#94a3b8',
      dark: {
        light: '#334155',
        default: '#475569',
        strong: '#64748b',
      },
    },
  },

  // Typography
  typography: {
    // Font families
    fontFamily: {
      sans: [
        'Inter',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ],
      mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'monospace'],
      display: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
    },

    // Font sizes
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem', // 60px
    },

    // Line heights
    lineHeight: {
      xs: '1rem', // 16px
      sm: '1.25rem', // 20px
      base: '1.5rem', // 24px
      lg: '1.75rem', // 28px
      xl: '1.75rem', // 28px
      '2xl': '2rem', // 32px
      '3xl': '2.25rem', // 36px
      '4xl': '2.5rem', // 40px
      '5xl': '1',
      '6xl': '1',
    },

    // Font weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // Letter spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Spacing system (based on 4px unit)
  spacing: {
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    3.5: '0.875rem', // 14px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem', // 44px
    12: '3rem', // 48px
    14: '3.5rem', // 56px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    28: '7rem', // 112px
    32: '8rem', // 128px
    36: '9rem', // 144px
    40: '10rem', // 160px
    44: '11rem', // 176px
    48: '12rem', // 192px
    52: '13rem', // 208px
    56: '14rem', // 224px
    60: '15rem', // 240px
    64: '16rem', // 256px
    72: '18rem', // 288px
    80: '20rem', // 320px
    96: '24rem', // 384px
  },

  // Border radius
  borderRadius: {
    none: '0',
    xs: '0.125rem', // 2px
    sm: '0.25rem', // 4px
    default: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem', // 32px
    full: '9999px',
  },

  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    default: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',

    // Component-specific shadows
    card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    modal: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    button: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    buttonHover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },

  // Z-index scale
  zIndex: {
    auto: 'auto',
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },

  // Animation and transitions
  animation: {
    // Durations
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },

    // Timing functions
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
    },

    // Predefined animations
    keyframes: {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 },
      },
      slideIn: {
        from: { transform: 'translateX(-100%)' },
        to: { transform: 'translateX(0)' },
      },
      slideOut: {
        from: { transform: 'translateX(0)' },
        to: { transform: 'translateX(-100%)' },
      },
      scaleIn: {
        from: { transform: 'scale(0.95)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 },
      },
      scaleOut: {
        from: { transform: 'scale(1)', opacity: 1 },
        to: { transform: 'scale(0.95)', opacity: 0 },
      },
    },
  },

  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px',
  },

  // Layout
  layout: {
    // Container max widths
    containerMaxWidth: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },

    // Sidebar widths
    sidebarWidth: {
      collapsed: '64px',
      normal: '256px',
      expanded: '320px',
    },

    // Header height
    headerHeight: '64px',

    // Footer height
    footerHeight: '48px',
  },

  // Component specifications
  components: {
    // Button specifications
    button: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      padding: {
        sm: '0 12px',
        md: '0 20px',
        lg: '0 24px',
      },
      fontSize: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
      },
    },

    // Input specifications
    input: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      padding: '0 16px',
      fontSize: '1rem',
    },

    // Card specifications
    card: {
      padding: {
        sm: '16px',
        md: '24px',
        lg: '32px',
      },
      borderRadius: '12px',
    },

    // Modal specifications
    modal: {
      maxWidth: {
        sm: '400px',
        md: '600px',
        lg: '800px',
        xl: '1200px',
      },
      padding: '32px',
      borderRadius: '16px',
    },
  },
} as const

// Type exports for TypeScript
export type DesignTokens = typeof designTokens
export type ColorToken = keyof typeof designTokens.colors
export type SpacingToken = keyof typeof designTokens.spacing
export type FontSizeToken = keyof typeof designTokens.typography.fontSize
export type BorderRadiusToken = keyof typeof designTokens.borderRadius
export type ShadowToken = keyof typeof designTokens.shadows
export type ZIndexToken = keyof typeof designTokens.zIndex
export type BreakpointToken = keyof typeof designTokens.breakpoints

// Helper functions to access tokens
export const getColor = (path: string): string => {
  const keys = path.split('.')
  let result: unknown = designTokens.colors
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key]
    } else {
      throw new Error(`Invalid color path: ${path}`)
    }
  }
  return result as string
}

export const getSpacing = (size: SpacingToken): string => {
  return designTokens.spacing[size]
}

export const getFontSize = (size: FontSizeToken): string => {
  return designTokens.typography.fontSize[size]
}

export const getBorderRadius = (size: BorderRadiusToken): string => {
  return designTokens.borderRadius[size]
}

export const getShadow = (type: ShadowToken): string => {
  return designTokens.shadows[type]
}

export const getZIndex = (level: ZIndexToken): number | string => {
  return designTokens.zIndex[level]
}
