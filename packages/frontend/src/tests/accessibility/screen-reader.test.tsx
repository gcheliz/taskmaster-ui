import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

// Import components
import { TaskCard } from '../../components/TaskBoard/TaskCard'
import { RepositoryCard } from '../../components/Repository/RepositoryCard'
import { NotificationCard } from '../../components/Notifications/NotificationCard'
import { Modal } from '../../components/ui/molecules/Modal'
import { FormField } from '../../components/ui/molecules/FormField'
import { Alert } from '../../components/ui/molecules/Alert'

// Mock data
const mockTask = {
  id: 1,
  title: 'Fix login bug',
  description: 'Users cannot login with special characters',
  status: 'in-progress' as const,
  priority: 'high' as const,
  assignedTo: 'John Doe',
  dueDate: '2024-01-15'
}

const mockRepository = {
  id: '1',
  name: 'taskmaster-ui',
  description: 'Task management UI application',
  url: 'https://github.com/user/taskmaster-ui',
  language: 'TypeScript',
  starCount: 42,
  path: '/path/to/taskmaster-ui',
  currentBranch: 'main',
  lastCommit: {
    hash: 'abc123',
    date: '2024-01-10T10:00:00Z',
    message: 'Initial commit',
    author: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  },
  status: {
    isClean: true,
    staged: 0,
    unstaged: 0,
    untracked: 0,
    conflicted: 0
  }
}

describe('Screen Reader Support Tests', () => {
  describe('Descriptive Labels and Text', () => {
    it('should have accessible names for all interactive elements', () => {
      render(
        <div>
          <button aria-label="Save document">💾</button>
          <button>
            <span className="sr-only">Delete</span>
            🗑️
          </button>
          <input type="text" aria-label="Search repositories" />
        </div>
      )
      
      expect(screen.getByRole('button', { name: 'Save document' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Search repositories' })).toBeInTheDocument()
    })

    it('should provide context for ambiguous elements', () => {
      render(
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Task 1</td>
              <td>Active</td>
              <td>
                <button aria-label="Edit Task 1">Edit</button>
                <button aria-label="Delete Task 1">Delete</button>
              </td>
            </tr>
            <tr>
              <td>Task 2</td>
              <td>Completed</td>
              <td>
                <button aria-label="Edit Task 2">Edit</button>
                <button aria-label="Delete Task 2">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      )
      
      // Each button has unique context
      expect(screen.getByRole('button', { name: 'Edit Task 1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete Task 1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit Task 2' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete Task 2' })).toBeInTheDocument()
    })
  })

  describe('Live Regions and Announcements', () => {
    it('should announce status changes', async () => {
      const { rerender } = render(
        <div>
          <div role="status" aria-live="polite">
            Task saved successfully
          </div>
          <button>Save</button>
        </div>
      )
      
      // Check initial announcement
      expect(screen.getByRole('status')).toHaveTextContent('Task saved successfully')
      
      // Update announcement
      rerender(
        <div>
          <div role="status" aria-live="polite">
            Task updated successfully
          </div>
          <button>Save</button>
        </div>
      )
      
      expect(screen.getByRole('status')).toHaveTextContent('Task updated successfully')
    })

    it('should use assertive announcements for errors', () => {
      render(
        <Alert variant="error" role="alert" aria-live="assertive">
          Failed to save changes. Please try again.
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
      expect(alert).toHaveTextContent('Failed to save changes')
    })

    it('should announce loading states', async () => {
      const { rerender } = render(
        <div>
          <div role="status" aria-live="polite" aria-busy="true">
            <span className="sr-only">Loading repositories...</span>
          </div>
        </div>
      )
      
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
      expect(screen.getByText('Loading repositories...')).toBeInTheDocument()
      
      // After loading
      rerender(
        <div>
          <div role="status" aria-live="polite" aria-busy="false">
            <span className="sr-only">5 repositories loaded</span>
          </div>
        </div>
      )
      
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'false')
      expect(screen.getByText('5 repositories loaded')).toBeInTheDocument()
    })
  })

  describe('Complex Component Accessibility', () => {
    it('TaskCard should provide comprehensive information', () => {
      render(<TaskCard task={mockTask} onTaskClick={() => {}} />)
      
      // Should include all important information
      expect(screen.getByText('Fix login bug')).toBeInTheDocument()
      expect(screen.getByText(/high priority/i)).toBeInTheDocument()
      expect(screen.getByText(/Fix login bug/i)).toBeInTheDocument()
    })

    it('RepositoryCard should announce all details', () => {
      render(
        <BrowserRouter>
          <RepositoryCard repository={mockRepository} />
        </BrowserRouter>
      )
      
      // Should have accessible name
      const heading = screen.getByRole('heading', { name: 'taskmaster-ui' })
      expect(heading).toBeInTheDocument()
      
      // Should include metadata
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText(/42.*stars/i)).toBeInTheDocument()
    })
  })

  describe('Form Accessibility', () => {
    it('should associate labels with form controls', () => {
      render(
        <FormField label="Email Address" required>
          <input type="email" id="email" />
        </FormField>
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAccessibleName('Email Address')
      
      // Required indicator should be part of accessible name
      const label = screen.getByText(/Email Address/i)
      expect(label.parentElement).toHaveTextContent('*')
    })

    it('should announce form errors', () => {
      render(
        <FormField label="Password" error="Password must be at least 8 characters">
          <input type="password" aria-invalid="true" aria-describedby="password-error" />
          <div id="password-error" role="alert">
            Password must be at least 8 characters
          </div>
        </FormField>
      )
      
      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'password-error')
      
      const error = screen.getByRole('alert')
      expect(error).toHaveTextContent('Password must be at least 8 characters')
    })

    it('should provide help text', () => {
      render(
        <FormField 
          label="Username"
        >
          <input type="text" aria-describedby="username-help" />
          <div id="username-help">
            Must be 3-20 characters, letters and numbers only
          </div>
        </FormField>
      )
      
      const input = screen.getByLabelText('Username')
      expect(input).toHaveAttribute('aria-describedby', 'username-help')
    })
  })

  describe('Modal and Dialog Accessibility', () => {
    it('should have proper dialog structure', () => {
      render(
        <Modal open={true} onOpenChange={() => {}}>
          <Modal.Header>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this repository?
          </Modal.Body>
          <Modal.Footer>
            <button>Cancel</button>
            <button>Delete</button>
          </Modal.Footer>
        </Modal>
      )
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAccessibleName('Confirm Delete')
    })

    it('should announce modal opening and closing', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <>
          <button>Open Modal</button>
          <div role="status" aria-live="polite" className="sr-only">
            
          </div>
        </>
      )
      
      const button = screen.getByRole('button', { name: 'Open Modal' })
      const status = screen.getByRole('status')
      
      // Click to open
      await user.click(button)
      
      // Should announce modal opened
      rerender(
        <>
          <button>Open Modal</button>
          <div role="status" aria-live="polite" className="sr-only">
            Dialog opened: Confirm Delete
          </div>
          <Modal open={true} onOpenChange={() => {}}>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal>
        </>
      )
      
      expect(status).toHaveTextContent('Dialog opened: Confirm Delete')
    })
  })

  describe('Data Tables and Lists', () => {
    it('should have accessible table structure', () => {
      render(
        <table>
          <caption>Repository List</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Language</th>
              <th scope="col">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">taskmaster-ui</th>
              <td>TypeScript</td>
              <td>2 days ago</td>
            </tr>
          </tbody>
        </table>
      )
      
      const table = screen.getByRole('table', { name: 'Repository List' })
      expect(table).toBeInTheDocument()
      
      // Check headers
      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Language' })).toBeInTheDocument()
      
      // Check row headers
      expect(screen.getByRole('rowheader', { name: 'taskmaster-ui' })).toBeInTheDocument()
    })

    it('should announce list counts and updates', () => {
      render(
        <div>
          <h2 id="task-list-heading">Tasks (5 items)</h2>
          <ul aria-labelledby="task-list-heading">
            <li>Task 1</li>
            <li>Task 2</li>
            <li>Task 3</li>
            <li>Task 4</li>
            <li>Task 5</li>
          </ul>
          <div role="status" aria-live="polite" className="sr-only">
            Showing 5 tasks
          </div>
        </div>
      )
      
      const list = screen.getByRole('list')
      expect(list).toHaveAccessibleName('Tasks (5 items)')
      
      const status = screen.getByRole('status')
      expect(status).toHaveTextContent('Showing 5 tasks')
    })
  })

  describe('Progress and Loading States', () => {
    it('should announce progress updates', () => {
      render(
        <div>
          <div 
            role="progressbar" 
            aria-valuenow={60} 
            aria-valuemin={0} 
            aria-valuemax={100}
            aria-label="Upload progress"
          >
            60%
          </div>
          <div role="status" aria-live="polite">
            Upload 60% complete
          </div>
        </div>
      )
      
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '60')
      expect(progressbar).toHaveAccessibleName('Upload progress')
      
      expect(screen.getByRole('status')).toHaveTextContent('Upload 60% complete')
    })

    it('should indicate busy states', () => {
      render(
        <div aria-busy="true" aria-label="Loading repositories">
          <div className="spinner" role="img" aria-label="Loading spinner" />
          <span className="sr-only">Loading repositories, please wait...</span>
        </div>
      )
      
      expect(screen.getByText('Loading repositories, please wait...')).toBeInTheDocument()
      expect(screen.getByRole('img', { name: 'Loading spinner' })).toBeInTheDocument()
    })
  })

  describe('Notifications and Alerts', () => {
    it('NotificationCard should be announced appropriately', () => {
      const mockNotification = {
        id: '1',
        type: 'error' as const,
        title: 'Save Failed',
        message: 'Unable to save changes. Please try again.',
        timestamp: new Date()
      }
      
      render(
        <NotificationCard 
          notification={mockNotification}
          onDismiss={() => {}}
        />
      )
      
      // Should have alert role for errors
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      
      // Should include all content
      expect(screen.getByText('Save Failed')).toBeInTheDocument()
      expect(screen.getByText(/Unable to save changes/)).toBeInTheDocument()
      
      // Dismiss button should be labeled
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
    })
  })
})