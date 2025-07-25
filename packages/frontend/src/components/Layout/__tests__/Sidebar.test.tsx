import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Sidebar } from '../Sidebar'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Sidebar', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders logo and brand', () => {
      renderWithProviders(<Sidebar />)
      
      expect(screen.getByAltText('TaskMaster Logo')).toBeInTheDocument()
      expect(screen.getByText('TaskMaster')).toBeInTheDocument()
    })

    it('renders navigation menu', () => {
      renderWithProviders(<Sidebar />)
      
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      expect(screen.getByText('Repositories')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })

    it('renders user profile section when user is provided', () => {
      renderWithProviders(<Sidebar user={mockUser} />)
      
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
      expect(screen.getByText(mockUser.email)).toBeInTheDocument()
      expect(screen.getByAltText(`${mockUser.name} avatar`)).toBeInTheDocument()
    })

    it('renders collapsed state', () => {
      renderWithProviders(<Sidebar isCollapsed />)
      
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('w-16')
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('highlights active route', () => {
      renderWithProviders(<Sidebar />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('bg-blue-50')
    })

    it('navigates to different routes', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Sidebar />)
      
      const tasksLink = screen.getByRole('link', { name: /tasks/i })
      await user.click(tasksLink)
      
      expect(window.location.pathname).toBe('/tasks')
    })

    it('shows navigation icons in collapsed state', () => {
      renderWithProviders(<Sidebar isCollapsed />)
      
      expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument()
      expect(screen.getByTestId('tasks-icon')).toBeInTheDocument()
      expect(screen.getByTestId('repositories-icon')).toBeInTheDocument()
    })
  })

  describe('Collapse/Expand', () => {
    it('toggles collapse state', async () => {
      const user = userEvent.setup()
      const onToggle = vi.fn()
      renderWithProviders(<Sidebar onToggleCollapse={onToggle} />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })
      await user.click(toggleButton)
      
      expect(onToggle).toHaveBeenCalled()
    })

    it('shows tooltip on collapsed items', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Sidebar isCollapsed />)
      
      const dashboardIcon = screen.getByTestId('dashboard-icon')
      await user.hover(dashboardIcon)
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip', { name: 'Dashboard' })).toBeInTheDocument()
      })
    })
  })

  describe('User Menu', () => {
    it('opens user dropdown on click', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Sidebar user={mockUser} />)
      
      const userButton = screen.getByRole('button', { name: new RegExp(mockUser.name) })
      await user.click(userButton)
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(screen.getByText('Sign Out')).toBeInTheDocument()
      })
    })

    it('handles sign out', async () => {
      const user = userEvent.setup()
      const onSignOut = vi.fn()
      renderWithProviders(<Sidebar user={mockUser} onSignOut={onSignOut} />)
      
      const userButton = screen.getByRole('button', { name: new RegExp(mockUser.name) })
      await user.click(userButton)
      
      const signOutButton = await screen.findByText('Sign Out')
      await user.click(signOutButton)
      
      expect(onSignOut).toHaveBeenCalled()
    })

    it('navigates to profile', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Sidebar user={mockUser} />)
      
      const userButton = screen.getByRole('button', { name: new RegExp(mockUser.name) })
      await user.click(userButton)
      
      const profileLink = await screen.findByText('Profile')
      await user.click(profileLink)
      
      expect(window.location.pathname).toBe('/profile')
    })
  })

  describe('Notifications', () => {
    it('shows notification badge with count', () => {
      renderWithProviders(<Sidebar notificationCount={5} />)
      
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
    })

    it('opens notification panel', async () => {
      const user = userEvent.setup()
      const onNotificationClick = vi.fn()
      renderWithProviders(
        <Sidebar notificationCount={3} onNotificationClick={onNotificationClick} />
      )
      
      const notificationButton = screen.getByRole('button', { name: /notifications/i })
      await user.click(notificationButton)
      
      expect(onNotificationClick).toHaveBeenCalled()
    })

    it('shows no badge when count is 0', () => {
      renderWithProviders(<Sidebar notificationCount={0} />)
      
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })
  })

  describe('Search', () => {
    it('renders search input', () => {
      renderWithProviders(<Sidebar showSearch />)
      
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    })

    it('handles search input', async () => {
      const user = userEvent.setup()
      const onSearch = vi.fn()
      renderWithProviders(<Sidebar showSearch onSearch={onSearch} />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      await user.type(searchInput, 'test query')
      
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('test query')
      })
    })

    it('shows search shortcut', () => {
      renderWithProviders(<Sidebar showSearch />)
      
      expect(screen.getByText('⌘K')).toBeInTheDocument()
    })

    it('focuses search on shortcut', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Sidebar showSearch />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      
      // Simulate Cmd+K
      await user.keyboard('{Meta>}k{/Meta}')
      
      expect(searchInput).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithProviders(<Sidebar />)
      
      expect(screen.getByRole('complementary')).toHaveAttribute('aria-label', 'Main sidebar')
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation')
    })

    it('announces collapse state', () => {
      const { rerender } = renderWithProviders(<Sidebar />)
      
      expect(screen.getByRole('complementary')).toHaveAttribute('aria-expanded', 'true')
      
      rerender(<Sidebar isCollapsed />)
      
      expect(screen.getByRole('complementary')).toHaveAttribute('aria-expanded', 'false')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Sidebar />)
      
      // Tab through navigation items
      await user.tab()
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('link', { name: /tasks/i })).toHaveFocus()
      
      // Arrow key navigation
      await user.keyboard('{ArrowDown}')
      expect(screen.getByRole('link', { name: /repositories/i })).toHaveFocus()
    })

    it('traps focus in user menu', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Sidebar user={mockUser} />)
      
      const userButton = screen.getByRole('button', { name: new RegExp(mockUser.name) })
      await user.click(userButton)
      
      const menu = await screen.findByRole('menu')
      expect(menu).toBeInTheDocument()
      
      // Focus should be trapped in menu
      await user.tab()
      expect(screen.getByText('Profile')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByText('Settings')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByText('Sign Out')).toHaveFocus()
      
      // Should wrap back to first item
      await user.tab()
      expect(screen.getByText('Profile')).toHaveFocus()
    })
  })

  describe('Responsive Behavior', () => {
    it('auto-collapses on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      renderWithProviders(<Sidebar />)
      
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('hidden', 'md:flex')
    })

    it('shows mobile menu button', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      renderWithProviders(<Sidebar />)
      
      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
    })
  })

  describe('Theme Support', () => {
    it('applies dark theme classes', () => {
      renderWithProviders(<Sidebar theme="dark" />)
      
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('bg-gray-900', 'text-white')
    })

    it('applies light theme classes', () => {
      renderWithProviders(<Sidebar theme="light" />)
      
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('bg-white', 'text-gray-900')
    })
  })
})