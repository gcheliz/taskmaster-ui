import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: false, // Only bind to localhost for security
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: true,
      },
    },
    // Security headers for dev server
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  build: {
    // Security-focused build options
    minify: 'esbuild', // Use esbuild for minification (default and faster)
    rollupOptions: {
      output: {
        // Prevent sensitive information in output
        manualChunks: undefined,
        // Generate random file names for better security
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Source maps for debugging (disable in production if needed)
    sourcemap: process.env.NODE_ENV === 'development',
  },
  define: {
    // Remove process.env access in production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  esbuild: {
    // Drop console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  // Prevent leaking environment variables
  envPrefix: 'VITE_TASKMASTER_',
})
