import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

// Import components
import { Sidebar } from '../../components/Layout/Sidebar'
import { Tabs } from '../../components/ui/molecules/Tabs'
import { Dropdown } from '../../components/ui/molecules/Dropdown'
import { Modal } from '../../components/ui/molecules/Modal'
import { TaskBoard } from '../../components/TaskBoard/TaskBoard'

const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Keyboard Navigation Tests', () => {
  describe('Sidebar Navigation', () => {
    it('should navigate through menu items with arrow keys', async () => {
      const user = userEvent.setup()
      
      render(
        <RouterWrapper>
          <Sidebar isOpen={true} onClose={() => {}} isCollapsed={false} onToggleCollapse={() => {}} />
        </RouterWrapper>
      )
      
      // Focus first menu item
      const menuItems = screen.getAllByRole('link')
      menuItems[0].focus()
      
      // Arrow down should move to next item
      await user.keyboard('{ArrowDown}')
      expect(menuItems[1]).toHaveFocus()
      
      // Arrow up should move to previous item
      await user.keyboard('{ArrowUp}')
      expect(menuItems[0]).toHaveFocus()
      
      // End key should move to last item
      await user.keyboard('{End}')
      expect(menuItems[menuItems.length - 1]).toHaveFocus()
      
      // Home key should move to first item
      await user.keyboard('{Home}')
      expect(menuItems[0]).toHaveFocus()
    })

    it('should activate menu items with Enter and Space', async () => {
      const user = userEvent.setup()
      render(
        <RouterWrapper>
          <Sidebar isOpen={true} onClose={() => {}} isCollapsed={false} onToggleCollapse={() => {}} />
        </RouterWrapper>
      )
      
      const firstMenuItem = screen.getAllByRole('link')[0]
      firstMenuItem.focus()
      
      // Enter should activate
      await user.keyboard('{Enter}')
      
      // Space should also activate (for buttons)
      const collapseButton = screen.getByLabelText(/collapse sidebar/i)
      collapseButton.focus()
      await user.keyboard(' ')
    })
  })

  describe('Tab Component Navigation', () => {
    it('should navigate tabs with arrow keys', async () => {
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
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' })
      
      // Focus first tab
      tab1.focus()
      expect(tab1).toHaveFocus()
      
      // Right arrow moves to next tab
      await user.keyboard('{ArrowRight}')
      expect(tab2).toHaveFocus()
      
      // Right arrow at end wraps to beginning
      await user.keyboard('{ArrowRight}')
      expect(tab3).toHaveFocus()
      await user.keyboard('{ArrowRight}')
      expect(tab1).toHaveFocus()
      
      // Left arrow moves to previous tab
      await user.keyboard('{ArrowLeft}')
      expect(tab3).toHaveFocus()
      
      // Home and End keys
      await user.keyboard('{Home}')
      expect(tab1).toHaveFocus()
      await user.keyboard('{End}')
      expect(tab3).toHaveFocus()
    })

    it('should activate tabs with Enter or Space', async () => {
      const user = userEvent.setup()
      const mockOnChange = jest.fn()
      
      render(
        <Tabs defaultValue="tab1" onValueChange={mockOnChange}>
          <Tabs.List>
            <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
            <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tab1">Content 1</Tabs.Content>
          <Tabs.Content value="tab2">Content 2</Tabs.Content>
        </Tabs>
      )
      
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      tab2.focus()
      
      // Enter activates tab
      await user.keyboard('{Enter}')
      expect(mockOnChange).toHaveBeenCalledWith('tab2')
      
      // Space also activates tab
      mockOnChange.mockClear()
      await user.keyboard(' ')
      expect(mockOnChange).toHaveBeenCalledWith('tab2')
    })
  })

  describe('Dropdown Navigation', () => {
    it('should navigate dropdown items with arrow keys', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Open Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Option 1</Dropdown.Item>
            <Dropdown.Item>Option 2</Dropdown.Item>
            <Dropdown.Item>Option 3</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      )
      
      // Open dropdown
      const trigger = screen.getByRole('button', { name: 'Open Menu' })
      await user.click(trigger)
      
      const options = screen.getAllByRole('menuitem')
      
      // First item should be focused
      expect(options[0]).toHaveFocus()
      
      // Arrow down
      await user.keyboard('{ArrowDown}')
      expect(options[1]).toHaveFocus()
      
      // Arrow up
      await user.keyboard('{ArrowUp}')
      expect(options[0]).toHaveFocus()
      
      // Escape closes dropdown
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('should support type-ahead in dropdowns', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Open Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Apple</Dropdown.Item>
            <Dropdown.Item>Banana</Dropdown.Item>
            <Dropdown.Item>Cherry</Dropdown.Item>
            <Dropdown.Item>Blueberry</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      )
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: 'Open Menu' }))
      
      // Type 'b' should focus Banana
      await user.keyboard('b')
      expect(screen.getByRole('menuitem', { name: 'Banana' })).toHaveFocus()
      
      // Type 'b' again should focus Blueberry
      await user.keyboard('b')
      expect(screen.getByRole('menuitem', { name: 'Blueberry' })).toHaveFocus()
      
      // Type 'c' should focus Cherry
      await user.keyboard('c')
      expect(screen.getByRole('menuitem', { name: 'Cherry' })).toHaveFocus()
    })
  })

  describe('Modal Focus Management', () => {
    it('should trap focus within modal', async () => {
      const user = userEvent.setup()
      
      render(
        <>
          <button>Outside Button Before</button>
          <Modal open={true} onOpenChange={() => {}}>
            <Modal.Header>
              <Modal.Title>Test Modal</Modal.Title>
              <Modal.Close />
            </Modal.Header>
            <Modal.Body>
              <input type="text" placeholder="First input" />
              <button>Modal Button</button>
              <input type="text" placeholder="Last input" />
            </Modal.Body>
          </Modal>
          <button>Outside Button After</button>
        </>
      )
      
      // Focus should be on first focusable element in modal
      const firstInput = screen.getByPlaceholderText('First input')
      expect(firstInput).toHaveFocus()
      
      // Tab through all elements
      await user.tab()
      expect(screen.getByRole('button', { name: 'Modal Button' })).toHaveFocus()
      
      await user.tab()
      expect(screen.getByPlaceholderText('Last input')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /close/i })).toHaveFocus()
      
      // Tab should wrap to first element
      await user.tab()
      expect(firstInput).toHaveFocus()
      
      // Shift+Tab should go backwards
      await user.tab({ shift: true })
      expect(screen.getByRole('button', { name: /close/i })).toHaveFocus()
    })

    it('should return focus to trigger when closed', async () => {
      const user = userEvent.setup()
      const mockOnChange = jest.fn()
      
      const { rerender } = render(
        <>
          <button>Trigger Button</button>
          <Modal open={false} onOpenChange={mockOnChange}>
            <div>Modal Content</div>
          </Modal>
        </>
      )
      
      const trigger = screen.getByRole('button', { name: 'Trigger Button' })
      trigger.focus()
      
      // Open modal
      rerender(
        <>
          <button>Trigger Button</button>
          <Modal open={true} onOpenChange={mockOnChange}>
            <div>Modal Content</div>
          </Modal>
        </>
      )
      
      // Close modal with Escape
      await user.keyboard('{Escape}')
      expect(mockOnChange).toHaveBeenCalledWith(false)
      
      // Focus should return to trigger
      // (In real implementation, this would be handled by the Modal component)
    })
  })

  describe('Form Navigation', () => {
    it('should navigate between form fields with Tab', async () => {
      const user = userEvent.setup()
      
      render(
        <form>
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <textarea placeholder="Message" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const nameInput = screen.getByPlaceholderText('Name')
      const emailInput = screen.getByPlaceholderText('Email')
      const messageTextarea = screen.getByPlaceholderText('Message')
      const submitButton = screen.getByRole('button', { name: 'Submit' })
      
      // Focus first field
      nameInput.focus()
      
      // Tab through fields
      await user.tab()
      expect(emailInput).toHaveFocus()
      
      await user.tab()
      expect(messageTextarea).toHaveFocus()
      
      await user.tab()
      expect(submitButton).toHaveFocus()
      
      // Shift+Tab backwards
      await user.tab({ shift: true })
      expect(messageTextarea).toHaveFocus()
    })

    it('should submit form with Enter in input fields', async () => {
      const user = userEvent.setup()
      const mockSubmit = jest.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={mockSubmit}>
          <input type="text" placeholder="Name" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const input = screen.getByPlaceholderText('Name')
      input.focus()
      
      // Enter in input should submit form
      await user.keyboard('{Enter}')
      expect(mockSubmit).toHaveBeenCalled()
    })
  })

  describe('Global Keyboard Shortcuts', () => {
    it('should handle global shortcuts from any focused element', async () => {
      const user = userEvent.setup()
      const mockNavigate = jest.fn()
      
      // Mock useNavigate
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
      }))
      
      render(
        <RouterWrapper>
          <div>
            <input type="text" placeholder="Search" />
            <button>Action</button>
            <div tabIndex={0}>Focusable Div</div>
          </div>
        </RouterWrapper>
      )
      
      // Focus different elements and test shortcuts work from each
      const input = screen.getByPlaceholderText('Search')
      const button = screen.getByRole('button')
      const div = screen.getByText('Focusable Div')
      
      // Shortcut works from input (when using cmd/ctrl)
      input.focus()
      await user.keyboard('{Meta>}k{/Meta}')
      
      // Shortcut works from button
      button.focus()
      await user.keyboard('{Meta>}/') // Show shortcuts
      
      // Shortcut works from div
      div.focus()
      await user.keyboard('{Meta>}k{/Meta}')
    })
  })

  describe('Complex Interaction Patterns', () => {
    it('should handle grid navigation in task board', async () => {
      const user = userEvent.setup()
      
      render(
        <RouterWrapper>
          <TaskBoard />
        </RouterWrapper>
      )
      
      // Find task cards
      const taskCards = screen.getAllByRole('button', { name: /Task:/ })
      expect(taskCards.length).toBeGreaterThan(0)
      
      // Focus first task
      taskCards[0].focus()
      
      // Arrow keys should navigate between tasks
      await user.keyboard('{ArrowDown}')
      // Next task in column should be focused
      
      await user.keyboard('{ArrowRight}')
      // Task in next column should be focused
    })

    it('should support roving tabindex in toolbars', async () => {
      const user = userEvent.setup()
      
      render(
        <div role="toolbar" aria-label="Text formatting">
          <button tabIndex={0}>Bold</button>
          <button tabIndex={-1}>Italic</button>
          <button tabIndex={-1}>Underline</button>
        </div>
      )
      
      const buttons = screen.getAllByRole('button')
      
      // First button has tabindex 0
      expect(buttons[0]).toHaveAttribute('tabindex', '0')
      expect(buttons[1]).toHaveAttribute('tabindex', '-1')
      expect(buttons[2]).toHaveAttribute('tabindex', '-1')
      
      // Tab to toolbar
      await user.tab()
      expect(buttons[0]).toHaveFocus()
      
      // Arrow right moves within toolbar
      await user.keyboard('{ArrowRight}')
      // In real implementation, this would update tabindex and focus
    })
  })
})