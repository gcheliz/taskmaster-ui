# Accessibility Implementation Guide

## Overview

This document outlines the accessibility features implemented in the TaskMaster UI React application to ensure screen reader support and compliance with WCAG 2.1 guidelines.

## Implemented Features

### 1. Screen Reader Support Components

#### ScreenReaderOnly Component
Located at: `src/components/common/ScreenReaderOnly.tsx`

A reusable component that renders content visible only to screen readers:
```tsx
<ScreenReaderOnly>
  Instructions for screen reader users
</ScreenReaderOnly>
```

#### AriaLiveRegion Component
Located at: `src/components/common/AriaLiveRegion.tsx`

Provides dynamic announcements for screen readers:
```tsx
<AriaLiveRegion 
  message="Task updated successfully" 
  politeness="polite" 
/>
```

### 2. ARIA Attributes Implementation

#### Button Components
- All icon-only buttons include `aria-label` attributes
- Loading states include `aria-busy` attribute
- Warning for missing aria-labels on icon-only buttons

#### Navigation Components
- Sidebar uses `role="menu"` with `role="menuitem"` for items
- Current page marked with `aria-current="page"`
- Navigation landmarks with proper `role="navigation"`

#### Form Fields
- Automatic ID generation for label associations
- `aria-describedby` links inputs to help text and error messages
- `aria-invalid` for error states
- `aria-required` for required fields
- Error messages use `role="alert"`

### 3. Interactive Components

#### Task Board
- Keyboard navigation with arrow keys
- Screen reader announcements for task movements
- Descriptive ARIA labels for drag-and-drop operations
- Live regions for status updates

#### Modal Dialogs
- Focus trap implementation
- `aria-modal="true"` attribute
- Escape key handling
- Return focus to trigger element on close

#### Notifications
- `role="alert"` for important messages
- `aria-live="assertive"` for errors
- `aria-live="polite"` for informational messages

### 4. Utility Functions

Located at: `src/utils/accessibility.ts`

- `generateId()` - Creates unique IDs for form associations
- `combineAriaDescribedBy()` - Combines multiple description IDs
- `getAriaStateAttributes()` - Returns appropriate ARIA attributes for component states
- `announceToScreenReader()` - Programmatically announces messages
- `trapFocus()` - Implements focus trap for modals
- `prefersReducedMotion()` - Checks user motion preferences

### 5. Keyboard Navigation

- Tab order properly maintained
- Skip links for main content
- Roving tabindex for complex widgets
- Keyboard shortcuts documented with descriptions

## Usage Examples

### Adding ARIA Labels to Buttons
```tsx
<Button 
  variant="icon" 
  aria-label="Delete task"
  onClick={handleDelete}
>
  <TrashIcon />
</Button>
```

### Form Field with Descriptions
```tsx
<FormField
  label="Task Title"
  description="Enter a descriptive title for the task"
  error={errors.title}
  required
/>
```

### Dynamic Announcements
```tsx
const { announce } = useAriaAnnouncements()

// In your component
const handleTaskMove = () => {
  announce('Task moved to In Progress column')
}
```

### Skip Link Implementation
```tsx
<SkipLink href="#main-content">
  Skip to main content
</SkipLink>
```

## Testing Accessibility

### Screen Reader Testing
1. Enable VoiceOver (Mac) or NVDA (Windows)
2. Navigate using keyboard only
3. Verify all interactive elements are announced
4. Check form field associations
5. Test dynamic content announcements

### Keyboard Navigation Testing
1. Tab through all interactive elements
2. Verify focus indicators are visible
3. Test modal focus trap
4. Check escape key handling
5. Verify arrow key navigation in task board

### Automated Testing
Run accessibility tests:
```bash
pnpm test:a11y
```

## Best Practices

1. **Always provide text alternatives**
   - Use aria-label for icon-only buttons
   - Include alt text for images
   - Provide screen reader only text for visual indicators

2. **Maintain semantic HTML**
   - Use proper heading hierarchy
   - Use native HTML elements when possible
   - Apply ARIA roles only when necessary

3. **Ensure keyboard accessibility**
   - All interactive elements must be keyboard accessible
   - Provide visible focus indicators
   - Implement logical tab order

4. **Test with real assistive technologies**
   - Don't rely solely on automated testing
   - Test with actual screen readers
   - Get feedback from users with disabilities

## Common Patterns

### Icon Button with Tooltip
```tsx
<Button
  variant="icon"
  aria-label="Edit task"
  title="Edit task"
>
  <PencilIcon aria-hidden="true" />
</Button>
```

### Loading State
```tsx
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? (
    <ScreenReaderOnly>Loading tasks...</ScreenReaderOnly>
  ) : (
    <TaskList />
  )}
</div>
```

### Error Handling
```tsx
{error && (
  <div role="alert" aria-live="assertive">
    <Icon icon={ErrorIcon} aria-hidden="true" />
    <span>{error.message}</span>
  </div>
)}
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [React Accessibility Documentation](https://react.dev/reference/react-dom/components/common#accessibility-attributes)