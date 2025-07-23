# Accessibility Documentation

## Overview

This directory contains comprehensive documentation for implementing and maintaining accessibility features in the TaskMaster UI application. Our goal is to ensure the application is usable by everyone, regardless of ability.

## Contents

### 📋 [WCAG Compliance Report](./wcag-compliance-report.md)
Complete audit of WCAG 2.1 Level AA compliance status, testing results, and certification.

### 🛠️ [Implementation Guide](./implementation-guide.md)
Technical guide for developers on implementing accessible components and patterns.

### ✅ [Testing Checklist](./testing-checklist.md)
Step-by-step checklist for testing accessibility during development.

## Quick Links

### Key Features
- **Keyboard Navigation**: Full keyboard support with shortcuts
- **Screen Reader Support**: Comprehensive ARIA implementation
- **Visual Accessibility**: High contrast, focus indicators, zoom support
- **Touch Accessibility**: Appropriate touch targets and gestures

### Testing Commands
```bash
# Run accessibility tests
pnpm test src/tests/accessibility

# Run specific test suites
pnpm test wcag-compliance.test
pnpm test keyboard-navigation.test
pnpm test screen-reader.test
```

### Key Hooks and Components
- `useKeyboardShortcuts()` - Global keyboard shortcuts
- `useFocusManagement()` - Focus management utilities
- `<AriaLiveRegion>` - Screen reader announcements
- `<SkipLink>` - Skip navigation links
- `<FocusableTaskCard>` - Accessible drag-and-drop

## Accessibility Standards

We follow WCAG 2.1 Level AA standards:
- ✅ **Perceivable**: Information presented in multiple ways
- ✅ **Operable**: Full keyboard and assistive technology support
- ✅ **Understandable**: Clear language and predictable behavior
- ✅ **Robust**: Compatible with various assistive technologies

## Getting Started

### For Developers
1. Read the [Implementation Guide](./implementation-guide.md)
2. Review component examples and patterns
3. Use the [Testing Checklist](./testing-checklist.md) for new features
4. Run automated tests before committing

### For Testers
1. Install testing tools (axe DevTools, WAVE)
2. Follow the [Testing Checklist](./testing-checklist.md)
3. Test with keyboard and screen readers
4. Report issues with clear reproduction steps

### For Designers
1. Use sufficient color contrast (4.5:1 minimum)
2. Design clear focus indicators
3. Ensure touch targets are 44x44px minimum
4. Don't rely on color alone for information

## Common Patterns

### Accessible Button
```typescript
<button 
  aria-label="Delete task: Fix login bug"
  onClick={handleDelete}
>
  <TrashIcon />
</button>
```

### Accessible Form Field
```typescript
<FormField 
  label="Email Address" 
  error={errors.email}
  required
>
  <input 
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby="email-error"
  />
</FormField>
```

### Loading State
```typescript
<div aria-busy="true" aria-label="Loading repositories">
  <Spinner />
  <span className="sr-only">Loading repositories...</span>
</div>
```

### Live Announcement
```typescript
<AriaLiveRegion 
  message="Task saved successfully"
  politeness="polite"
/>
```

## Support

### Reporting Issues
- Use GitHub issues with "accessibility" label
- Include assistive technology and browser details
- Provide clear reproduction steps
- Reference specific WCAG criteria if known

### Getting Help
- Review documentation in this directory
- Check component examples in Storybook
- Ask in #accessibility Slack channel
- Consult WCAG guidelines

## Maintenance

### Regular Tasks
- Quarterly accessibility audits
- Update tests for new features
- Review and update documentation
- Train team on best practices

### Continuous Improvement
- Monitor user feedback
- Stay updated on WCAG changes
- Improve tooling and automation
- Share learnings with team

---

*Last Updated: January 2025*
*Next Review: April 2025*