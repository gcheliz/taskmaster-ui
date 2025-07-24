# Animation Performance Optimizations

## Overview

This document outlines the performance optimizations implemented for animations in the TaskMaster UI to ensure consistent 60fps performance.

## Optimizations Implemented

### 1. GPU-Accelerated Transforms

- All animations now use `transform` and `opacity` properties exclusively
- Added `translateZ(0)` to force GPU acceleration
- Implemented `will-change` hints for frequently animated elements

```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### 2. Replaced Expensive Animations

- **Box-shadow animations**: Replaced with pseudo-elements using opacity transitions
- **Layout-affecting properties**: Removed animations on width, height, margin, padding
- **Transition-all**: Replaced with specific property transitions

### 3. Performance Monitoring

- Added FPS Monitor component for development environment
- Displays real-time frame rate with color-coded indicators:
  - Green: 55+ FPS (optimal)
  - Yellow: 30-54 FPS (acceptable)
  - Red: <30 FPS (poor)

### 4. Reduced Motion Support

- Implemented `useReducedMotion` hook to detect user preference
- All animations respect `prefers-reduced-motion` media query
- Instant transitions (0.01ms) for users who prefer reduced motion

### 5. Optimized Scroll Animations

- Implemented `ScrollAnimation` component using Intersection Observer
- Prevents unnecessary re-renders and calculations
- Supports staggered animations with `ScrollStagger` component

### 6. Animation Utilities

Created performance-optimized animation utilities:

- `performantAnimations.ts`: GPU-accelerated animation variants
- `useAnimationPerformance`: Hook for monitoring animation performance
- `useScrollAnimation`: Hook for scroll-triggered animations

## Usage Examples

### Basic Animation

```tsx
import { hoverLift } from '@/utils/animations'

<motion.div
  className="card gpu-accelerated"
  {...hoverLift}
>
  Content
</motion.div>
```

### Scroll Animation

```tsx
import { ScrollAnimation } from '@/components/common/ScrollAnimation'

<ScrollAnimation threshold={0.2}>
  <Card>Content appears on scroll</Card>
</ScrollAnimation>
```

### Reduced Motion

```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion'

const Component = () => {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { scale: 1.1 }}
    >
      Content
    </motion.div>
  )
}
```

## Performance Tips

1. **Use transform and opacity only**: These properties can be animated on the GPU
2. **Avoid animating box-shadow**: Use pseudo-elements instead
3. **Be specific with transitions**: Use `transition-transform` instead of `transition-all`
4. **Use will-change sparingly**: Only on elements that will definitely animate
5. **Remove will-change after animation**: Set to `auto` when animation completes
6. **Test with throttled CPU**: Use Chrome DevTools to simulate slower devices
7. **Monitor FPS**: Keep the FPS monitor enabled during development

## CSS Classes

- `.gpu-accelerated`: Forces GPU acceleration
- `.optimized-card`: Card with optimized shadow hover effect
- `.animation-container`: Contains layout for animation boundaries
- `.optimized-transition`: Specific property transitions
- `.will-animate-transform`: Hints for transform animations
- `.will-animate-opacity`: Hints for opacity animations

## Browser Support

All optimizations are compatible with modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

Fallbacks are provided for older browsers that don't support:
- CSS `will-change` property
- `prefers-reduced-motion` media query
- Intersection Observer API