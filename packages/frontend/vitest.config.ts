import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Performance and resource management
    pool: 'threads',
    poolOptions: {
      threads: {
        // Limit threads to prevent CPU overload
        maxThreads: 2,
        minThreads: 1,
      }
    },
    // Prevent hanging tests
    testTimeout: 30000, // 30 seconds
    hookTimeout: 30000,
    // Disable watch mode by default
    watch: false,
    // Run tests sequentially to reduce CPU load
    maxConcurrency: 1,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-utils.tsx',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'src/stories/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})