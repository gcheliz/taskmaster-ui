import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Header } from '../Header'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Header', () => {
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
    it('renders header with title', () => {
      renderWithRouter(<Header title="Dashboard" />)
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('renders breadcrumbs', () => {
      const breadcrumbs = [
        { label: 'Home', path: '/' },
        { label: 'Tasks', path: '/tasks' },
        { label: 'Task Details' }
      ]
      
      renderWithRouter(<Header breadcrumbs={breadcrumbs} />)
      
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      expect(screen.getByText('Task Details')).toBeInTheDocument()
    })

    it('renders user info', () => {
      renderWithRouter(<Header user={mockUser} />)
      
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
      expect(screen.getByAltText(`${mockUser.name} avatar`)).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      const actions = [
        { label: 'Create', onClick: vi.fn() },
        { label: 'Export', onClick: vi.fn() }
      ]
      
      renderWithRouter(<Header actions={actions} />)
      
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    })
  })

  describe('Mobile Menu', () => {
    it('shows mobile menu button on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      renderWithRouter(<Header showMobileMenu />)
      
      expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
    })

    it('toggles mobile menu', async () => {
      const user = userEvent.setup()
      const onMobileMenuToggle = vi.fn()
      
      renderWithRouter(
        <Header showMobileMenu onMobileMenuToggle={onMobileMenuToggle} />
      )
      
      const menuButton = screen.getByRole('button', { name: /menu/i })
      await user.click(menuButton)
      
      expect(onMobileMenuToggle).toHaveBeenCalled()
    })
  })

  describe('Search', () => {
    it('renders search bar', () => {
      renderWithRouter(<Header showSearch />)
      
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    })

    it('handles search input', async () => {
      const user = userEvent.setup()
      const onSearch = vi.fn()
      
      renderWithRouter(<Header showSearch onSearch={onSearch} />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      await user.type(searchInput, 'test query')
      
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('test query')
      })
    })

    it('shows search suggestions', async () => {
      const user = userEvent.setup()
      const suggestions = ['Task 1', 'Task 2', 'Repository A']
      
      renderWithRouter(
        <Header showSearch searchSuggestions={suggestions} />
      )
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      await user.click(searchInput)
      
      await waitFor(() => {
        suggestions.forEach(suggestion => {
          expect(screen.getByText(suggestion)).toBeInTheDocument()
        })
      })
    })

    it('clears search on escape', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Header showSearch />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      await user.type(searchInput, 'test')
      expect(searchInput).toHaveValue('test')
      
      await user.keyboard('{Escape}')
      expect(searchInput).toHaveValue('')
    })
  })

  describe('Notifications', () => {
    it('shows notification icon with count', () => {
      renderWithRouter(<Header notificationCount={5} />)
      
      const notificationButton = screen.getByRole('button', { name: /notifications/i })
      expect(notificationButton).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('opens notification dropdown', async () => {
      const user = userEvent.setup()
      const notifications = [
        { id: '1', title: 'New task assigned', time: '5 min ago' },
        { id: '2', title: 'Build completed', time: '10 min ago' }
      ]
      
      renderWithRouter(<Header notifications={notifications} />)
      
      const notificationButton = screen.getByRole('button', { name: /notifications/i })
      await user.click(notificationButton)
      
      await waitFor(() => {
        expect(screen.getByText('New task assigned')).toBeInTheDocument()
        expect(screen.getByText('Build completed')).toBeInTheDocument()
      })
    })

    it('marks notification as read', async () => {
      const user = userEvent.setup()
      const onMarkAsRead = vi.fn()
      const notifications = [
        { id: '1', title: 'New task', time: '5 min ago', unread: true }
      ]
      
      renderWithRouter(
        <Header notifications={notifications} onMarkAsRead={onMarkAsRead} />
      )
      
      const notificationButton = screen.getByRole('button', { name: /notifications/i })
      await user.click(notificationButton)
      
      const markReadButton = await screen.findByRole('button', { name: /mark as read/i })
      await user.click(markReadButton)
      
      expect(onMarkAsRead).toHaveBeenCalledWith('1')
    })
  })

  describe('User Menu', () => {
    it('opens user dropdown', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Header user={mockUser} />)
      
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
      
      renderWithRouter(<Header user={mockUser} onSignOut={onSignOut} />)
      
      const userButton = screen.getByRole('button', { name: new RegExp(mockUser.name) })
      await user.click(userButton)
      
      const signOutButton = await screen.findByText('Sign Out')
      await user.click(signOutButton)
      
      expect(onSignOut).toHaveBeenCalled()
    })

    it('navigates to settings', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Header user={mockUser} />)
      
      const userButton = screen.getByRole('button', { name: new RegExp(mockUser.name) })
      await user.click(userButton)
      
      const settingsLink = await screen.findByText('Settings')
      await user.click(settingsLink)
      
      expect(window.location.pathname).toBe('/settings')
    })
  })

  describe('Theme Toggle', () => {
    it('shows theme toggle button', () => {
      renderWithRouter(<Header showThemeToggle theme="light" />)
      
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
    })

    it('toggles between light and dark theme', async () => {
      const user = userEvent.setup()
      const onThemeToggle = vi.fn()
      
      renderWithRouter(
        <Header showThemeToggle theme="light" onThemeToggle={onThemeToggle} />
      )
      
      const themeButton = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(themeButton)
      
      expect(onThemeToggle).toHaveBeenCalledWith('dark')
    })

    it('shows correct theme icon', () => {
      const { rerender } = renderWithRouter(
        <Header showThemeToggle theme="light" />
      )
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      
      rerender(<Header showThemeToggle theme="dark" />)
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })
  })

  describe('Sticky Behavior', () => {
    it('applies sticky classes when specified', () => {
      renderWithRouter(<Header sticky />)
      
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('sticky', 'top-0', 'z-50')
    })

    it('adds shadow on scroll', async () => {
      renderWithRouter(<Header sticky />)
      
      const header = screen.getByRole('banner')
      expect(header).not.toHaveClass('shadow-md')
      
      // Simulate scroll
      window.scrollY = 100
      window.dispatchEvent(new Event('scroll'))
      
      await waitFor(() => {
        expect(header).toHaveClass('shadow-md')
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading indicator', () => {
      renderWithRouter(<Header isLoading />)
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('shows loading text', () => {
      renderWithRouter(<Header isLoading loadingText="Saving changes..." />)
      
      expect(screen.getByText('Saving changes...')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithRouter(<Header title="Dashboard" />)
      
      expect(screen.getByRole('banner')).toHaveAttribute('aria-label', 'Page header')
    })

    it('announces page title changes', () => {
      const { rerender } = renderWithRouter(<Header title="Dashboard" />)
      
      expect(document.title).toContain('Dashboard')
      
      rerender(<Header title="Tasks" />)
      
      expect(document.title).toContain('Tasks')
    })

    it('supports keyboard navigation in dropdowns', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Header user={mockUser} />)
      
      const userButton = screen.getByRole('button', { name: new RegExp(mockUser.name) })
      await user.click(userButton)
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}')
      expect(screen.getByText('Profile')).toHaveFocus()
      
      await user.keyboard('{ArrowDown}')
      expect(screen.getByText('Settings')).toHaveFocus()
      
      await user.keyboard('{ArrowUp}')
      expect(screen.getByText('Profile')).toHaveFocus()
    })

    it('closes dropdowns on Escape', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Header user={mockUser} />)
      
      const userButton = screen.getByRole('button', { name: new RegExp(mockUser.name) })
      await user.click(userButton)
      
      expect(screen.getByText('Profile')).toBeInTheDocument()
      
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByText('Profile')).not.toBeInTheDocument()
      })
    })
  })

  describe('Responsive Design', () => {
    it('hides certain elements on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      renderWithRouter(
        <Header 
          title="Dashboard" 
          breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
        />
      )
      
      // Breadcrumbs hidden on mobile
      expect(screen.queryByRole('navigation', { name: /breadcrumb/i })).not.toBeInTheDocument()
      
      // Title remains visible
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('shows compact user menu on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      renderWithRouter(<Header user={mockUser} />)
      
      // Only avatar visible, no name
      expect(screen.getByAltText(`${mockUser.name} avatar`)).toBeInTheDocument()
      expect(screen.queryByText(mockUser.name)).not.toBeInTheDocument()
    })
  })
})