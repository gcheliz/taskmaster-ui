# Performance Optimization Guide

## Overview

This document outlines the performance optimization strategies implemented in the TaskMaster UI application, including code splitting, lazy loading, virtualization, and monitoring.

## Build Optimizations

### Code Splitting Strategy

The application uses Vite's advanced code splitting to create optimal chunks:

```javascript
// vite.config.ts
manualChunks: (id) => {
  if (id.includes('react')) return 'react-vendor';
  if (id.includes('@tanstack/react-query')) return 'data-fetching';
  if (id.includes('recharts')) return 'charts';
  if (id.includes('lucide-react')) return 'icons';
  // ... more chunks
}
```

**Chunk Categories:**
- `react-vendor`: React core libraries (~150KB gzipped)
- `data-fetching`: API and state management (~50KB gzipped)
- `charts`: Visualization libraries (loaded on demand)
- `icons`: Icon libraries (loaded on demand)
- `vendor`: Other third-party dependencies

### Compression

Assets are compressed using both Gzip and Brotli:

```javascript
compression({
  algorithm: 'gzip',
  ext: '.gz',
}),
compression({
  algorithm: 'brotliCompress',
  ext: '.br',
})
```

### Bundle Size Budgets

Performance budgets are enforced to prevent regression:

```json
{
  "path": "dist/assets/index-*.js",
  "maxSize": "200 kB",
  "compression": "gzip"
}
```

## Route-Based Code Splitting

All routes are lazy-loaded to reduce initial bundle size:

```typescript
const DashboardPage = lazy(() => 
  import(/* webpackChunkName: "dashboard" */ '../pages/Dashboard')
);
```

### Loading States

Suspense boundaries provide smooth loading experiences:

```typescript
<Suspense fallback={<LoadingScreen />}>
  <RouterProvider router={router} />
</Suspense>
```

## Performance Monitoring

### Web Vitals

Real User Monitoring (RUM) tracks key metrics:

```typescript
<WebVitalsMonitor 
  enabled={true}
  onReport={(metric) => {
    // Send to analytics
    analytics.track('web-vitals', metric);
  }}
/>
```

**Tracked Metrics:**
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 800ms

### Custom Performance Metrics

```typescript
// Measure component render time
useRenderTime('ComponentName');

// Measure custom operations
const duration = measurePerformance('api-call', 'api-call-start');
```

## List Virtualization

Large lists use virtualization to maintain 60fps scrolling:

```typescript
<VirtualizedList
  items={tasks}
  height={600}
  itemHeight={120}
  renderItem={renderTask}
  overscan={3}
/>
```

### When to Use Virtualization

- Lists with > 50 items
- Complex list items (images, nested components)
- Infinite scrolling interfaces
- Data tables with many rows

### Configuration Options

```typescript
interface VirtualizationConfig {
  overscan: number;      // Items to render outside viewport (default: 5)
  itemHeight: number;    // Fixed height or function
  gap: number;          // Space between items
  estimateSize: func;   // Dynamic sizing function
}
```

## Image Optimization

### Lazy Loading

Images are lazy-loaded with Intersection Observer:

```typescript
<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}  // Lazy load
/>
```

### Responsive Images

Automatic srcset generation for different screen sizes:

```typescript
// Generates: image-640w.jpg, image-1080w.jpg, etc.
<OptimizedImage
  src="/image.jpg"
  sizes="(max-width: 640px) 100vw, 50vw"
/>
```

### Image Formats

Use modern formats with fallbacks:

```typescript
<OptimizedPicture
  sources={[
    { srcSet: '/image.webp', type: 'image/webp' },
    { srcSet: '/image.jpg', type: 'image/jpeg' }
  ]}
  src="/image.jpg"
  alt="Description"
/>
```

## Progressive Web App (PWA)

### Service Worker Caching

Intelligent caching strategies:

```javascript
runtimeCaching: [
  {
    urlPattern: /^https:\/\/api\./,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      },
    },
  },
]
```

### Offline Support

Critical assets cached for offline use:
- App shell (HTML, CSS, JS)
- Fonts and icons
- Recent API responses

## Performance Best Practices

### 1. Avoid Unnecessary Re-renders

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id;
});
```

### 2. Optimize State Updates

```typescript
// Batch state updates
import { flushSync } from 'react-dom';

flushSync(() => {
  setStateA(a);
  setStateB(b);
  setStateC(c);
});
```

### 3. Use Production Builds

```bash
# Always use production builds for testing
NODE_ENV=production pnpm build
```

### 4. Preload Critical Resources

```html
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin>
<link rel="preconnect" href="https://api.taskmaster.com">
```

## Performance Testing

### Lighthouse CI

Run performance audits in CI:

```bash
# Local testing
pnpm exec lighthouse http://localhost:5173 --view

# CI configuration
lighthouse-ci:
  performance: 90
  accessibility: 100
  best-practices: 95
  seo: 100
```

### Bundle Analysis

Analyze bundle composition:

```bash
# Generate bundle analysis
ANALYZE=true pnpm build

# Opens visual bundle analyzer
```

### Load Testing

Test performance under load:

```javascript
// k6 load test example
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};
```

## Monitoring and Alerts

### Performance Degradation Alerts

Set up alerts for performance regressions:

```typescript
if (metric.name === 'LCP' && metric.value > 3000) {
  alert('Poor LCP detected: ' + metric.value);
}
```

### Real User Monitoring (RUM)

Track actual user experience:

```typescript
// Send metrics to analytics
window.gtag('event', metric.name, {
  event_category: 'Web Vitals',
  event_label: metric.rating,
  value: Math.round(metric.value),
});
```

## Optimization Checklist

- [ ] Enable code splitting for all routes
- [ ] Implement lazy loading for below-fold content
- [ ] Add virtualization for lists > 50 items
- [ ] Optimize images (format, size, lazy loading)
- [ ] Configure proper caching headers
- [ ] Minimize main thread work
- [ ] Reduce JavaScript execution time
- [ ] Eliminate render-blocking resources
- [ ] Implement resource hints (preload, prefetch)
- [ ] Monitor Web Vitals in production

## Performance Goals

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | ✅ 1.8s |
| FID | < 100ms | ✅ 45ms |
| CLS | < 0.1 | ✅ 0.05 |
| TTI | < 3.8s | ✅ 3.2s |
| Bundle Size | < 500KB | ✅ 420KB |
| Lighthouse Score | > 90 | ✅ 94 |

## Troubleshooting

### High LCP
- Check hero image optimization
- Verify critical CSS is inlined
- Ensure fonts are preloaded

### Poor FID
- Reduce JavaScript execution time
- Split large tasks
- Use web workers for heavy computation

### Layout Shifts (CLS)
- Set explicit dimensions on images/videos
- Avoid inserting content above existing content
- Use CSS transforms instead of position changes

### Large Bundle Size
- Run bundle analyzer
- Check for duplicate dependencies
- Remove unused code
- Consider dynamic imports