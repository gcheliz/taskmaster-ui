/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Core brand colors for TaskMaster
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
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
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Task status colors
        status: {
          pending: '#64748b',
          'in-progress': '#3b82f6',
          done: '#22c55e',
          blocked: '#ef4444',
          deferred: '#f59e0b',
        },
        // Priority colors
        priority: {
          low: '#64748b',
          medium: '#f59e0b',
          high: '#ef4444',
        }
      },
      // Typography scale
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
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
      // Spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        // Additional spacing values for TaskMaster components
        '15': '3.75rem',    // 60px
        '18': '4.5rem',     // 72px  
        '22': '5.5rem',     // 88px
        '26': '6.5rem',     // 104px
        '30': '7.5rem',     // 120px
        '34': '8.5rem',     // 136px
        '88': '22rem',      // 352px
        '128': '32rem',     // 512px
        '144': '36rem',     // 576px
        '192': '48rem',     // 768px
      },
      // Custom breakpoints for responsive design
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      // Enhanced shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'task-card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'dropdown': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      // Animation and transitions
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      // Border radius
      borderRadius: {
        'xs': '0.125rem',
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      // Z-index scale
      zIndex: {
        'auto': 'auto',
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '1000',
        'sticky': '1020', 
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
      // Enhanced transition system
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms', 
        'slow': '300ms',
        'slower': '500ms',
      },
      transitionTimingFunction: {
        'ease-brand': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-in-brand': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out-brand': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out-brand': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    // Custom plugin for TaskMaster-specific utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Status utilities
        '.status-pending': {
          backgroundColor: theme('colors.status.pending'),
          color: 'white',
        },
        '.status-in-progress': {
          backgroundColor: theme('colors.status.in-progress'),
          color: 'white',
        },
        '.status-done': {
          backgroundColor: theme('colors.status.done'),
          color: 'white',
        },
        '.status-blocked': {
          backgroundColor: theme('colors.status.blocked'),
          color: 'white',
        },
        '.status-deferred': {
          backgroundColor: theme('colors.status.deferred'),
          color: 'white',
        },
        
        // Priority utilities
        '.priority-low': {
          borderLeftColor: theme('colors.priority.low'),
          borderLeftWidth: '4px',
        },
        '.priority-medium': {
          borderLeftColor: theme('colors.priority.medium'),
          borderLeftWidth: '4px',
        },
        '.priority-high': {
          borderLeftColor: theme('colors.priority.high'),
          borderLeftWidth: '4px',
        },
        
        // Task card styles
        '.task-card': {
          backgroundColor: 'white',
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.task-card'),
          padding: theme('spacing.4'),
          border: `1px solid ${theme('colors.secondary.200')}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: theme('boxShadow.md'),
            transform: 'translateY(-2px)',
          },
        },
        
        // Focus styles
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${theme('colors.primary.500')}40`,
          },
        },
        
        // Brand gradient
        '.bg-brand-gradient': {
          background: `linear-gradient(135deg, ${theme('colors.primary.600')} 0%, ${theme('colors.primary.400')} 100%)`,
        },
        
        // Surface styles for different elevations
        '.surface-1': {
          backgroundColor: 'white',
          boxShadow: theme('boxShadow.sm'),
        },
        '.surface-2': {
          backgroundColor: 'white',
          boxShadow: theme('boxShadow.DEFAULT'),
        },
        '.surface-3': {
          backgroundColor: 'white',
          boxShadow: theme('boxShadow.md'),
        },
        
        // Typography utilities
        '.text-display-large': {
          fontSize: theme('fontSize.5xl[0]'),
          lineHeight: theme('fontSize.5xl[1].lineHeight'),
          fontWeight: theme('fontWeight.bold'),
          letterSpacing: theme('letterSpacing.tight'),
        },
        '.text-display-medium': {
          fontSize: theme('fontSize.4xl[0]'),
          lineHeight: theme('fontSize.4xl[1].lineHeight'),
          fontWeight: theme('fontWeight.bold'),
          letterSpacing: theme('letterSpacing.tight'),
        },
        '.text-display-small': {
          fontSize: theme('fontSize.3xl[0]'),
          lineHeight: theme('fontSize.3xl[1].lineHeight'),
          fontWeight: theme('fontWeight.semibold'),
          letterSpacing: theme('letterSpacing.tight'),
        },
        '.text-headline-large': {
          fontSize: theme('fontSize.2xl[0]'),
          lineHeight: theme('fontSize.2xl[1].lineHeight'),
          fontWeight: theme('fontWeight.semibold'),
        },
        '.text-headline-medium': {
          fontSize: theme('fontSize.xl[0]'),
          lineHeight: theme('fontSize.xl[1].lineHeight'),
          fontWeight: theme('fontWeight.semibold'),
        },
        '.text-headline-small': {
          fontSize: theme('fontSize.lg[0]'),
          lineHeight: theme('fontSize.lg[1].lineHeight'),
          fontWeight: theme('fontWeight.medium'),
        },
        '.text-body-large': {
          fontSize: theme('fontSize.base[0]'),
          lineHeight: theme('fontSize.base[1].lineHeight'),
          fontWeight: theme('fontWeight.normal'),
        },
        '.text-body-medium': {
          fontSize: theme('fontSize.sm[0]'),
          lineHeight: theme('fontSize.sm[1].lineHeight'),
          fontWeight: theme('fontWeight.normal'),
        },
        '.text-body-small': {
          fontSize: theme('fontSize.xs[0]'),
          lineHeight: theme('fontSize.xs[1].lineHeight'),
          fontWeight: theme('fontWeight.normal'),
        },
        
        // Code/monospace text
        '.text-code': {
          fontFamily: theme('fontFamily.mono'),
          fontSize: theme('fontSize.sm[0]'),
          lineHeight: theme('fontSize.sm[1].lineHeight'),
          backgroundColor: theme('colors.secondary.100'),
          padding: '0.125rem 0.25rem',
          borderRadius: theme('borderRadius.sm'),
        },
        
        // Interactive text states
        '.text-interactive': {
          color: theme('colors.primary.600'),
          cursor: 'pointer',
          '&:hover': {
            color: theme('colors.primary.700'),
            textDecoration: 'underline',
          },
        },
        
        // Responsive utilities
        '.container-xs': {
          maxWidth: theme('screens.xs'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
        },
        '.container-fluid': {
          width: '100%',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          marginLeft: 'auto',
          marginRight: 'auto',
        },
        
        // Animation utilities
        '.animate-fade-in': {
          animation: 'fade-in 0.5s ease-in-out',
        },
        '.animate-slide-in': {
          animation: 'slide-in 0.3s ease-out',
        },
        '.animate-bounce-soft': {
          animation: 'bounce-soft 0.6s ease-in-out',
        },
        '.animate-pulse-soft': {
          animation: 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        
        // Button component styles
        '.btn-primary': {
          backgroundColor: theme('colors.primary.500'),
          color: 'white',
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm[0]'),
          lineHeight: theme('fontSize.sm[1].lineHeight'),
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.primary.600'),
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.md'),
          },
          '&:active': {
            backgroundColor: theme('colors.primary.700'),
            transform: 'translateY(0)',
          },
          '&:disabled': {
            backgroundColor: theme('colors.primary.300'),
            cursor: 'not-allowed',
            transform: 'none',
          },
        },
        '.btn-secondary': {
          backgroundColor: 'white',
          color: theme('colors.secondary.700'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm[0]'),
          lineHeight: theme('fontSize.sm[1].lineHeight'),
          border: `1px solid ${theme('colors.secondary.300')}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.secondary.50'),
            borderColor: theme('colors.secondary.400'),
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.md'),
          },
          '&:active': {
            backgroundColor: theme('colors.secondary.100'),
            transform: 'translateY(0)',
          },
          '&:disabled': {
            backgroundColor: theme('colors.secondary.100'),
            color: theme('colors.secondary.400'),
            cursor: 'not-allowed',
            transform: 'none',
          },
        },
        
        // Input component styles
        '.input-base': {
          width: '100%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.md'),
          border: `1px solid ${theme('colors.secondary.300')}`,
          fontSize: theme('fontSize.sm[0]'),
          lineHeight: theme('fontSize.sm[1].lineHeight'),
          backgroundColor: 'white',
          transition: 'all 0.2s ease-in-out',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px ${theme('colors.primary.500')}40`,
          },
          '&:disabled': {
            backgroundColor: theme('colors.secondary.100'),
            color: theme('colors.secondary.500'),
            cursor: 'not-allowed',
          },
          '&::placeholder': {
            color: theme('colors.secondary.400'),
          },
        },
        
        // Modal component styles
        '.modal-backdrop': {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: theme('zIndex.50'),
          padding: theme('spacing.4'),
        },
        '.modal-content': {
          backgroundColor: 'white',
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.modal'),
          maxWidth: '32rem',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        },
        
        // Card component styles
        '.card-elevated': {
          backgroundColor: 'white',
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.lg'),
          padding: theme('spacing.6'),
          border: `1px solid ${theme('colors.secondary.200')}`,
        },
        '.card-flat': {
          backgroundColor: 'white',
          borderRadius: theme('borderRadius.lg'),
          border: `1px solid ${theme('colors.secondary.200')}`,
          padding: theme('spacing.6'),
        },
        
        // Accessibility utilities
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        '.not-sr-only': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: '0',
          margin: '0',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        },
      }

      addUtilities(newUtilities)
    }
  ],
}