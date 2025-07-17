# TaskMaster UI Component Library - Usage & Contribution Guide

## Overview

The TaskMaster UI component library follows atomic design principles, organizing components into three main categories:

- **Atoms**: Basic building blocks (Button, Input, Icon, etc.)
- **Molecules**: Simple combinations of atoms (FormField, Card, Modal, etc.)
- **Organisms**: Complex UI sections (currently none in this library)

## Installation & Setup

### Development Environment

```bash
# Install dependencies
pnpm install

# Start Storybook development server
pnpm run storybook

# Run tests
pnpm run test

# Build Storybook
pnpm run build-storybook
```

### Using Components

```typescript
import { Button, Input, FormField } from '@/components/ui';

// Basic usage
<Button variant="primary" size="md">
  Click me
</Button>

// Complex form field
<FormField
  label="Email"
  type="email"
  placeholder="Enter your email"
  required
  description="We'll use this to send you updates"
/>
```

## Component Architecture

### Base Component Structure

All components follow a consistent pattern:

```typescript
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const componentVariants = cva(
  'base-styles',
  {
    variants: {
      variant: {
        default: 'variant-styles',
        // other variants...
      },
      size: {
        sm: 'size-styles',
        md: 'size-styles',
        lg: 'size-styles',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  /**
   * JSDoc comment with description
   * @default 'defaultValue'
   */
  propName?: string;
}

const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Component.displayName = 'Component';

export { Component, componentVariants };
```

### Styling System

We use Tailwind CSS with a custom design system:

- **Colors**: Primary, secondary, success, warning, error, muted
- **Spacing**: Consistent spacing scale
- **Typography**: Semantic text sizes (body, headline, etc.)
- **Shadows**: Consistent elevation system

## Documentation Standards

### JSDoc Comments

All props must have JSDoc comments:

```typescript
export interface ComponentProps {
  /**
   * Brief description of the prop
   * @default 'defaultValue'
   */
  propName?: string;
  
  /**
   * Required prop description
   */
  requiredProp: string;
  
  /**
   * Enum-like prop with options
   */
  variant?: 'option1' | 'option2' | 'option3';
}
```

### Storybook Stories

Each component should have comprehensive stories:

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Component } from './Component';

const meta: Meta<typeof Component> = {
  title: 'Atoms/Component',
  component: Component,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Detailed component description with usage guidelines.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Only define custom argTypes if needed
    // Most props are auto-generated from TypeScript
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic examples
export const Default: Story = {
  args: {
    children: 'Example content',
  },
};

// Interactive examples
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Component variant="option1">Option 1</Component>
      <Component variant="option2">Option 2</Component>
      <Component variant="option3">Option 3</Component>
    </div>
  ),
};
```

## Development Workflow

### Adding New Components

1. **Create the component file** in the appropriate directory:
   - `/atoms/` for basic building blocks
   - `/molecules/` for component combinations
   - `/organisms/` for complex sections

2. **Follow the base component structure** shown above

3. **Add comprehensive TypeScript interfaces** with JSDoc comments

4. **Create Storybook stories** with examples and documentation

5. **Write tests** for component behavior

6. **Update the index.ts** to export the new component

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  test('renders correctly', () => {
    render(<Component>Test content</Component>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('applies variant styles', () => {
    render(<Component variant="primary">Test</Component>);
    expect(screen.getByText('Test')).toHaveClass('expected-class');
  });
});
```

## Accessibility Guidelines

### ARIA Support

- Use appropriate ARIA attributes
- Ensure keyboard navigation works
- Provide screen reader support
- Test with accessibility tools

### Focus Management

- Visible focus indicators
- Logical tab order
- Keyboard shortcuts where appropriate
- Focus trapping for modals

### Color and Contrast

- Meet WCAG 2.1 AA standards
- Don't rely on color alone for information
- Provide alternative text for images/icons

## Design Tokens

### Color System

```css
/* Primary colors */
--color-primary-50: #eff6ff;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;

/* Secondary colors */
--color-secondary-50: #f8fafc;
--color-secondary-500: #64748b;
--color-secondary-600: #475569;
--color-secondary-700: #334155;

/* Status colors */
--color-success-500: #10b981;
--color-warning-500: #f59e0b;
--color-error-500: #ef4444;
```

### Typography Scale

```css
/* Text sizes */
.text-body-small { font-size: 0.875rem; line-height: 1.25rem; }
.text-body-medium { font-size: 1rem; line-height: 1.5rem; }
.text-body-large { font-size: 1.125rem; line-height: 1.75rem; }

.text-headline-small { font-size: 1.25rem; line-height: 1.75rem; }
.text-headline-medium { font-size: 1.5rem; line-height: 2rem; }
.text-headline-large { font-size: 1.875rem; line-height: 2.25rem; }
```

## Performance Guidelines

### Bundle Size Optimization

- Use tree-shakable exports
- Lazy load heavy components
- Minimize external dependencies
- Use CSS-in-JS efficiently

### Runtime Performance

- Minimize re-renders with React.memo
- Use useCallback for event handlers
- Implement proper prop types
- Avoid inline styles and functions

## Contributing

### Pull Request Guidelines

1. **Fork the repository** and create a feature branch
2. **Follow the component structure** and naming conventions
3. **Add comprehensive tests** for new components
4. **Update documentation** and Storybook stories
5. **Ensure accessibility** compliance
6. **Test cross-browser compatibility**

### Code Style

- Use TypeScript for all components
- Follow ESLint and Prettier configurations
- Use semantic HTML elements
- Follow BEM-like CSS naming when needed

### Review Process

- All components must pass automated tests
- Accessibility audit required
- Design system compliance check
- Performance impact assessment

## Troubleshooting

### Common Issues

**Component not rendering:**
- Check if component is properly exported
- Verify import path is correct
- Ensure all required props are provided

**Styling issues:**
- Check Tailwind CSS purge settings
- Verify design tokens are being used
- Test in different browsers

**TypeScript errors:**
- Ensure proper interface inheritance
- Check forwardRef generic types
- Verify variant prop types match

### Getting Help

- Check Storybook documentation
- Review existing component examples
- Ask in team chat or create issue

## Versioning

We follow semantic versioning:

- **Major**: Breaking changes to component APIs
- **Minor**: New components or non-breaking features
- **Patch**: Bug fixes and documentation updates

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Accessibility Guide](https://reactjs.org/docs/accessibility.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)