import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { DndContext } from '@dnd-kit/core'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { RepositoryProvider } from './contexts/RepositoryContext'
import { FocusProvider } from './contexts/FocusContext'
import userEvent from '@testing-library/user-event'

// Create a custom render function that includes all providers
interface AllProvidersProps {
  children: React.ReactNode
  initialRoute?: string
}

// Mock providers with minimal implementation
const AllProviders: React.FC<AllProvidersProps> = ({ children, initialRoute = '/' }) => {
  // Create a new QueryClient for each test to ensure isolation
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: 0, // Disable caching in tests
      },
    },
  })

  // Mock window.history.pushState for router
  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <FocusProvider>
            <NotificationProvider>
              <RepositoryProvider>
                <DndContext>
                  {children}
                </DndContext>
              </RepositoryProvider>
            </NotificationProvider>
          </FocusProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string
}

// Custom render function that wraps components with all providers
const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult & { user: ReturnType<typeof userEvent.setup> } => {
  const { initialRoute, ...renderOptions } = options || {}
  
  const user = userEvent.setup()
  
  const rendered = render(ui, {
    wrapper: ({ children }) => <AllProviders initialRoute={initialRoute}>{children}</AllProviders>,
    ...renderOptions,
  })

  return {
    ...rendered,
    user,
  }
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render, userEvent }

// Common test data factories
export const createMockTask = (overrides = {}) => ({
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  priority: 'medium' as const,
  complexity: 3,
  assignee: {
    name: 'John Doe',
    initials: 'JD',
    color: 'bg-blue-500',
  },
  column: 'todo',
  position: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockRepository = (overrides = {}) => ({
  id: 'repo-1',
  name: 'test-repo',
  path: '/path/to/repo',
  status: 'active',
  isGitRepository: true,
  isTaskMasterProject: true,
  gitBranch: 'main',
  lastUpdated: new Date().toISOString(),
  connectedAt: new Date().toISOString(),
  stats: {
    commits: 100,
    contributors: 5,
    branches: 3,
    openPRs: 2,
    health: 85,
  },
  ...overrides,
})

// Mock handlers for common interactions
export const mockHandlers = {
  onTaskUpdate: vi.fn(),
  onTaskDelete: vi.fn(),
  onTaskCreate: vi.fn(),
  onRepositoryConnect: vi.fn(),
  onRepositoryDisconnect: vi.fn(),
}

// Utility functions for testing
export const waitForLoadingToFinish = async () => {
  const { waitFor, screen } = await import('@testing-library/react')
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
}

// Mock IntersectionObserver for scroll animations
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.IntersectionObserver = mockIntersectionObserver as any
}

// Mock matchMedia for responsive tests
export const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Setup common mocks
export const setupCommonMocks = () => {
  mockIntersectionObserver()
  mockMatchMedia(false) // Default to desktop view
  
  // Mock window.scrollTo
  window.scrollTo = vi.fn()
  
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
}

// Clean up mocks after tests
export const cleanupMocks = () => {
  vi.clearAllMocks()
  vi.resetModules()
}