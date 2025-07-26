import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Header } from '../Header'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from "react-router-dom"

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
    it('renders header with TaskMaster title', () => {
      renderWithRouter(<Header />)
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByText('TaskMaster')).toBeInTheDocument()
    })

    it('renders search bar', () => {
      renderWithRouter(<Header />)
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('renders user info', () => {
      const customUser = {
        name: 'Test User',
        initials: 'TU',
        role: 'Developer'
      }
      renderWithRouter(<Header user={customUser} />)
      
      expect(screen.getByText(customUser.initials)).toBeInTheDocument()
    })

    it('renders notification bell', () => {
      renderWithRouter(<Header />)
      
      expect(screen.getByLabelText('View notifications')).toBeInTheDocument()
    })
  })

  describe('Mobile Menu', () => {
    it('shows mobile menu button on small screens', () => {
      renderWithRouter(<Header />)
      
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
    })

    it('toggles mobile menu', async () => {
      const user = userEvent.setup()
      const onMenuClick = vi.fn()
      
      renderWithRouter(<Header onMenuClick={onMenuClick} />)
      
      const menuButton = screen.getByLabelText('Toggle navigation menu')
      await user.click(menuButton)
      
      expect(onMenuClick).toHaveBeenCalled()
    })
  })

  describe('Search', () => {
    it('renders search bar on desktop', () => {
      renderWithRouter(<Header />)
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('has mobile search toggle button', () => {
      renderWithRouter(<Header />)
      
      expect(screen.getByLabelText('Toggle search')).toBeInTheDocument()
    })
  })

  describe('Notifications', () => {
    it('shows notification bell with badge', () => {
      renderWithRouter(<Header />)
      
      const notificationButton = screen.getByLabelText('View notifications')
      expect(notificationButton).toBeInTheDocument()
      expect(screen.getByLabelText('You have new notifications')).toBeInTheDocument()
    })
  })

  describe('User Menu', () => {
    it('shows user avatar button', () => {
      renderWithRouter(<Header />)
      
      expect(screen.getByLabelText('User menu')).toBeInTheDocument()
    })
  })

  describe('Theme Toggle', () => {
    it('shows theme toggle button on desktop', () => {
      renderWithRouter(<Header />)
      
      expect(screen.getByLabelText('Toggle dark mode')).toBeInTheDocument()
    })
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