# Custom Scrollbar Implementation

## Overview

The application now uses custom-styled scrollbars that match the design system, replacing the default browser scrollbars with more visually appealing ones.

## Available Scrollbar Classes

### 1. `scrollbar-thin`
**Usage**: General purpose thin scrollbar
**Applied to**: Main content areas, lists, dropdowns
- 6px width/height
- Light gray color with transparency
- Subtle hover effect

### 2. `scrollbar-minimal`
**Usage**: Nearly invisible scrollbar that appears on hover
**Applied to**: Sidebar navigation
- 4px width when visible
- Transparent by default
- Appears on container hover

### 3. `scrollbar-dark`
**Usage**: Dark theme scrollbar for dark backgrounds
**Applied to**: Terminal output (alternative option)
- 8px width/height
- White color with low opacity
- Dark track background

### 4. `scrollbar-auto`
**Usage**: Auto-hiding scrollbar
**Applied to**: Optional for content that rarely scrolls
- Hidden by default
- Appears on hover
- Smooth transition

### 5. `scrollbar-modal`
**Usage**: Subtle scrollbar for modal content
**Applied to**: All modal bodies
- 6px width
- Light gray with subtle track
- Matches modal styling

### 6. `scrollbar-terminal`
**Usage**: Terminal-specific scrollbar
**Applied to**: Terminal output area
- 10px width
- Blue accent color matching terminal theme
- Dark track background

### 7. `scrollbar-kanban`
**Usage**: Minimal scrollbar for kanban columns
**Applied to**: Task board columns
- 4px width (6px on hover)
- Saves horizontal space
- Smooth width transition

### 8. `scrollbar-hidden`
**Usage**: Completely hide scrollbar but maintain scroll functionality
**Applied to**: Special cases where scrollbar should never show

## Implementation

### Basic Usage

```html
<!-- Add to any scrollable container -->
<div className="overflow-y-auto scrollbar-thin">
  <!-- Content -->
</div>
```

### Component Examples

```tsx
// Modal with custom scrollbar
<div className="modal-body overflow-y-auto scrollbar-modal">
  {content}
</div>

// Sidebar with minimal scrollbar
<nav className="overflow-y-auto scrollbar-minimal">
  {menuItems}
</nav>

// Terminal with themed scrollbar
<div className="terminal-output overflow-y-auto scrollbar-terminal">
  {output}
</div>
```

## Browser Support

- **Chrome/Edge**: Full support with `-webkit-scrollbar` pseudo-elements
- **Firefox**: Uses `scrollbar-width` and `scrollbar-color` properties
- **Safari**: Full support with `-webkit-scrollbar` pseudo-elements

## Global Styling

The `<body>` element has default custom scrollbar styling applied:
- 12px width for main scrollbar
- Light gray color scheme
- Rounded corners with padding

## Accessibility

- Custom scrollbars maintain full keyboard navigation
- Scroll functionality is preserved
- Visual contrast meets WCAG guidelines
- No impact on screen readers

## Performance

- CSS-only implementation (no JavaScript)
- GPU-accelerated transitions
- No impact on scroll performance
- Minimal CSS overhead

## Customization

To create a new scrollbar style:

```css
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: [thumb-color] [track-color];
}

.scrollbar-custom::-webkit-scrollbar {
  width: [width];
  height: [height];
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: [track-color];
  border-radius: [radius];
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: [thumb-color];
  border-radius: [radius];
  transition: background-color 0.2s ease;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background-color: [hover-color];
}
```

## Components Updated

- **AppLayout**: Main content area uses `scrollbar-thin`
- **Sidebar**: Navigation uses `scrollbar-minimal`
- **Modal**: All modals use `scrollbar-modal`
- **Terminal**: Terminal output uses `scrollbar-terminal`
- **TaskBoard**: Horizontal scroll areas use `scrollbar-thin`
- **KanbanColumn**: Task lists use `scrollbar-kanban`
- **Various dropdowns**: Use `scrollbar-thin`