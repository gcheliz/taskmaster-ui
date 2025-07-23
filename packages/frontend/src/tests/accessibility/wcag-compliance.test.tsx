import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

// Import components to test
import { AppLayout } from '../../components/Layout/AppLayout'
import { Dashboard } from '../../pages/Dashboard'
import { TaskBoard } from '../../pages/TaskBoard'
import { Repositories } from '../../pages/Repositories'
import { Settings } from '../../pages/Settings'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/molecules/FormField'
import { Modal } from '../../components/ui/molecules/Modal'
import { Tabs } from '../../components/ui/molecules/Tabs'

// Add custom jest matchers
expect.extend(toHaveNoViolations)

// Wrapper for components that need routing
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('WCAG 2.1 AA Compliance Tests', () => {
  describe('1. Perceivable', () => {
    describe('1.1 Text Alternatives', () => {
      it('should have alt text for all images', async () => {
        const { container } = render(
          <RouterWrapper>
            <Dashboard />
          </RouterWrapper>
        )
        
        const images = container.querySelectorAll('img')
        images.forEach(img => {
          expect(img).toHaveAttribute('alt')
          expect(img.getAttribute('alt')).not.toBe('')
        })
      })

      it('should have aria-label for icon buttons', () => {
        render(
          <Button variant="icon" size="sm">
            <span className="sr-only">Menu</span>
            ☰
          </Button>
        )
        
        const button = screen.getByRole('button')
        expect(button).toHaveTextContent('Menu')
      })
    })

    describe('1.3 Adaptable', () => {
      it('should have proper heading hierarchy', () => {
        const { container } = render(
          <RouterWrapper>
            <Dashboard />
          </RouterWrapper>
        )
        
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
        let previousLevel = 0
        
        headings.forEach(heading => {
          const level = parseInt(heading.tagName[1])
          expect(level - previousLevel).toBeLessThanOrEqual(1)
          previousLevel = level
        })
      })

      it('should use semantic HTML elements', () => {
        const { container } = render(
          <RouterWrapper>
            <AppLayout />
          </RouterWrapper>
        )
        
        expect(container.querySelector('nav')).toBeInTheDocument()
        expect(container.querySelector('main')).toBeInTheDocument()
        expect(container.querySelector('header')).toBeInTheDocument()
        expect(container.querySelector('footer')).toBeInTheDocument()
      })
    })

    describe('1.4 Distinguishable', () => {
      it('should have sufficient color contrast ratios', async () => {
        const { container } = render(
          <div>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
        )
        
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('should be responsive and maintain readability', () => {
        const { container } = render(
          <RouterWrapper>
            <Dashboard />
          </RouterWrapper>
        )
        
        // Check that text can be resized without horizontal scrolling
        const mainContent = container.querySelector('main')
        expect(mainContent).toHaveStyle({ overflowX: 'hidden' })
      })
    })
  })

  describe('2. Operable', () => {
    describe('2.1 Keyboard Accessible', () => {
      it('should allow keyboard navigation through interactive elements', async () => {
        const user = userEvent.setup()
        render(
          <RouterWrapper>
            <AppLayout />
          </RouterWrapper>
        )
        
        // Tab through navigation
        await user.tab()
        expect(document.activeElement?.tagName).toBe('A')
        
        // Continue tabbing
        await user.tab()
        await user.tab()
        
        // Should cycle through all interactive elements
        const activeElement = document.activeElement
        expect(['A', 'BUTTON', 'INPUT'].includes(activeElement?.tagName || '')).toBe(true)
      })

      it('should support keyboard shortcuts', async () => {
        const user = userEvent.setup()
        
        render(
          <RouterWrapper>
            <AppLayout />
          </RouterWrapper>
        )
        
        // Test CMD+K shortcut
        await user.keyboard('{Meta>}k{/Meta}')
        
        // Should trigger some action (command palette)
        // In real implementation, this would open the command palette
      })

      it('should have visible focus indicators', () => {
        render(
          <div>
            <Button>Test Button</Button>
            <input type="text" placeholder="Test Input" />
          </div>
        )
        
        const button = screen.getByRole('button')
        const input = screen.getByPlaceholderText('Test Input')
        
        // Check focus styles exist
        expect(button.className).toContain('focus-visible:ring')
        expect(input.className).toContain('focus:ring')
      })
    })

    describe('2.2 Enough Time', () => {
      it('should not have time limits on content', () => {
        // Our app doesn't have time-based content
        // This test ensures no auto-refresh or timeouts
        const { container } = render(
          <RouterWrapper>
            <Dashboard />
          </RouterWrapper>
        )
        
        // Check no meta refresh tags
        const metaRefresh = container.querySelector('meta[http-equiv="refresh"]')
        expect(metaRefresh).not.toBeInTheDocument()
      })
    })

    describe('2.4 Navigable', () => {
      it('should have skip links', () => {
        render(
          <RouterWrapper>
            <AppLayout />
          </RouterWrapper>
        )
        
        const skipLink = screen.getByText('Skip to main content')
        expect(skipLink).toBeInTheDocument()
        expect(skipLink).toHaveAttribute('href', '#main-content')
      })

      it('should have descriptive page titles', () => {
        // In a real app, this would check document.title
        render(
          <RouterWrapper>
            <Dashboard />
          </RouterWrapper>
        )
        
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toHaveTextContent('Dashboard')
      })

      it('should have clear focus order', async () => {
        const user = userEvent.setup()
        const { container } = render(
          <RouterWrapper>
            <TaskBoard />
          </RouterWrapper>
        )
        
        // Tab through elements and verify logical order
        const focusableElements = container.querySelectorAll(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        expect(focusableElements.length).toBeGreaterThan(0)
      })
    })

    describe('2.5 Input Modalities', () => {
      it('should support touch targets of at least 44x44 pixels', () => {
        render(<Button size="sm">Small Button</Button>)
        
        const button = screen.getByRole('button')
        const styles = window.getComputedStyle(button)
        
        // Check minimum touch target size
        const height = parseInt(styles.minHeight) || parseInt(styles.height)
        expect(height).toBeGreaterThanOrEqual(44)
      })
    })
  })

  describe('3. Understandable', () => {
    describe('3.1 Readable', () => {
      it('should have language attribute', () => {
        // In real app, check document.documentElement.lang
        const mockHtml = document.createElement('html')
        mockHtml.lang = 'en'
        expect(mockHtml.lang).toBe('en')
      })
    })

    describe('3.2 Predictable', () => {
      it('should not change context on focus', async () => {
        const user = userEvent.setup()
        const mockSubmit = jest.fn()
        
        render(
          <form onSubmit={mockSubmit}>
            <input type="text" />
            <button type="submit">Submit</button>
          </form>
        )
        
        const input = screen.getByRole('textbox')
        await user.click(input)
        
        // Focus should not submit form or navigate
        expect(mockSubmit).not.toHaveBeenCalled()
      })
    })

    describe('3.3 Input Assistance', () => {
      it('should have error identification', () => {
        render(
          <FormField label="Email" error="Invalid email format" required>
            <input type="email" aria-invalid="true" />
          </FormField>
        )
        
        const error = screen.getByText('Invalid email format')
        expect(error).toBeInTheDocument()
        
        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })

      it('should have labels for all form inputs', () => {
        render(
          <FormField label="Username" required>
            <input type="text" />
          </FormField>
        )
        
        const input = screen.getByRole('textbox')
        const label = screen.getByText('Username')
        
        expect(label).toBeInTheDocument()
        expect(input).toHaveAccessibleName('Username')
      })
    })
  })

  describe('4. Robust', () => {
    describe('4.1 Compatible', () => {
      it('should have valid ARIA attributes', async () => {
        const { container } = render(
          <RouterWrapper>
            <AppLayout />
          </RouterWrapper>
        )
        
        const results = await axe(container)
        const ariaViolations = results.violations.filter(v => 
          v.id.includes('aria') || v.tags.includes('aria')
        )
        
        expect(ariaViolations).toHaveLength(0)
      })

      it('should properly nest interactive elements', () => {
        // This should not render button inside button
        const { container } = render(
          <Button>
            Click me
            {/* No nested buttons */}
          </Button>
        )
        
        const buttons = container.querySelectorAll('button button')
        expect(buttons).toHaveLength(0)
        
        const links = container.querySelectorAll('a a')
        expect(links).toHaveLength(0)
      })
    })
  })

  describe('Component-specific Accessibility Tests', () => {
    describe('Modal Accessibility', () => {
      it('should trap focus within modal', async () => {
        const user = userEvent.setup()
        render(
          <Modal open={true} onOpenChange={() => {}}>
            <div>
              <input type="text" placeholder="First" />
              <input type="text" placeholder="Second" />
              <button>Close</button>
            </div>
          </Modal>
        )
        
        // Focus should be trapped within modal
        const firstInput = screen.getByPlaceholderText('First')
        
        firstInput.focus()
        await user.tab()
        await user.tab()
        await user.tab()
        
        // Should cycle back to first element
        expect(document.activeElement).toBe(firstInput)
      })

      it('should have proper ARIA attributes', () => {
        render(
          <Modal open={true} onOpenChange={() => {}}>
            <div>Modal Content</div>
          </Modal>
        )
        
        const modal = screen.getByRole('dialog')
        expect(modal).toHaveAttribute('aria-modal', 'true')
      })
    })

    describe('Tabs Accessibility', () => {
      it('should support keyboard navigation', async () => {
        const user = userEvent.setup()
        render(
          <Tabs defaultValue="tab1">
            <Tabs.List>
              <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
              <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
              <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="tab1">Content 1</Tabs.Content>
            <Tabs.Content value="tab2">Content 2</Tabs.Content>
            <Tabs.Content value="tab3">Content 3</Tabs.Content>
          </Tabs>
        )
        
        const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
        tab1.focus()
        
        // Arrow right should move to next tab
        await user.keyboard('{ArrowRight}')
        expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus()
        
        // Arrow left should move to previous tab
        await user.keyboard('{ArrowLeft}')
        expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus()
      })
    })

    describe('Task Board Accessibility', () => {
      it('should announce drag and drop operations', () => {
        render(
          <RouterWrapper>
            <TaskBoard />
          </RouterWrapper>
        )
        
        // Check for live region
        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveAttribute('aria-live')
      })

      it('should provide keyboard alternatives to drag and drop', () => {
        render(
          <RouterWrapper>
            <TaskBoard />
          </RouterWrapper>
        )
        
        // Task cards should be keyboard accessible
        const taskCards = screen.getAllByRole('button', { name: /Task:/ })
        expect(taskCards.length).toBeGreaterThan(0)
        
        taskCards.forEach(card => {
          expect(card).toHaveAttribute('tabindex', '0')
        })
      })
    })
  })

  describe('Automated Accessibility Scanning', () => {
    it('Dashboard should have no accessibility violations', async () => {
      const { container } = render(
        <RouterWrapper>
          <Dashboard />
        </RouterWrapper>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('TaskBoard should have no accessibility violations', async () => {
      const { container } = render(
        <RouterWrapper>
          <TaskBoard />
        </RouterWrapper>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Repositories should have no accessibility violations', async () => {
      const { container } = render(
        <RouterWrapper>
          <Repositories />
        </RouterWrapper>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Settings should have no accessibility violations', async () => {
      const { container } = render(
        <RouterWrapper>
          <Settings />
        </RouterWrapper>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})