# Tailwind CSS and Storybook Integration

## Overview

The Component Development Agent now includes full integration with Tailwind CSS for styling and automatic Storybook story generation for component documentation and testing.

## Features

### Tailwind CSS Integration

1. **Design Tokens**
   - Predefined color schemes
   - Spacing scales
   - Typography sizes
   - Shadow elevations
   - Border radius options
   - Animation presets

2. **Component-Specific Styling**
   - Button styling with variants and sizes
   - Card styling with elevation
   - Input styling with states
   - Grid layouts with responsive breakpoints
   - Container utilities

3. **Utility Functions**
   - `generateButtonClasses()` - Button-specific Tailwind classes
   - `generateCardClasses()` - Card component styling
   - `generateInputClasses()` - Form input styling
   - `generateContainerClasses()` - Layout containers
   - `generateGridClasses()` - Responsive grid layouts
   - `generateA11yClasses()` - Accessibility utilities
   - `generateAnimationClasses()` - Animation configurations

### Storybook Story Generation

1. **Automatic Story Creation**
   - Generates CSF 3.0 format stories
   - Infers controls from prop types
   - Creates variant stories for all options
   - Includes playground story for experimentation

2. **Smart Control Inference**
   - Union types → Select controls
   - Boolean props → Toggle controls
   - String props → Text controls
   - Function props → Action controls
   - Number props → Number controls with range

3. **Story Features**
   - Auto-generated documentation
   - Interactive controls (args)
   - Variant stories for each prop option
   - Custom story support
   - Play functions for interaction testing
   - Dark mode support

## Usage

### Basic Component with Styling

```typescript
const result = await componentDevelopmentAgent.generateComponent({
  name: 'PrimaryButton',
  type: 'atom',
  props: [
    { name: 'label', type: 'string', required: true },
    { name: 'onClick', type: '() => void', required: true },
  ],
  styling: {
    variant: 'primary',
    size: 'md',
    rounded: true,
  },
});
```

### Component with Custom Stories

```typescript
const result = await componentDevelopmentAgent.generateComponent({
  name: 'NotificationCard',
  type: 'molecule',
  props: [
    { name: 'title', type: 'string', required: true },
    { name: 'message', type: 'string', required: true },
    {
      name: 'type',
      type: "'info' | 'success' | 'warning' | 'error'",
      required: true,
    },
  ],
  stories: [
    {
      name: 'SuccessNotification',
      args: {
        title: 'Success!',
        message: 'Your changes have been saved.',
        type: 'success',
      },
      description: 'Success notification example',
    },
    {
      name: 'ErrorNotification',
      args: {
        title: 'Error',
        message: 'Something went wrong. Please try again.',
        type: 'error',
      },
      description: 'Error notification example',
    },
  ],
});
```

## Styling Options

### TailwindStyleOptions Interface

```typescript
interface TailwindStyleOptions {
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'warning'
    | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  rounded?: boolean;
  elevation?: 0 | 1 | 2 | 3 | 4;
  animation?: 'none' | 'pulse' | 'bounce' | 'spin' | 'ping';
}
```

### Generated Component Structure

Components generated with Tailwind integration include:

```tsx
import React from 'react';
import { cn } from '@/utils/cn';
import styles from './ComponentName.module.css';

export const ComponentName: React.FC<Props> = props => {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 px-4 py-2 text-base rounded-md',
        styles.container
      )}
    >
      {/* Component content */}
    </div>
  );
};
```

## Storybook Story Structure

### Generated Story Example

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from '../ComponentName';

const meta = {
  title: 'Atoms/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Component description',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select', options: ['primary', 'secondary', 'danger'] },
    },
    size: {
      control: { type: 'select', options: ['sm', 'md', 'lg'] },
    },
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default args
  },
};

// Auto-generated variant stories
export const VariantPrimary: Story = {
  /* ... */
};
export const VariantSecondary: Story = {
  /* ... */
};
export const SizeSm: Story = {
  /* ... */
};
export const SizeMd: Story = {
  /* ... */
};
export const SizeLg: Story = {
  /* ... */
};

export const Playground: Story = {
  args: {
    ...Default.args,
  },
};
```

## Design Tokens

### Available Tokens

```typescript
const designTokens = {
  colors: {
    primary: 'blue-600',
    secondary: 'gray-600',
    danger: 'red-600',
    success: 'green-600',
    warning: 'yellow-600',
  },
  spacing: {
    xs: '0.5', // 0.125rem
    sm: '1', // 0.25rem
    md: '2', // 0.5rem
    lg: '3', // 0.75rem
    xl: '4', // 1rem
  },
  shadows: {
    0: 'shadow-none',
    1: 'shadow-sm',
    2: 'shadow',
    3: 'shadow-md',
    4: 'shadow-lg',
  },
};
```

### Customizing Design Tokens

```typescript
tailwindIntegration.updateDesignTokens({
  colors: {
    primary: 'indigo-600',
    secondary: 'purple-600',
  },
  spacing: {
    xxl: '6', // 1.5rem
  },
});
```

## Best Practices

1. **Component Naming**
   - Include component type in name (e.g., `PrimaryButton`, `FeatureCard`)
   - This helps with automatic styling inference

2. **Prop Types**
   - Use union types for variants to get select controls
   - Provide defaultValue for better Storybook experience
   - Include descriptions for documentation

3. **Styling Options**
   - Start with predefined variants
   - Use elevation for depth hierarchy
   - Consider dark mode from the start

4. **Story Organization**
   - Let the generator create default stories
   - Add custom stories for specific states
   - Use play functions for interaction tests

5. **Accessibility**
   - Always include aria-label for interactive components
   - Use proper semantic HTML elements
   - Test with keyboard navigation

## Integration with CI/CD

The generated Storybook stories can be used for:

1. **Visual Regression Testing**
   - Chromatic or Percy integration
   - Automatic screenshot comparison

2. **Interaction Testing**
   - Play functions for user flows
   - Accessibility testing with axe

3. **Documentation**
   - Auto-generated from component props
   - Live examples with controls

## Command Examples

```bash
# Generate a styled button
/component PrimaryButton atom --props "label:string:required,onClick:()=>void:required" --styling "variant:primary,size:md"

# Generate a card with stories
/component FeatureCard molecule --children --props "title:string:required,icon:React.ReactNode" --stories

# Generate a form input with states
/component FormInput atom --props "value:string:required,error:string,disabled:boolean" --styling "size:md"
```

## Troubleshooting

### Common Issues

1. **Tailwind classes not applying**
   - Ensure Tailwind CSS is configured in the project
   - Check that the CSS file is imported
   - Verify PostCSS is processing the styles

2. **Storybook stories not loading**
   - Check .storybook/main.js configuration
   - Ensure stories glob pattern includes generated files
   - Verify component exports are correct

3. **Dark mode not working**
   - Add `darkMode: 'class'` to tailwind.config.js
   - Ensure Storybook has dark mode addon configured

### Debug Mode

Enable debug logging:

```typescript
process.env.COMPONENT_DEBUG = 'true';
```

This will log:

- Generated Tailwind classes
- Story configuration
- Validation results
