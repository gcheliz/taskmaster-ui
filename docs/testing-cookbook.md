# Testing Cookbook for TaskMaster UI

## Quick Reference Testing Recipes

### 🧪 Component Testing Recipes

#### Recipe 1: Testing a Form Component

```typescript
// TaskForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { TaskForm } from './TaskForm'

describe('TaskForm', () => {
  const mockOnSubmit = vi.fn()
  
  it('validates required fields', async () => {
    const { user } = render(<TaskForm onSubmit={mockOnSubmit} />)
    
    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    // Check validation messages
    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
  
  it('submits with valid data', async () => {
    const { user } = render(<TaskForm onSubmit={mockOnSubmit} />)
    
    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'New Task')
    await user.type(screen.getByLabelText(/description/i), 'Task description')
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high')
    
    // Submit
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        priority: 'high'
      })
    })
  })
})
```

#### Recipe 2: Testing Drag and Drop

```typescript
// DraggableTaskBoard.test.tsx
import { DndContext } from '@dnd-kit/core'
import { render, screen, fireEvent } from '@/test-utils'

describe('Draggable Task Board', () => {
  it('moves task between columns', async () => {
    const onTaskMove = vi.fn()
    
    render(
      <DndContext onDragEnd={onTaskMove}>
        <TaskBoard tasks={mockTasks} />
      </DndContext>
    )
    
    const task = screen.getByText('Task 1')
    const targetColumn = screen.getByTestId('column-completed')
    
    // Simulate drag and drop
    fireEvent.dragStart(task)
    fireEvent.dragEnter(targetColumn)
    fireEvent.dragOver(targetColumn)
    fireEvent.drop(targetColumn)
    fireEvent.dragEnd(task)
    
    expect(onTaskMove).toHaveBeenCalledWith(
      expect.objectContaining({
        active: expect.objectContaining({ id: 'task-1' }),
        over: expect.objectContaining({ id: 'column-completed' })
      })
    )
  })
})
```

#### Recipe 3: Testing Modal Dialogs

```typescript
// Modal.test.tsx
describe('Modal Component', () => {
  it('traps focus within modal', async () => {
    const { user } = render(
      <Modal isOpen onClose={vi.fn()}>
        <input data-testid="first" />
        <button>Action</button>
        <input data-testid="last" />
      </Modal>
    )
    
    // Focus should be on first element
    expect(screen.getByTestId('first')).toHaveFocus()
    
    // Tab through elements
    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()
    
    await user.tab()
    expect(screen.getByTestId('last')).toHaveFocus()
    
    // Should cycle back to first
    await user.tab()
    expect(screen.getByTestId('first')).toHaveFocus()
  })
  
  it('closes on Escape key', async () => {
    const onClose = vi.fn()
    const { user } = render(
      <Modal isOpen onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    )
    
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
```

### 🔄 Async Testing Recipes

#### Recipe 4: Testing API Calls

```typescript
// useTaskData.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useTaskData } from './useTaskData'

// Mock the API module
vi.mock('@/api/tasks', () => ({
  fetchTasks: vi.fn()
}))

describe('useTaskData', () => {
  it('fetches and returns tasks', async () => {
    const mockTasks = [{ id: 1, title: 'Task 1' }]
    fetchTasks.mockResolvedValueOnce(mockTasks)
    
    const { result } = renderHook(() => useTaskData(), {
      wrapper: QueryClientWrapper
    })
    
    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
    
    // Wait for data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.data).toEqual(mockTasks)
  })
  
  it('handles errors gracefully', async () => {
    fetchTasks.mockRejectedValueOnce(new Error('Network error'))
    
    const { result } = renderHook(() => useTaskData())
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    
    expect(result.current.error.message).toBe('Network error')
  })
})
```

#### Recipe 5: Testing Optimistic Updates

```typescript
// OptimisticTaskUpdate.test.tsx
describe('Optimistic Task Updates', () => {
  it('shows optimistic update immediately', async () => {
    const { user } = render(<TaskBoard />)
    
    // Mock slow API
    updateTask.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ id: 1, title: 'Updated' }), 1000)
    ))
    
    const task = screen.getByText('Original Title')
    await user.click(task)
    
    // Edit title
    await user.clear(screen.getByLabelText(/title/i))
    await user.type(screen.getByLabelText(/title/i), 'Updated Title')
    await user.click(screen.getByText('Save'))
    
    // Should show update immediately (with loading state)
    expect(screen.getByText('Updated Title')).toBeInTheDocument()
    expect(screen.getByText('Updated Title').parentElement).toHaveClass('opacity-70')
    
    // Wait for server confirmation
    await waitFor(() => {
      expect(screen.getByText('Updated Title').parentElement).not.toHaveClass('opacity-70')
    })
  })
})
```

### 🎯 E2E Testing Recipes

#### Recipe 6: Authentication Flow

```typescript
// auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('complete login flow', async ({ page }) => {
    await page.goto('/login')
    
    // Fill login form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Wait for redirect
    await page.waitForURL('/dashboard')
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('test@example.com')
  })
  
  test('persists session across refresh', async ({ page }) => {
    // Login first
    await loginUser(page)
    
    // Refresh page
    await page.reload()
    
    // Should still be logged in
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })
})
```

#### Recipe 7: File Upload Testing

```typescript
// fileUpload.spec.ts
test('uploads file successfully', async ({ page }) => {
  await page.goto('/upload')
  
  // Select file
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('test-files/document.pdf')
  
  // Verify preview
  await expect(page.locator('[data-testid="file-preview"]')).toContainText('document.pdf')
  
  // Upload
  await page.click('button:has-text("Upload")')
  
  // Wait for success
  await expect(page.locator('[role="alert"]')).toContainText('Upload successful')
})
```

### 🛡️ Error Handling Recipes

#### Recipe 8: Testing Error Boundaries

```typescript
// ErrorBoundary.test.tsx
import { ErrorBoundary } from './ErrorBoundary'

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  it('catches errors and displays fallback', () => {
    const onError = vi.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    )
  })
  
  it('recovers when error is resolved', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    
    // Fix the error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})
```

### 🔍 Debugging Recipes

#### Recipe 9: Debug Helper Functions

```typescript
// test-helpers.ts
export const debugHelpers = {
  // Print component tree
  logComponentTree: (container: HTMLElement) => {
    console.log(prettyDOM(container, Infinity))
  },
  
  // Wait and log
  waitAndLog: async (callback: () => void, message: string) => {
    console.log(`Waiting for: ${message}`)
    await waitFor(callback, {
      onTimeout: () => {
        console.log('Timeout! Current DOM:')
        screen.debug()
      }
    })
  },
  
  // Log all queries
  logQueries: () => {
    const queries = screen.getAllByText(/.*/);
    queries.forEach(el => console.log(el.textContent))
  },
  
  // Take screenshot (Playwright)
  screenshot: async (page: Page, name: string) => {
    await page.screenshot({ 
      path: `debug-screenshots/${name}.png`,
      fullPage: true 
    })
  }
}
```

#### Recipe 10: Performance Testing

```typescript
// performance.test.tsx
describe('Performance Tests', () => {
  it('renders large list efficiently', async () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }))
    
    const start = performance.now()
    render(<VirtualizedList items={items} />)
    const renderTime = performance.now() - start
    
    expect(renderTime).toBeLessThan(100) // Should render in under 100ms
    
    // Check only visible items are rendered
    const renderedItems = screen.getAllByRole('listitem')
    expect(renderedItems.length).toBeLessThan(50) // Only ~50 visible
  })
})
```

### 🎨 Visual Testing Recipes

#### Recipe 11: Snapshot Testing

```typescript
// Component.test.tsx
describe('Visual Snapshots', () => {
  it('matches visual snapshot', () => {
    const { container } = render(<TaskCard task={mockTask} />)
    expect(container.firstChild).toMatchSnapshot()
  })
  
  it('matches snapshot in different states', () => {
    const { container, rerender } = render(
      <TaskCard task={mockTask} isSelected={false} />
    )
    
    expect(container.firstChild).toMatchSnapshot('default')
    
    rerender(<TaskCard task={mockTask} isSelected={true} />)
    expect(container.firstChild).toMatchSnapshot('selected')
  })
})
```

### 🔐 Security Testing Recipes

#### Recipe 12: XSS Prevention Testing

```typescript
// Security.test.tsx
describe('XSS Prevention', () => {
  it('sanitizes user input', async () => {
    const { user } = render(<CommentForm />)
    
    const maliciousInput = '<script>alert("XSS")</script>'
    await user.type(screen.getByLabelText(/comment/i), maliciousInput)
    await user.click(screen.getByText('Submit'))
    
    // Should not execute script
    expect(screen.queryByText('alert')).not.toBeInTheDocument()
    
    // Should display as text
    const comment = screen.getByTestId('comment-text')
    expect(comment.innerHTML).not.toContain('<script>')
    expect(comment.textContent).toContain('<script>alert("XSS")</script>')
  })
})
```

## Test Data Management

### Recipe 13: Test Data Builders

```typescript
// test-builders.ts
class TaskBuilder {
  private task: Partial<Task> = {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(),
  }
  
  withTitle(title: string) {
    this.task.title = title
    return this
  }
  
  withHighPriority() {
    this.task.priority = 'high'
    return this
  }
  
  asCompleted() {
    this.task.status = 'completed'
    this.task.completedAt = new Date()
    return this
  }
  
  build(): Task {
    return this.task as Task
  }
}

// Usage
const urgentTask = new TaskBuilder()
  .withTitle('Fix critical bug')
  .withHighPriority()
  .build()
```

## Common Testing Patterns

### Recipe 14: Testing Custom Hooks

```typescript
// useCounter.test.tsx
describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter(0))
    
    expect(result.current.count).toBe(0)
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
})
```

### Recipe 15: Testing Context Providers

```typescript
// ThemeContext.test.tsx
describe('ThemeContext', () => {
  it('toggles theme', async () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme()
      return (
        <div>
          <span>{theme}</span>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      )
    }
    
    const { user } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByText('light')).toBeInTheDocument()
    
    await user.click(screen.getByText('Toggle'))
    
    expect(screen.getByText('dark')).toBeInTheDocument()
  })
})
```

## Quick Commands

```bash
# Run specific test file
pnpm test TaskCard.test.tsx

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Debug single test
pnpm test -t "should create task" --no-coverage

# Run tests matching pattern
pnpm test --grep "auth"

# Update snapshots
pnpm test -u
```

## Testing Checklist Template

```markdown
## Component: [Component Name]

### Unit Tests
- [ ] Renders with default props
- [ ] Renders with all prop variations
- [ ] Handles user interactions
- [ ] Validates input/props
- [ ] Handles edge cases
- [ ] Handles errors gracefully

### Integration Tests
- [ ] Works with real API calls
- [ ] Integrates with routing
- [ ] State management works correctly
- [ ] Side effects are tested

### Accessibility Tests
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast passes
- [ ] Focus management correct

### Visual Tests
- [ ] Snapshot tests pass
- [ ] Responsive design works
- [ ] Dark mode supported
- [ ] Loading states shown
- [ ] Error states displayed
```

Remember: Good tests are living documentation that help future developers understand your code!