# Testing Guide for TaskMaster UI

## Overview

This guide provides comprehensive documentation for testing in the TaskMaster UI frontend application. We use Vitest as our test runner with React Testing Library for component testing.

## Table of Contents

1. [Testing Setup](#testing-setup)
2. [Running Tests](#running-tests)
3. [Writing Tests](#writing-tests)
4. [Testing Utilities](#testing-utilities)
5. [Testing Patterns](#testing-patterns)
6. [Code Coverage](#code-coverage)
7. [Best Practices](#best-practices)

## Testing Setup

### Test Stack

- **Vitest**: Fast unit test framework with native ESM support
- **React Testing Library**: Testing utilities for React components
- **@testing-library/user-event**: Simulating user interactions
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **jest-axe**: Accessibility testing
- **jsdom**: DOM implementation for Node.js

### Configuration

The testing configuration is defined in `vitest.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
```

## Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test TaskCard.test.tsx

# Run tests matching pattern
pnpm test --grep "should render"
```

### CI/CD Integration

Tests are automatically run in the CI pipeline. The build will fail if:
- Any test fails
- Code coverage falls below 80%
- TypeScript errors are detected

## Writing Tests

### Test File Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import { ComponentName } from '../ComponentName'

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Component Testing

```typescript
// Basic component test
it('renders component with props', () => {
  render(<Button variant="primary">Click me</Button>)
  
  const button = screen.getByRole('button', { name: /click me/i })
  expect(button).toHaveClass('btn-primary')
})

// User interaction test
it('handles click events', async () => {
  const handleClick = vi.fn()
  const { user } = render(<Button onClick={handleClick}>Click</Button>)
  
  await user.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledOnce()
})

// Async behavior test
it('loads data on mount', async () => {
  render(<DataComponent />)
  
  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
  
  expect(screen.getByText('Data loaded')).toBeInTheDocument()
})
```

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react'

it('updates state correctly', () => {
  const { result } = renderHook(() => useCounter())
  
  expect(result.current.count).toBe(0)
  
  act(() => {
    result.current.increment()
  })
  
  expect(result.current.count).toBe(1)
})
```

## Testing Utilities

### Custom Render Function

The custom render function in `test-utils.tsx` wraps components with all necessary providers:

```typescript
import { render } from '@/test-utils'

// Automatically wrapped with providers
const { user } = render(<Component />)

// With custom initial route
render(<Component />, { initialRoute: '/tasks' })
```

### Mock Data Factories

```typescript
import { createMockTask, createMockRepository } from '@/test-utils'

const task = createMockTask({ 
  title: 'Custom Task',
  priority: 'high' 
})

const repository = createMockRepository({ 
  name: 'test-repo' 
})
```

### Common Mocks

```typescript
import { setupCommonMocks, cleanupMocks } from '@/test-utils'

beforeEach(() => {
  setupCommonMocks() // Sets up IntersectionObserver, matchMedia, etc.
})

afterEach(() => {
  cleanupMocks()
})
```

## Testing Patterns

### 1. Testing User Flows

```typescript
describe('Task Creation Flow', () => {
  it('allows user to create a new task', async () => {
    const { user } = render(<TaskBoard />)
    
    // Open create modal
    await user.click(screen.getByRole('button', { name: /add task/i }))
    
    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'New Task')
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high')
    
    // Submit
    await user.click(screen.getByRole('button', { name: /create/i }))
    
    // Verify task appears
    expect(screen.getByText('New Task')).toBeInTheDocument()
  })
})
```

### 2. Testing Accessibility

```typescript
import { axe } from 'jest-axe'

it('has no accessibility violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### 3. Testing Responsive Behavior

```typescript
import { mockMatchMedia } from '@/test-utils'

it('shows mobile menu on small screens', () => {
  mockMatchMedia(true) // Simulate mobile viewport
  render(<Navigation />)
  
  expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
})
```

### 4. Testing Error States

```typescript
it('displays error message on failed submission', async () => {
  const mockError = new Error('Submission failed')
  mockSubmitApi.mockRejectedValueOnce(mockError)
  
  const { user } = render(<Form />)
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('Submission failed')
  })
})
```

### 5. Testing Loading States

```typescript
it('shows loading skeleton while fetching data', () => {
  render(<DataList />)
  
  // Check loading state
  expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument()
  
  // Wait for data
  await waitFor(() => {
    expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument()
  })
})
```

## Code Coverage

### Viewing Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Requirements

- Global coverage threshold: 80%
- Per-file coverage: Aim for >90% for critical components
- Exclude files: Test files, stories, type definitions

### Improving Coverage

1. Test all component states (default, hover, active, disabled)
2. Test error boundaries and edge cases
3. Test conditional rendering
4. Test event handlers
5. Test custom hooks

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad - Testing implementation details
expect(component.state.isOpen).toBe(true)

// ✅ Good - Testing user-visible behavior
expect(screen.getByRole('dialog')).toBeInTheDocument()
```

### 2. Use Semantic Queries

```typescript
// Priority order for queries:
// 1. getByRole
screen.getByRole('button', { name: /submit/i })

// 2. getByLabelText
screen.getByLabelText(/email address/i)

// 3. getByPlaceholderText
screen.getByPlaceholderText(/search/i)

// 4. getByText
screen.getByText(/welcome/i)

// 5. getByTestId (last resort)
screen.getByTestId('custom-element')
```

### 3. Avoid Common Pitfalls

```typescript
// ❌ Using waitFor incorrectly
await waitFor(() => {
  fireEvent.click(button) // Don't fire events inside waitFor
})

// ✅ Correct usage
fireEvent.click(button)
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument()
})

// ❌ Not handling async updates
test('updates state', () => {
  render(<Component />)
  fireEvent.click(button)
  expect(screen.getByText('Updated')).toBeInTheDocument() // May fail
})

// ✅ Properly waiting for updates
test('updates state', async () => {
  const { user } = render(<Component />)
  await user.click(button)
  expect(screen.getByText('Updated')).toBeInTheDocument()
})
```

### 4. Group Related Tests

```typescript
describe('TaskCard', () => {
  describe('rendering', () => {
    it('displays task title', () => {})
    it('displays priority badge', () => {})
  })
  
  describe('interactions', () => {
    it('handles click events', () => {})
    it('supports drag and drop', () => {})
  })
  
  describe('accessibility', () => {
    it('has proper ARIA labels', () => {})
    it('supports keyboard navigation', () => {})
  })
})
```

### 5. Keep Tests Focused

- One assertion per test (when possible)
- Test one behavior at a time
- Use descriptive test names
- Keep tests independent

## Debugging Tests

### Debug Output

```typescript
// Print the current DOM
screen.debug()

// Print specific element
screen.debug(screen.getByRole('button'))

// Use testing playground
screen.logTestingPlaygroundURL()
```

### Common Issues

1. **Act warnings**: Wrap state updates in `act()` or use `user-event`
2. **Cannot find element**: Check if element is rendered conditionally
3. **Timeout errors**: Increase timeout or check async logic
4. **Memory leaks**: Clean up subscriptions and timers

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Common Testing Scenarios](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)