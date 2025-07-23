# TaskMaster UI - Design System & Style Mockups

## Design Philosophy

**Modern, Clean, Professional** - A task management interface that feels both powerful and approachable, optimized for developer workflows.

### Core Design Principles
1. **Clarity over Complexity** - Every element has purpose
2. **Accessibility First** - WCAG 2.1 AA compliance
3. **Developer-Focused** - Dark mode default, terminal aesthetics
4. **Responsive Excellence** - Mobile-first approach
5. **Performance Optimized** - Lightweight, fast interactions

## Color Palette

### Primary Colors
```css
/* Dark Theme (Primary) */
--color-bg-primary: #0F172A;        /* slate-900 */
--color-bg-secondary: #1E293B;      /* slate-800 */
--color-bg-tertiary: #334155;       /* slate-700 */
--color-bg-elevated: #475569;       /* slate-600 */

/* Light Theme (Secondary) */
--color-bg-light-primary: #F8FAFC;   /* slate-50 */
--color-bg-light-secondary: #F1F5F9; /* slate-100 */
--color-bg-light-tertiary: #E2E8F0;  /* slate-200 */

/* Accent Colors */
--color-accent-primary: #3B82F6;     /* blue-500 */
--color-accent-secondary: #8B5CF6;   /* violet-500 */
--color-accent-success: #10B981;     /* emerald-500 */
--color-accent-warning: #F59E0B;     /* amber-500 */
--color-accent-error: #EF4444;       /* red-500 */
--color-accent-info: #06B6D4;        /* cyan-500 */
```

### Text Colors
```css
/* Dark Theme Text */
--color-text-primary: #F8FAFC;       /* slate-50 */
--color-text-secondary: #CBD5E1;     /* slate-300 */
--color-text-muted: #94A3B8;         /* slate-400 */
--color-text-disabled: #64748B;      /* slate-500 */

/* Light Theme Text */
--color-text-light-primary: #0F172A;  /* slate-900 */
--color-text-light-secondary: #475569; /* slate-600 */
--color-text-light-muted: #64748B;    /* slate-500 */
```

## Typography Scale

### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-heading: 'Satoshi', 'Inter', sans-serif;
```

### Font Sizes
```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

## Component System

### Atomic Design Structure
```
atoms/
├── Button.tsx
├── Input.tsx
├── Badge.tsx
├── Avatar.tsx
├── Icon.tsx
├── Tooltip.tsx
└── Loading.tsx

molecules/
├── SearchBar.tsx
├── TaskCard.tsx
├── StatusBadge.tsx
├── UserMenu.tsx
├── NavItem.tsx
└── MetricCard.tsx

organisms/
├── TaskBoard.tsx
├── Sidebar.tsx
├── Header.tsx
├── TaskList.tsx
├── Dashboard.tsx
└── Terminal.tsx

templates/
├── DashboardLayout.tsx
├── TaskBoardLayout.tsx
├── TerminalLayout.tsx
└── AuthLayout.tsx
```

## Layout System

### Grid System
```css
/* 12-column grid with responsive breakpoints */
--grid-cols-1: repeat(1, minmax(0, 1fr));
--grid-cols-2: repeat(2, minmax(0, 1fr));
--grid-cols-3: repeat(3, minmax(0, 1fr));
--grid-cols-4: repeat(4, minmax(0, 1fr));
--grid-cols-12: repeat(12, minmax(0, 1fr));

/* Responsive breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Spacing Scale
```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
```

## UI Component Specifications

### 1. Task Card Component
```tsx
interface TaskCardProps {
  task: Task;
  variant: 'kanban' | 'list' | 'compact';
  draggable?: boolean;
  selectable?: boolean;
}

// Visual Specs:
// - Rounded corners: 8px
// - Shadow: soft drop shadow on hover
// - Border: 1px solid slate-700 (dark) / slate-200 (light)
// - Padding: 16px
// - Background: slate-800 (dark) / white (light)
// - Hover: subtle scale transform (1.02)
// - Active: blue accent border
```

### 2. Status Badge Component
```tsx
interface StatusBadgeProps {
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  size: 'sm' | 'md' | 'lg';
}

// Color mapping:
// - pending: amber-500
// - in-progress: blue-500
// - completed: emerald-500
// - blocked: red-500
```

### 3. Priority Indicator
```tsx
interface PriorityProps {
  priority: 'low' | 'medium' | 'high' | 'critical';
  variant: 'dot' | 'badge' | 'bar';
}

// Color mapping:
// - low: slate-400
// - medium: amber-500
// - high: orange-500
// - critical: red-500
```

## Page Layouts

### 1. Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header (64px height)                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TaskMaster UI    Search Bar    User Menu   Settings │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Main Content Area                                       │
│ ┌────────────┬─────────────────────────────────────────┐ │
│ │ Sidebar    │ Dashboard Content                       │ │
│ │ (256px)    │ ┌─────────────────────────────────────┐ │ │
│ │            │ │ Welcome Header                      │ │ │
│ │ • Dashboard│ │ Your comprehensive task management  │ │ │
│ │ • Tasks    │ └─────────────────────────────────────┘ │ │
│ │ • Board    │ ┌─────────────────────────────────────┐ │ │
│ │ • Repos    │ │ Stats Grid (4 columns)              │ │ │
│ │ • Terminal │ │ ┌─────┐┌─────┐┌─────┐┌─────┐         │ │ │
│ │ • Settings │ │ │ 15  ││ 8   ││ 3   ││ 92% │         │ │ │
│ │            │ │ │Tasks││Repos││Team ││Perf │         │ │ │
│ │            │ │ └─────┘└─────┘└─────┘└─────┘         │ │ │
│ │            │ └─────────────────────────────────────┘ │ │
│ │            │ ┌─────────────────────────────────────┐ │ │
│ │            │ │ Recent Activity Feed                │ │ │
│ │            │ │ • Task completed                    │ │ │
│ │            │ │ • Repo updated                      │ │ │
│ │            │ │ • New PR created                    │ │ │
│ │            │ └─────────────────────────────────────┘ │ │
│ └────────────┴─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2. Task Board Layout (Kanban)
```
┌─────────────────────────────────────────────────────────┐
│ Header + Board Controls                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TaskBoard    Filter▼ Sort▼ View▼  + Add Task      │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Kanban Columns (Horizontal Scroll)                     │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┐     │
│ │ To Do   │ In Prog │ Review  │ Testing │ Done    │     │
│ │ (3)     │ (2)     │ (1)     │ (2)     │ (8)     │     │
│ │         │         │         │         │         │     │
│ │┌───────┐│┌───────┐│┌───────┐│┌───────┐│┌───────┐│     │
│ ││ Task  ││││ Task  ││││ Task  ││││ Task  ││││ Task  ││     │
│ ││ #123  ││││ #124  ││││ #125  ││││ #126  ││││ #127  ││     │
│ ││ High  ││││ Med   ││││ Low   ││││ High  ││││ Med   ││     │
│ │└───────┘│└───────┘│└───────┘│└───────┘│└───────┘│     │
│ │         │         │         │         │         │     │
│ │┌───────┐│┌───────┐│         │┌───────┐│┌───────┐│     │
│ ││ Task  ││││ Task  ││         ││ Task  ││││ Task  ││     │
│ ││ #128  ││││ #129  ││         ││ #130  ││││ #131  ││     │
│ │└───────┘│└───────┘│         │└───────┘│└───────┘│     │
│ └─────────┴─────────┴─────────┴─────────┴─────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 3. Terminal Layout
```
┌─────────────────────────────────────────────────────────┐
│ Terminal Header                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ● ● ●  TaskMaster Terminal              ⚡ Status   │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Terminal Content                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ gonzalo@taskmaster:~/workspace/taskmaster-ui $      │ │
│ │ > task-master list                                  │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ 📋 Active Tasks (7)                             │ │ │
│ │ │ ✅ Completed Tasks (15)                         │ │ │
│ │ │ 🔄 In Progress (2)                              │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ > task-master next                                  │ │
│ │ 🎯 Next Task: #42 - Implement real-time updates    │ │
│ │                                                     │ │
│ │ > _                                                 │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Quick Commands                                      │ │
│ │ [List Tasks] [Show Next] [Git Status] [Run Tests]  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Responsive Design Specifications

### Mobile Layout (< 768px)
- Sidebar collapses to drawer
- Dashboard grid becomes single column
- Task cards stack vertically
- Terminal becomes full-screen modal

### Tablet Layout (768px - 1024px)
- Sidebar remains visible but narrower (200px)
- Dashboard grid becomes 2 columns
- Task board allows horizontal scroll
- Terminal uses split view

### Desktop Layout (> 1024px)
- Full sidebar (256px)
- Dashboard grid uses 4 columns
- Task board shows all columns
- Terminal uses full layout

## Animation & Interaction

### Micro-interactions
```css
/* Hover effects */
.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

/* Loading states */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

/* Status transitions */
.status-badge {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Drag and drop */
.task-dragging {
  opacity: 0.7;
  transform: rotate(2deg);
}
```

### Page Transitions
- Slide transitions between views
- Fade in/out for modals
- Smooth scroll for anchor links
- Loading states for async operations

## Accessibility Features

### Screen Reader Support
- Proper ARIA labels for all interactive elements
- Semantic HTML structure
- Focus management for modals and drawers
- Keyboard navigation support

### Color Accessibility
- Minimum contrast ratio of 4.5:1 for normal text
- 3:1 for large text and UI elements
- Color is not the only way to convey information
- High contrast mode support

### Keyboard Navigation
- Tab order follows logical flow
- All interactive elements are keyboard accessible
- Escape key closes modals and drawers
- Arrow keys navigate lists and grids

## Performance Optimization

### Code Splitting
- Route-based code splitting
- Component-level lazy loading
- Dynamic imports for heavy libraries
- Progressive loading for large datasets

### Image Optimization
- WebP format with fallbacks
- Responsive image loading
- Lazy loading for below-fold content
- Optimized SVG icons

### Bundle Size
- Tree shaking for unused code
- Minimized CSS and JavaScript
- Gzip compression
- CDN delivery for assets

This design system provides a comprehensive foundation for building a modern, accessible, and performant TaskMaster UI that aligns with the PRD requirements while maintaining excellent user experience across all devices and use cases.