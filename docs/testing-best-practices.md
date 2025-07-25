# Testing Best Practices Guide for TaskMaster UI

## Overview

This guide provides comprehensive testing strategies, patterns, and best practices for the TaskMaster UI project. Our testing philosophy emphasizes reliability, maintainability, and developer experience.

## Testing Stack

### Frontend
- **Unit/Integration Testing**: Vitest + React Testing Library
- **Component Testing**: Storybook
- **E2E Testing**: Playwright
- **Coverage**: Vitest Coverage (v8)

### Backend
- **Unit/Integration Testing**: Jest + Supertest
- **API Testing**: Custom test utilities
- **Database Testing**: Prisma test utilities

## Testing Pyramid Strategy

```
         /\
        /E2E\       (10%) - Critical user journeys
       /------\
      /Integra-\    (30%) - Component interactions
     /  tion    \
    /------------\
   /   Unit Tests \  (60%) - Business logic, utilities
  /________________\
```

## Best Practices by Test Type

### 1. Unit Tests

#### Frontend Unit Tests

```typescript
// ✅ Good: Test behavior, not implementation
describe('useDebounce', () => {
  it('returns debounced value after delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )
    
    expect(result.current).toBe('initial')
    
    rerender({ value: 'updated' })
    expect(result.current).toBe('initial') // Still initial
    
    await waitFor(() => {
      expect(result.current).toBe('updated')
    }, { timeout: 600 })
  })
})

// ❌ Bad: Testing implementation details
it('sets timeout and clears it', () => {
  const setTimeoutSpy = vi.spyOn(global, 'setTimeout')
  // Don't test internal implementation
})
```

#### Backend Unit Tests

```typescript
// ✅ Good: Isolated business logic testing
describe('TaskService', () => {
  let taskService: TaskService
  let mockRepository: MockRepository<Task>
  
  beforeEach(() => {
    mockRepository = createMockRepository()
    taskService = new TaskService(mockRepository)
  })
  
  it('calculates task complexity correctly', async () => {
    const task = { 
      subtasks: [{ complexity: 3 }, { complexity: 5 }] 
    }
    
    const complexity = await taskService.calculateComplexity(task)
    expect(complexity).toBe(8)
  })
})
```

### 2. Component Tests

```typescript
// ✅ Good: User-centric testing
describe('TaskCard', () => {
  it('allows user to edit task when clicking edit button', async () => {
    const onEdit = vi.fn()
    const { user } = render(
      <TaskCard task={mockTask} onEdit={onEdit} />
    )
    
    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(mockTask.id)
  })
  
  // ✅ Good: Testing accessibility
  it('has accessible labels for screen readers', () => {
    render(<TaskCard task={mockTask} />)
    
    expect(screen.getByRole('article')).toHaveAccessibleName(mockTask.title)
    expect(screen.getByLabelText(/priority/i)).toHaveTextContent('High')
  })
})
```

### 3. Integration Tests

```typescript
// ✅ Good: Testing feature flows
describe('Task Creation Flow', () => {
  it('creates task and updates board optimistically', async () => {
    const { user } = render(<TaskBoardView />)
    
    // Open creation modal
    await user.click(screen.getByRole('button', { name: /new task/i }))
    
    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'New Task')
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high')
    
    // Submit
    await user.click(screen.getByRole('button', { name: /create/i }))
    
    // Verify optimistic update
    expect(screen.getByText('New Task')).toBeInTheDocument()
    
    // Wait for server response
    await waitFor(() => {
      expect(screen.getByText('New Task')).not.toHaveClass('opacity-50')
    })
  })
})
```

### 4. E2E Tests

```typescript
// ✅ Good: Critical user journey
test('complete task workflow', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  // Navigate to project
  await page.click('text=My Project')
  
  // Create task
  await page.click('button:has-text("New Task")')
  await page.fill('[name="title"]', 'E2E Test Task')
  await page.click('button:has-text("Create")')
  
  // Verify creation
  await expect(page.locator('text=E2E Test Task')).toBeVisible()
  
  // Move to completed
  await page.dragAndDrop(
    'text=E2E Test Task',
    '[data-column="completed"]'
  )
  
  // Verify completion
  await expect(
    page.locator('[data-column="completed"] text=E2E Test Task')
  ).toBeVisible()
})
```

## Test Organization

### File Structure
```
src/
├── components/
│   ├── TaskCard/
│   │   ├── TaskCard.tsx
│   │   ├── TaskCard.test.tsx      # Unit tests
│   │   └── TaskCard.stories.tsx   # Visual tests
│   └── TaskBoard/
│       ├── __tests__/
│       │   ├── TaskBoard.test.tsx
│       │   └── TaskBoard.integration.test.tsx
│       └── TaskBoard.tsx
├── hooks/
│   └── __tests__/
│       └── useDebounce.test.tsx
└── tests/
    ├── integration/
    │   └── task-flow.integration.test.tsx
    └── e2e/
        └── critical-paths.spec.ts
```

### Test Naming Conventions

```typescript
// Unit tests: describe what the unit does
describe('formatDate', () => {
  it('formats ISO date to readable format', () => {})
  it('returns "Invalid date" for invalid input', () => {})
})

// Component tests: describe user interactions
describe('TaskCard', () => {
  it('displays task information to user', () => {})
  it('allows user to mark task as complete', () => {})
})

// Integration tests: describe workflows
describe('Task Management Flow', () => {
  it('user can create, edit, and delete tasks', () => {})
})
```

## Testing Utilities

### Custom Test Utils (test-utils.tsx)

```typescript
// Centralized render with providers
export const render = (ui, options = {}) => {
  return rtlRender(ui, {
    wrapper: AllProviders,
    ...options
  })
}

// Mock data factories
export const createMockTask = (overrides = {}) => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  status: 'pending',
  priority: 'medium',
  ...overrides
})

// Common assertions
export const expectTaskToBeVisible = (task) => {
  expect(screen.getByText(task.title)).toBeInTheDocument()
  expect(screen.getByText(task.description)).toBeInTheDocument()
}
```

## Performance Considerations

### 1. Test Speed Optimization

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // Run tests in parallel
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 2, // Prevent CPU overload
        minThreads: 1,
      }
    },
    // Disable watch in CI
    watch: false,
    // Set reasonable timeouts
    testTimeout: 30000,
  }
})
```

### 2. Mock Heavy Operations

```typescript
// Mock API calls
vi.mock('@/api/client', () => ({
  api: {
    tasks: {
      list: vi.fn().mockResolvedValue({ data: [] }),
      create: vi.fn().mockResolvedValue({ data: mockTask })
    }
  }
}))

// Mock expensive computations
vi.mock('@/utils/complex-calculation', () => ({
  calculate: vi.fn().mockReturnValue(42)
}))
```

## Accessibility Testing

### Automated Checks

```typescript
import { axe } from 'jest-axe'

it('has no accessibility violations', async () => {
  const { container } = render(<TaskBoard />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Keyboard Navigation

```typescript
it('supports keyboard navigation', async () => {
  const { user } = render(<TaskList tasks={tasks} />)
  
  // Tab through elements
  await user.tab()
  expect(screen.getByText('Task 1')).toHaveFocus()
  
  // Use arrow keys
  await user.keyboard('{ArrowDown}')
  expect(screen.getByText('Task 2')).toHaveFocus()
  
  // Activate with Enter
  await user.keyboard('{Enter}')
  expect(screen.getByRole('dialog')).toBeVisible()
})
```

## API Testing

### Backend Integration Tests

```typescript
describe('POST /api/tasks', () => {
  it('creates task with valid data', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Task',
        projectId: project.id
      })
    
    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      title: 'New Task',
      status: 'pending'
    })
    
    // Verify in database
    const task = await prisma.task.findUnique({
      where: { id: response.body.id }
    })
    expect(task).toBeTruthy()
  })
})
```

## Debugging Tests

### 1. Visual Debugging

```typescript
// Use screen.debug() for component state
screen.debug()

// Use prettyDOM for specific elements
import { prettyDOM } from '@testing-library/react'
console.log(prettyDOM(element))

// Use testing-playground
screen.logTestingPlaygroundURL()
```

### 2. Async Debugging

```typescript
// Add custom timeouts for debugging
await waitFor(() => {
  expect(element).toBeVisible()
}, { 
  timeout: 5000,
  onTimeout: (error) => {
    console.log('Current DOM:', screen.debug())
    return error
  }
})
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      node-version: [18.x, 20.x]
  steps:
    - uses: actions/checkout@v3
    - uses: pnpm/action-setup@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Run unit tests
      run: pnpm test
    
    - name: Run E2E tests
      run: pnpm test:e2e
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## Common Pitfalls and Solutions

### 1. Flaky Tests

```typescript
// ❌ Bad: Race conditions
it('updates after API call', () => {
  render(<Component />)
  fireEvent.click(button)
  expect(screen.getByText('Updated')).toBeInTheDocument() // May fail
})

// ✅ Good: Wait for async operations
it('updates after API call', async () => {
  render(<Component />)
  await user.click(button)
  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument()
  })
})
```

### 2. Over-mocking

```typescript
// ❌ Bad: Mocking everything
vi.mock('react-router-dom')
vi.mock('@tanstack/react-query')
vi.mock('every-single-import')

// ✅ Good: Mock only external dependencies
vi.mock('@/api/client') // External API
// Use real router, real query client with test config
```

### 3. Testing Implementation

```typescript
// ❌ Bad: Testing state changes
it('sets isLoading to true', () => {
  expect(component.state.isLoading).toBe(true)
})

// ✅ Good: Testing user experience
it('shows loading spinner while fetching data', () => {
  render(<Component />)
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

## Testing Checklist

Before committing:

- [ ] All tests pass locally (`pnpm test`)
- [ ] No `.only` or `.skip` left in tests
- [ ] Coverage thresholds met (80% minimum)
- [ ] E2E tests pass for critical paths
- [ ] No console errors or warnings
- [ ] Accessibility tests pass
- [ ] Performance benchmarks met

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)