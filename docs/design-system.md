# TaskMaster Design System

This document outlines the design system implementation using Tailwind CSS v4.1.11 for the TaskMaster UI project.

## Overview

The TaskMaster design system provides a comprehensive set of design tokens, components, and utilities built on top of Tailwind CSS. It ensures consistency across the application while maintaining flexibility for custom implementations.

## Setup and Configuration

### Tailwind CSS Installation

The project uses Tailwind CSS v4.1.11 with PostCSS for processing:

```bash
# Dependencies installed
pnpm add -D tailwindcss@^4.1.11 postcss@^8.5.6 autoprefixer@^10.4.21 @tailwindcss/postcss@^4.1.11
```

### Configuration Files

**`packages/frontend/tailwind.config.js`**
- Complete theme configuration with custom colors, typography, spacing
- Custom component utilities via plugin system
- Responsive breakpoints and design tokens

**`packages/frontend/postcss.config.js`**
- PostCSS configuration with Tailwind and Autoprefixer
- Uses `@tailwindcss/postcss` plugin for v4 compatibility

**`packages/frontend/src/index.css`**
- Tailwind directives: `@tailwind base`, `@tailwind components`, `@tailwind utilities`
- Imports existing design token CSS

## Design Tokens

### Color System

#### Primary Colors
- **Primary**: Blue scale (50-950) - `primary-50` through `primary-950`
- **Secondary**: Gray scale (50-950) - `secondary-50` through `secondary-950`
- **Success**: Green scale (50-950) - `success-50` through `success-950`
- **Warning**: Amber scale (50-950) - `warning-50` through `warning-950`
- **Error**: Red scale (50-950) - `error-50` through `error-950`

#### Semantic Colors
- **Status Colors**: `status-pending`, `status-in-progress`, `status-done`, `status-blocked`, `status-deferred`
- **Priority Colors**: `priority-low`, `priority-medium`, `priority-high`

### Typography

#### Font Families
- **Primary**: Inter (UI text)
- **Monospace**: JetBrains Mono (code blocks)

#### Typography Scale
- **Display**: `text-display-large`, `text-display-medium`, `text-display-small`
- **Headlines**: `text-headline-large`, `text-headline-medium`, `text-headline-small`
- **Body**: `text-body-large`, `text-body-medium`, `text-body-small`
- **Code**: `text-code` (inline code with background)

#### Letter Spacing
- `tracking-tighter` through `tracking-widest`

### Spacing System

Enhanced spacing scale with additional values:
- Standard Tailwind spacing: `0` through `64`
- Custom additions: `15`, `18`, `22`, `26`, `30`, `34`, `88`, `128`, `144`, `192`

### Breakpoints

```css
xs: 475px
sm: 640px  
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
3xl: 1920px
```

### Shadows

- **Standard**: `shadow-xs` through `shadow-2xl`
- **Custom**: `shadow-task-card`, `shadow-modal`, `shadow-dropdown`
- **Focus**: `shadow-focus`, `shadow-focus-error`, `shadow-focus-success`

### Z-Index Scale

```css
dropdown: 1000
sticky: 1020
fixed: 1030
modal-backdrop: 1040
modal: 1050
popover: 1060
tooltip: 1070
toast: 1080
```

## Custom Component Classes

### Button Components
```css
.btn-primary     /* Primary action button */
.btn-secondary   /* Secondary action button */
```

### Form Components
```css
.input-base      /* Consistent form input styling */
```

### Card Components
```css
.task-card       /* Task card with hover effects */
.card-elevated   /* Elevated card with shadow */
.card-flat       /* Flat card with border only */
.surface-1       /* Basic elevation */
.surface-2       /* Medium elevation */
.surface-3       /* High elevation */
```

### Status Components
```css
.status-pending     /* Orange background for pending status */
.status-in-progress /* Blue background for active status */
.status-done        /* Green background for completed status */
.status-blocked     /* Red background for blocked status */
.status-deferred    /* Gray background for deferred status */
```

### Priority Indicators
```css
.priority-low       /* Left border indicator for low priority */
.priority-medium    /* Left border indicator for medium priority */
.priority-high      /* Left border indicator for high priority */
```

### Layout Utilities
```css
.container-xs       /* Extra small container */
.container-fluid    /* Full width fluid container */
```

### Animation Classes
```css
.animate-fade-in    /* Fade in animation */
.animate-slide-in   /* Slide in animation */
.animate-bounce-soft /* Soft bounce animation */
.animate-pulse-soft  /* Soft pulse animation */
```

### Accessibility
```css
.focus-ring         /* Consistent focus styling */
.sr-only           /* Screen reader only content */
.not-sr-only       /* Show content to screen readers */
```

## Usage Examples

### Task Card
```tsx
<div className="task-card priority-high">
  <div className="flex items-center justify-between mb-3">
    <h4 className="text-headline-small">Task Title</h4>
    <span className="status-in-progress px-2 py-1 rounded text-xs">
      In Progress
    </span>
  </div>
  <p className="text-body-medium text-secondary-600 mb-3">
    Task description here...
  </p>
</div>
```

### Form Input
```tsx
<input 
  className="input-base focus-ring" 
  placeholder="Enter text..."
  type="text"
/>
```

### Buttons
```tsx
<button className="btn-primary">Save Changes</button>
<button className="btn-secondary">Cancel</button>
```

### Typography
```tsx
<h1 className="text-display-large">Page Title</h1>
<h2 className="text-headline-large">Section Header</h2>
<p className="text-body-large">Body content with proper spacing and readability.</p>
<code className="text-code">inline code</code>
```

## Build Output

- **Production CSS**: ~53KB (gzipped: ~9KB)
- **Purging**: Enabled - unused classes are automatically removed
- **Custom utilities**: Included in build output
- **Design tokens**: Available as CSS custom properties

## Testing Components

The project includes comprehensive showcase components for testing:

- **`ColorShowcase.tsx`**: Displays all color tokens and status indicators
- **`TypographyShowcase.tsx`**: Shows typography scale and usage examples  
- **`TailwindTestPage.tsx`**: Complete design system demonstration

## Performance

- CSS purging reduces bundle size by removing unused classes
- Custom utilities are only included when used in components
- Design tokens use CSS custom properties for efficient theming
- Build process optimized for production deployment

## Development Workflow

1. **Add new components**: Use existing design tokens and utilities
2. **Custom utilities**: Add to `tailwind.config.js` plugin if needed globally
3. **Testing**: Use showcase components to verify design system consistency
4. **Building**: Run `pnpm build` to generate optimized CSS bundle

## Accessibility Features

- WCAG-compliant focus indicators
- High contrast mode support
- Reduced motion preferences respected
- Screen reader utilities available
- Semantic color usage for status and priority

## Dark Theme Support

Full dark theme implementation with CSS custom properties:
- Automatic background/text color switching
- Adjusted shadow intensities for dark backgrounds  
- Enhanced focus indicators for dark theme
- Maintains contrast ratios across themes