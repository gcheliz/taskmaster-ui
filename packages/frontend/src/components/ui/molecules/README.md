# Molecular Components

This directory contains molecular components that combine atomic components into useful UI patterns, following the atomic design methodology.

## Overview

Molecular components are combinations of atomic components that work together as a unit. They are more complex than atoms but still fairly basic and serve as the building blocks for organisms.

## Available Components

### Form Components

#### FormField
A complete form field that combines Label and Input atoms with validation states.

**Features:**
- Built-in label, description, and help text
- Error and success states with appropriate styling
- Icon support (left and right)
- Multiple input sizes and variants
- Full accessibility support

**Usage:**
```tsx
import { FormField } from '@/components/ui/molecules';

<FormField
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  helpText="We'll never share your email"
  error={errors.email}
  required
/>
```

#### SearchField
A specialized input field for search functionality with built-in search icon.

**Features:**
- Integrated search icon
- Clear button functionality
- Loading states
- Search-specific keyboard interactions

### Layout Components

#### Card
A flexible container component for displaying structured content.

**Features:**
- Header, content, and footer sections
- Multiple variants (default, outline, elevated, ghost)
- Size variants (sm, md, lg)
- Composable sub-components

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/molecules';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Feedback Components

#### Alert
A component for displaying important messages to users.

**Features:**
- Multiple variants (info, success, warning, error)
- Icon support
- Dismissible alerts
- Custom titles and descriptions

### Navigation Components

#### Tabs
A set of layered sections of content that display one panel at a time.

**Features:**
- Multiple visual variants (default, line, pills)
- Controlled and uncontrolled modes
- Full keyboard navigation
- ARIA compliance
- Context-based state management

**Usage:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/molecules';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Pagination
A component for navigating through multiple pages of content.

**Features:**
- Complete pagination system with ellipsis support
- Previous/Next buttons
- Multiple size variants
- Configurable visible page count
- Helper component for easy implementation

**Usage:**
```tsx
import { CompletePagination } from '@/components/ui/molecules';

<CompletePagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  maxVisiblePages={5}
/>
```

### Overlay Components

#### Modal
A dialog component that overlays content on top of the main interface.

**Features:**
- React Portal for proper overlay behavior
- Focus trapping and keyboard navigation
- Multiple size variants (sm, md, lg, xl, full)
- Controlled and uncontrolled modes
- Accessibility features (ARIA attributes, ESC key handling)
- Body scroll prevention

**Usage:**
```tsx
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/molecules';

<Modal open={open} onOpenChange={setOpen}>
  <ModalTrigger>Open Modal</ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Modal Title</ModalTitle>
    </ModalHeader>
    <ModalBody>
      Modal content
    </ModalBody>
    <ModalFooter>
      <Button onClick={() => setOpen(false)}>Close</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Interactive Components

#### Dropdown
A dropdown menu component that displays a list of options in an overlay.

**Features:**
- Keyboard navigation (Arrow keys, Home, End, Enter, Space, Escape)
- Multiple positioning options (align, side)
- Checkbox and radio group support
- Click-outside handling
- Multiple size variants
- Disabled item support
- Controlled and uncontrolled modes

**Usage:**
```tsx
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/molecules';

<Dropdown>
  <DropdownTrigger>Open Menu</DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Option 1</DropdownItem>
    <DropdownItem>Option 2</DropdownItem>
    <DropdownItem>Option 3</DropdownItem>
  </DropdownContent>
</Dropdown>
```

## Design Principles

### Composition
All molecular components are designed to be composable, allowing you to combine them in different ways while maintaining consistency.

### Accessibility
Every component includes proper ARIA attributes, keyboard navigation, and focus management to ensure they are accessible to all users.

### Flexibility
Components support both controlled and uncontrolled modes, allowing you to use them in different patterns depending on your needs.

### Type Safety
All components are fully typed with TypeScript, providing excellent developer experience and catching errors at compile time.

## Styling

All molecular components use:
- **class-variance-authority** for type-safe variant management
- **Tailwind CSS** for styling with custom design tokens
- **CSS-in-JS** patterns where needed for dynamic styling

## Testing

Components are tested using:
- **Storybook** for visual testing and documentation
- **TypeScript** for type checking
- Manual accessibility testing

## Integration

These molecular components are designed to work seamlessly with:
- The atomic components in `../atoms/`
- The organism components in `../organisms/`
- The overall TaskMaster UI design system

## Contributing

When adding new molecular components:

1. **Follow the naming convention**: `ComponentName.tsx`
2. **Include comprehensive TypeScript types**
3. **Add Storybook stories** with multiple examples
4. **Ensure accessibility compliance**
5. **Follow the existing patterns** for variants and props
6. **Update this README** with documentation
7. **Export from the index file**

## File Structure

```
molecules/
├── Alert.tsx                 # Alert component for notifications
├── Card.tsx                  # Flexible container component
├── Dropdown.tsx              # Interactive dropdown menu
├── FormField.tsx             # Complete form field component
├── Modal.tsx                 # Dialog/modal overlay component
├── Pagination.tsx            # Page navigation component
├── SearchField.tsx           # Specialized search input
├── Tabs.tsx                  # Tabbed content navigation
├── index.ts                  # Component exports
└── README.md                 # This documentation file
```

## Dependencies

All molecular components depend on:
- React 18+
- TypeScript
- class-variance-authority
- Tailwind CSS
- The atomic components from `../atoms/`

## Browser Support

Components are tested and supported in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Components use React.forwardRef for proper ref handling
- Minimal re-renders through careful state management
- Lazy loading where appropriate
- Optimized bundle size through tree shaking