# Atomic Design Structure for Frontend Components

## Overview

The Component Development Agent follows Brad Frost's Atomic Design methodology to create a scalable and maintainable component architecture.

## Component Hierarchy

### 1. Atoms

The smallest building blocks of the UI.

**Location**: `packages/frontend/src/components/atoms/`

**Examples**:

- Button
- Input
- Label
- Icon
- Badge
- Avatar

**Characteristics**:

- Single-purpose
- No dependencies on other components
- Highly reusable
- Foundation for all other components

### 2. Molecules

Simple groups of atoms functioning together as a unit.

**Location**: `packages/frontend/src/components/molecules/`

**Examples**:

- FormField (Label + Input + Error)
- SearchBar (Input + Button + Icon)
- Card (Container + Text + Image)
- NavItem (Icon + Label)

**Characteristics**:

- Combines 2-3 atoms
- Single, focused purpose
- Reusable across different contexts
- Props passed down to atoms

### 3. Organisms

Complex components composed of molecules and/or atoms.

**Location**: `packages/frontend/src/components/organisms/`

**Examples**:

- Header
- Navigation
- Form
- DataTable
- Modal
- Sidebar

**Characteristics**:

- Can contain business logic
- May connect to state management
- Often unique to specific features
- Composed of multiple molecules/atoms

### 4. Templates

Page-level objects that place components into a layout.

**Location**: `packages/frontend/src/components/templates/`

**Examples**:

- DashboardTemplate
- AuthTemplate
- SettingsTemplate
- ListTemplate

**Characteristics**:

- Define page structure
- No real content (uses placeholders)
- Focuses on content structure
- Reusable across similar pages

### 5. Pages

Specific instances of templates with real content.

**Location**: `packages/frontend/src/pages/`

**Examples**:

- HomePage
- LoginPage
- UserDashboard
- ProjectSettings

**Characteristics**:

- Actual application pages
- Connected to routing
- Fetches and manages data
- Uses templates with real content

## Component File Structure

Each component follows this structure:

```
ComponentName/
├── index.ts                 # Export file
├── ComponentName.tsx        # Main component
├── ComponentName.types.ts   # TypeScript interfaces
├── ComponentName.module.css # CSS modules
├── ComponentName.test.tsx   # Tests
└── ComponentName.stories.tsx # Storybook stories
```

## Naming Conventions

- **Components**: PascalCase (e.g., `ButtonPrimary`)
- **Props interfaces**: ComponentNameProps (e.g., `ButtonPrimaryProps`)
- **Files**: Match component name
- **CSS classes**: camelCase in modules
- **Test files**: .test.tsx extension
- **Story files**: .stories.tsx extension

## TypeScript Requirements

All components must:

1. Export typed props interface
2. Use React.FC<Props> type
3. Include JSDoc comments
4. Define explicit return types
5. Avoid `any` types

## Accessibility Standards

Every component must:

1. Include appropriate ARIA attributes
2. Support keyboard navigation
3. Maintain focus management
4. Provide screen reader support
5. Meet WCAG 2.1 AA standards

## CSS Architecture

- Use CSS Modules for component styles
- Integrate Tailwind utility classes
- Follow mobile-first responsive design
- Support dark mode
- Maintain consistent spacing/sizing tokens

## Testing Strategy

1. **Unit Tests**: All components must have tests
2. **Accessibility Tests**: Using axe-core
3. **Visual Tests**: Storybook snapshots
4. **Integration Tests**: For complex organisms
5. **Coverage Target**: Minimum 80%

## Import Organization

Follow this order:

1. React and React types
2. External libraries
3. Internal utilities/hooks
4. Sibling components
5. Styles
6. Types

Example:

```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../atoms/Button';
import styles from './Card.module.css';
import type { CardProps } from './Card.types';
```

## Component Generation Commands

```bash
# Generate an atom
/component Button atom --props "label:string:required,onClick:()=>void:required,variant:string" --aria

# Generate a molecule with children
/component Card molecule --props "title:string:required,subtitle:string" --children

# Generate an organism with hooks
/component UserProfile organism --props "userId:string:required" --hooks "User,Auth"
```

## Best Practices

1. **Single Responsibility**: Each component should do one thing well
2. **Composition over Inheritance**: Use component composition
3. **Props over State**: Prefer controlled components
4. **Memoization**: Use React.memo for expensive components
5. **Error Boundaries**: Implement for organisms and templates
6. **Performance**: Lazy load heavy components
7. **Documentation**: Every component needs usage examples
