import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import type { Plugin } from 'vite'
import compression from 'vite-plugin-compression'
// import { VitePWA } from 'vite-plugin-pwa'

// Custom plugin to inject preload links for critical chunks
const preloadPlugin = (): Plugin => {
  return {
    name: 'preload-critical-chunks',
    transformIndexHtml(html) {
      // Inject preload links for critical vendor chunks
      const preloadLinks = [
        '<link rel="preload" href="/assets/react-vendor-[hash].js" as="script" crossorigin>',
        '<link rel="preload" href="/assets/index-[hash].js" as="script" crossorigin>',
        '<link rel="preload" href="/assets/index-[hash].css" as="style">',
      ].join('\n    ')
      
      return html.replace('<!-- Preload Critical Resources -->', `<!-- Preload Critical Resources -->\n    ${preloadLinks}`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    preloadPlugin(),
    // Compress assets with gzip and brotli
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // PWA support for offline capabilities
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/api\./,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'api-cache',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 60 * 24, // 24 hours
    //           },
    //         },
    //       },
    //     ],
    //   },
    // }),
    // Bundle analyzer (only in analyze mode)
    ...(process.env.ANALYZE ? [visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }) as Plugin] : []),
  ],
  server: {
    port: 5173,
    host: true, // Allow all connections
    strictPort: false,
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
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Security-focused build options
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Run compress passes twice for better optimization
      },
      mangle: {
        safari10: true, // Workaround for Safari 10 issues
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // 500KB - more aggressive limit
    rollupOptions: {
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: 'no-external', // Better tree-shaking for external modules
      },
      output: {
        // Manual chunks for better code splitting
        manualChunks: (id) => {
          // Core vendor chunk
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Data fetching and state management
            if (id.includes('@tanstack/react-query') || id.includes('axios')) {
              return 'data-fetching';
            }
            // State management
            if (id.includes('zustand') || id.includes('immer')) {
              return 'state-management';
            }
            // Visualization and charts
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }
            // Icons
            if (id.includes('lucide-react') || id.includes('@heroicons')) {
              return 'icons';
            }
            // Date utilities
            if (id.includes('date-fns') || id.includes('dayjs')) {
              return 'date-utils';
            }
            // Editor (TipTap)
            if (id.includes('@tiptap')) {
              return 'editor';
            }
            // Terminal
            if (id.includes('@xterm')) {
              return 'terminal';
            }
            // Forms and validation
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'forms';
            }
            // Animation
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            // Security
            if (id.includes('zxcvbn')) {
              return 'security';
            }
            // Real-time
            if (id.includes('socket.io')) {
              return 'realtime';
            }
            // Monitoring
            if (id.includes('@sentry') || id.includes('web-vitals')) {
              return 'monitoring';
            }
            // Utilities
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'utils';
            }
            // All other vendor modules
            return 'vendor';
          }
        },
        // Generate optimized file names
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Source maps for debugging (disable in production if needed)
    sourcemap: process.env.NODE_ENV === 'development',
    // CSS optimization
    cssMinify: true,
    cssCodeSplit: true, // Split CSS for better caching
    // Asset inlining threshold
    assetsInlineLimit: 4096, // 4kb
  },
  css: {
    // CSS optimization configuration
    postcss: './postcss.config.js',
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
  // Optimize deps
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'lucide-react',
      'web-vitals',
    ],
    exclude: ['@vite-pwa/assets-generator'],
  },
})
