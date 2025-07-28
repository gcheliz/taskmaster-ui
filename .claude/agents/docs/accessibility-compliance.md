# Accessibility Compliance Module

## Overview

The Accessibility Compliance module ensures that all generated React components meet WCAG 2.1 AA standards. It integrates seamlessly with the Component Development Agent and State Management Agent to provide comprehensive accessibility features out of the box.

## Features

### 1. Automatic ARIA Attributes

The module automatically adds appropriate ARIA attributes based on component type and functionality:

- **Buttons**: `role="button"`, `aria-label`, `aria-disabled`
- **Forms**: `aria-label`, `aria-describedby`, `aria-invalid`, `aria-errormessage`
- **Modals**: `role="dialog"`, `aria-modal`, `aria-label`
- **Navigation**: `role="navigation"`, `aria-label`
- **Tables**: `role="table"`, `aria-label`, `aria-sort`

### 2. Keyboard Navigation

Full keyboard support for all interactive components:

- **Tab Navigation**: Proper focus order and tab indexing
- **Enter/Space**: Activation for buttons and form controls
- **Escape**: Close modals, dropdowns, and dismissible elements
- **Arrow Keys**: Navigation within menus, lists, and data tables

### 3. Focus Management

Advanced focus handling for complex UI patterns:

- **Focus Trap**: Keep focus within modals and overlays
- **Focus Return**: Return focus to trigger element after closing
- **Focus Indicators**: High-contrast focus rings (2px)
- **Skip Links**: Jump to main content for keyboard users

### 4. Screen Reader Support

Comprehensive screen reader announcements:

- **Live Regions**: Dynamic content updates
- **Loading States**: Announce when content is loading
- **Error Messages**: Assertive announcements for errors
- **Success Messages**: Polite announcements for success

### 5. Color Contrast Validation

Automated contrast checking:

- **WCAG AA**: 4.5:1 for normal text, 3:1 for large text
- **WCAG AAA**: 7:1 for normal text, 4.5:1 for large text
- **Dark Mode**: Ensure contrast in both light and dark themes

### 6. Semantic HTML

Proper HTML structure and landmarks:

- **Headings**: Logical heading hierarchy
- **Landmarks**: main, nav, aside, footer
- **Lists**: Proper list structures for groups
- **Forms**: Fieldsets and legends for grouping

## Usage

### Basic Component Enhancement

```typescript
import { componentDevelopmentAgent } from '@/agents/frontend-agents';

// Component automatically enhanced with accessibility
await componentDevelopmentAgent.generateComponent({
  name: 'AccessibleButton',
  type: 'atom',
  props: [
    { name: 'label', type: 'string', required: true },
    { name: 'onClick', type: '() => void', required: true },
  ],
});
```

### Manual Enhancement

```typescript
import { accessibilityCompliance } from '@/agents/frontend-agents';

const options = {
  name: 'CustomComponent',
  type: 'molecule',
  props: [...]
};

// Enhance with accessibility features
const enhanced = accessibilityCompliance.enhanceComponentWithA11y(options);
```

### Generate Accessibility Tests

```typescript
// Generate comprehensive a11y tests
const tests = accessibilityCompliance.generateA11yTests(
  'ComponentName',
  options
);

// Tests include:
// - Axe-core violations check
// - Keyboard navigation tests
// - Screen reader support tests
// - Focus management tests
// - Color contrast validation
```

## Component Type Examples

### Atom: Button

```tsx
<AccessibleButton
  label="Submit"
  onClick={handleSubmit}
  ariaLabel="Submit form"
  disabled={isSubmitting}
/>
```

Generated features:

- `role="button"`
- Keyboard activation (Enter/Space)
- Focus indicator
- Disabled state handling

### Molecule: Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  ariaLabel="Confirmation dialog"
>
  {content}
</Modal>
```

Generated features:

- `role="dialog"`
- Focus trap
- Escape key handling
- Focus return on close

### Organism: Data Table

```tsx
<DataTable data={users} columns={columns} ariaLabel="User list" sortable />
```

Generated features:

- `role="table"`
- Arrow key navigation
- Sort announcements
- Row selection handling

## Testing

### Automated Tests

Every component includes an `.a11y.test.tsx` file with:

```typescript
// Axe-core violations
it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Keyboard navigation
it('should be keyboard navigable', () => {
  render(<Component />);
  userEvent.tab();
  expect(element).toHaveFocus();
});

// Screen reader
it('should announce state changes', () => {
  render(<Component loading />);
  expect(element).toHaveAttribute('aria-busy', 'true');
});
```

### Manual Testing Checklist

1. **Keyboard Only**
   - [ ] Can navigate using only keyboard
   - [ ] Focus indicators are visible
   - [ ] Can activate all interactive elements
   - [ ] Can escape from traps (modals, menus)

2. **Screen Reader**
   - [ ] All content is announced
   - [ ] Interactive elements have labels
   - [ ] State changes are announced
   - [ ] Error messages are announced

3. **Visual**
   - [ ] Text has sufficient contrast
   - [ ] Focus indicators are visible
   - [ ] Error states use more than color
   - [ ] Works in high contrast mode

## Configuration

### Global Settings

```typescript
// Configure accessibility defaults
accessibilityCompliance.configure({
  wcagLevel: 'AA', // or 'AAA'
  focusIndicator: 'ring', // or 'outline', 'custom'
  announcements: {
    loading: 'Loading, please wait...',
    error: 'Error: {message}',
    success: 'Action completed successfully',
  },
});
```

### Component-Specific Options

```typescript
{
  accessibility: {
    ariaLabel: true,
    ariaDescribedBy: true,
    role: 'button',
    keyboard: true,
    focusManagement: true
  }
}
```

## Best Practices

### 1. Always Provide Labels

```tsx
// Good
<Button ariaLabel="Save document">Save</Button>

// Better - visible label is also the accessible label
<Button>Save Document</Button>
```

### 2. Announce Dynamic Changes

```tsx
// Announce loading states
{
  loading && <div aria-live="polite">Loading results...</div>;
}

// Announce errors immediately
{
  error && <div aria-live="assertive">{error}</div>;
}
```

### 3. Logical Focus Order

```tsx
// Focus should follow visual order
<Header /> // Tab index 1-3
<Nav />    // Tab index 4-6
<Main />   // Tab index 7+
<Footer /> // Tab index last
```

### 4. Meaningful Link Text

```tsx
// Bad
<a href="/docs">Click here</a>

// Good
<a href="/docs">Read the documentation</a>
```

## Troubleshooting

### Common Issues

1. **Focus Not Trapped in Modal**
   - Ensure `focusManagement: true` is set
   - Check that all focusable elements are within the trap

2. **Keyboard Navigation Not Working**
   - Verify `keyboard: true` is enabled
   - Check for `preventDefault()` conflicts

3. **Screen Reader Not Announcing**
   - Ensure proper ARIA labels are set
   - Use live regions for dynamic content
   - Check for competing ARIA attributes

### Debug Mode

```typescript
// Enable accessibility debugging
accessibilityCompliance.debug = true;

// Logs:
// - ARIA attribute generation
// - Focus management setup
// - Keyboard handler registration
// - Live region updates
```

## Integration with Other Agents

### Component Development Agent

Automatically enhances all generated components:

- Adds ARIA attributes
- Implements keyboard navigation
- Generates a11y tests

### State Management Agent

Ensures accessible state updates:

- Loading states with `aria-busy`
- Error announcements
- Success notifications

### Testing Agent

Includes accessibility in test suites:

- Axe-core integration
- Keyboard navigation tests
- Screen reader tests

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
