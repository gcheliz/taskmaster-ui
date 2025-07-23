/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Accent colors from mockup
        'accent-primary': '#3B82F6',
        'accent-success': '#10B981',
        'accent-warning': '#F59E0B',
        'accent-error': '#EF4444',
        'accent-info': '#06B6D4',
        
        // Extended slate colors
        slate: {
          750: '#1e293b',
          850: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse': 'pulse 2s infinite',
        'blink': 'blink 1s infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}