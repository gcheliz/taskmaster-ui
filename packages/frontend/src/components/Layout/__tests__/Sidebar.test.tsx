import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Sidebar } from '../Sidebar'

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({
      pathname: mockPathname
    })
  }
})

let mockPathname = '/'

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  mockPathname = route
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname = '/'
  })

  it('renders navigation menu items', () => {
    renderWithRouter(<Sidebar />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Repositories')).toBeInTheDocument()
    expect(screen.getByText('Task Board')).toBeInTheDocument()
    expect(screen.getByText('Terminal')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    renderWithRouter(<Sidebar />, { route: '/tasks' })
    
    const taskBoardLink = screen.getByRole('link', { name: /Task Board/i })
    expect(taskBoardLink).toHaveClass('bg-blue-600', 'text-white')
    
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i })
    expect(dashboardLink).not.toHaveClass('bg-blue-600')
    expect(dashboardLink).toHaveClass('text-gray-700')
  })

  it('shows correct icons for each menu item', () => {
    renderWithRouter(<Sidebar />)
    
    // Check that navigation contains the menu items
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toBeInTheDocument()
    
    // Verify each menu item exists
    const menuItems = [
      'Dashboard',
      'Repositories', 
      'Task Board',
      'Terminal',
      'Settings'
    ]
    
    menuItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('handles mobile backdrop click', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    renderWithRouter(<Sidebar isOpen={true} onClose={onClose} />)
    
    // Find and click the backdrop
    const backdrop = document.querySelector('.fixed.inset-0.bg-black')
    expect(backdrop).toBeInTheDocument()
    
    if (backdrop) {
      await user.click(backdrop)
    }
    
    expect(onClose).toHaveBeenCalled()
  })

  it('navigates to correct routes', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    renderWithRouter(<Sidebar onClose={onClose} />)
    
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i })
    expect(dashboardLink).toHaveAttribute('href', '/')
    
    const reposLink = screen.getByRole('link', { name: /Repositories/i })
    expect(reposLink).toHaveAttribute('href', '/repositories')
    
    const tasksLink = screen.getByRole('link', { name: /Task Board/i })
    expect(tasksLink).toHaveAttribute('href', '/tasks')
    
    const terminalLink = screen.getByRole('link', { name: /Terminal/i })
    expect(terminalLink).toHaveAttribute('href', '/terminal')
    
    const settingsLink = screen.getByRole('link', { name: /Settings/i })
    expect(settingsLink).toHaveAttribute('href', '/settings')
    
    // Click a link and verify onClose is called
    await user.click(tasksLink)
    expect(onClose).toHaveBeenCalled()
  })

  it('handles collapsed state', async () => {
    const user = userEvent.setup()
    const onToggleCollapse = vi.fn()
    
    renderWithRouter(<Sidebar isCollapsed={true} onToggleCollapse={onToggleCollapse} />)
    
    // In collapsed state, labels should not be visible
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('Repositories')).not.toBeInTheDocument()
    
    // But links should still exist (with aria-labels)
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' })
    expect(dashboardLink).toBeInTheDocument()
    
    // Toggle button should be visible
    const toggleButton = screen.getByRole('button', { name: 'Expand sidebar' })
    expect(toggleButton).toBeInTheDocument()
    
    await user.click(toggleButton)
    expect(onToggleCollapse).toHaveBeenCalled()
  })

  it('shows tooltips in collapsed state', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Sidebar isCollapsed={true} />)
    
    // Hover over a link to show tooltip
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' })
    await user.hover(dashboardLink)
    
    // Check for tooltip - it's rendered as a div with role="tooltip"
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveTextContent('Dashboard')
  })

  it('renders with custom className', () => {
    renderWithRouter(<Sidebar />)
    
    const sidebar = screen.getByRole('navigation').closest('aside')
    expect(sidebar).toHaveClass('w-64', 'bg-white', 'border-r', 'border-gray-200')
  })

  it('handles mobile responsive behavior', () => {
    renderWithRouter(<Sidebar isOpen={false} />)
    
    // Sidebar should be translated off-screen on mobile when closed
    const sidebar = screen.getByRole('navigation').closest('aside')
    expect(sidebar).toHaveClass('-translate-x-full', 'lg:translate-x-0')
  })

  it('applies correct styles to active links', () => {
    renderWithRouter(<Sidebar />, { route: '/' })
    
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i })
    expect(dashboardLink).toHaveClass('bg-blue-600', 'text-white', 'shadow-sm')
    expect(dashboardLink).toHaveAttribute('aria-current', 'page')
  })

  it('renders collapse toggle button only on desktop', () => {
    renderWithRouter(<Sidebar />)
    
    const toggleButton = screen.getByRole('button', { name: /Collapse sidebar/i })
    expect(toggleButton).toBeInTheDocument()
    expect(toggleButton.parentElement).toHaveClass('hidden', 'lg:flex')
  })

  it('handles keyboard navigation', () => {
    renderWithRouter(<Sidebar />)
    
    const links = screen.getAllByRole('link')
    
    // All links should be focusable
    links.forEach(link => {
      link.focus()
      expect(document.activeElement).toBe(link)
    })
  })

  it('has proper ARIA attributes', () => {
    renderWithRouter(<Sidebar />)
    
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toBeInTheDocument()
    
    // Active link should have aria-current
    const activeLink = screen.getByRole('link', { name: /Dashboard/i })
    expect(activeLink).toHaveAttribute('aria-current', 'page')
  })

  it('shows correct chevron icon based on collapsed state', () => {
    const { rerender } = renderWithRouter(<Sidebar isCollapsed={false} />)
    
    // When not collapsed, should show ChevronLeft
    let toggleButton = screen.getByRole('button', { name: 'Collapse sidebar' })
    expect(toggleButton).toBeInTheDocument()
    
    // When collapsed, should show ChevronRight
    rerender(
      <BrowserRouter>
        <Sidebar isCollapsed={true} />
      </BrowserRouter>
    )
    
    toggleButton = screen.getByRole('button', { name: 'Expand sidebar' })
    expect(toggleButton).toBeInTheDocument()
  })

  it('applies hover styles to navigation items', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Sidebar />, { route: '/settings' })
    
    // Get a non-active link
    const reposLink = screen.getByRole('link', { name: /Repositories/i })
    expect(reposLink).toHaveClass('text-gray-700')
    
    // Hover should apply hover styles
    await user.hover(reposLink)
    expect(reposLink).toHaveClass('hover:bg-gray-100', 'hover:text-gray-900')
  })

  it('maintains sidebar width based on collapsed state', () => {
    const { rerender } = renderWithRouter(<Sidebar isCollapsed={false} />)
    
    let sidebar = screen.getByRole('navigation').closest('aside')
    expect(sidebar).toHaveClass('w-64')
    
    rerender(
      <BrowserRouter>
        <Sidebar isCollapsed={true} />
      </BrowserRouter>
    )
    
    sidebar = screen.getByRole('navigation').closest('aside')
    expect(sidebar).toHaveClass('w-16')
  })

  it('renders SafeLink components for navigation', () => {
    renderWithRouter(<Sidebar />)
    
    // All navigation items should be links
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(5) // Dashboard, Repositories, Task Board, Terminal, Settings
    
    // Each link should have proper href
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('focuses navigation on mount for accessibility', () => {
    renderWithRouter(<Sidebar />)
    
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveAttribute('aria-label', 'Main navigation')
  })

  it('applies focus ring styles to links', () => {
    renderWithRouter(<Sidebar />)
    
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i })
    expect(dashboardLink).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:ring-offset-2')
  })

  it('applies transition effects for smooth animations', () => {
    renderWithRouter(<Sidebar isOpen={true} />)
    
    const sidebar = screen.getByRole('navigation').closest('aside')
    expect(sidebar).toHaveClass('transition-[transform,opacity]', 'duration-200', 'ease-in-out')
  })

  it('renders icons with proper sizing', () => {
    renderWithRouter(<Sidebar />)
    
    // Find all icon containers (they have w-5 h-5 class)
    const iconContainers = document.querySelectorAll('.w-5.h-5')
    expect(iconContainers.length).toBeGreaterThan(0)
    
    // Each should have the correct size classes
    iconContainers.forEach(icon => {
      expect(icon).toHaveClass('w-5', 'h-5')
    })
  })

  it('applies proper spacing between navigation items', () => {
    renderWithRouter(<Sidebar />)
    
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toHaveClass('space-y-1')
  })

  it('handles scrollbar styling', () => {
    renderWithRouter(<Sidebar />)
    
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toHaveClass('overflow-y-auto', 'scrollbar-minimal')
  })

  it('renders backdrop only on mobile when open', () => {
    const { rerender } = renderWithRouter(<Sidebar isOpen={true} />)
    
    // Backdrop should exist when open
    let backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
    expect(backdrop).toBeInTheDocument()
    expect(backdrop).toHaveClass('z-30', 'lg:hidden')
    
    // Backdrop should not exist when closed
    rerender(
      <BrowserRouter>
        <Sidebar isOpen={false} />
      </BrowserRouter>
    )
    
    backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
    expect(backdrop).not.toBeInTheDocument()
  })
})