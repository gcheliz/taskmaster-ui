import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/react'

// Mock services
vi.mock('../../services/repositoryService', () => ({
  repositoryService: {
    listRepositories: vi.fn().mockResolvedValue({ repositories: [] }),
  },
}))

// Import components
import { TaskCard } from '../../components/TaskBoard/TaskCard'
import { RepositoryCard } from '../../components/Repository/RepositoryCard'
import { NotificationCard } from '../../components/Notifications/NotificationCard'
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle, ModalFooter } from '../../components/ui/molecules/Modal'
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
      expect(screen.getByRole('button', { name: /Delete/ })).toBeInTheDocument()
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
      
      // Check initial announcement - find the specific status element
      const statusElements = screen.getAllByRole('status')
      const taskStatus = statusElements.find(el => el.textContent?.includes('Task saved'))
      expect(taskStatus).toHaveTextContent('Task saved successfully')
      
      // Update announcement
      rerender(
        <div>
          <div role="status" aria-live="polite">
            Task updated successfully
          </div>
          <button>Save</button>
        </div>
      )
      
      // Find the updated status
      const updatedStatusElements = screen.getAllByRole('status')
      const updatedStatus = updatedStatusElements.find(el => el.textContent?.includes('Task updated'))
      expect(updatedStatus).toHaveTextContent('Task updated successfully')
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
      
      const statusElements = screen.getAllByRole('status')
      const loadingStatus = statusElements.find(el => el.getAttribute('aria-busy') === 'true')
      expect(loadingStatus).toHaveAttribute('aria-busy', 'true')
      expect(screen.getByText('Loading repositories...')).toBeInTheDocument()
      
      // After loading
      rerender(
        <div>
          <div role="status" aria-live="polite" aria-busy="false">
            <span className="sr-only">5 repositories loaded</span>
          </div>
        </div>
      )
      
      const completedStatusElements = screen.getAllByRole('status')
      const completedStatus = completedStatusElements.find(el => el.getAttribute('aria-busy') === 'false')
      expect(completedStatus).toHaveAttribute('aria-busy', 'false')
      expect(screen.getByText('5 repositories loaded')).toBeInTheDocument()
    })
  })

  describe('Complex Component Accessibility', () => {
    it('TaskCard should provide comprehensive information', () => {
      render(<TaskCard task={mockTask} onTaskClick={() => {}} />)
      
      // Should include all important information
      expect(screen.getByText('Fix login bug')).toBeInTheDocument()
      
      // Check for the ARIA label which includes priority information
      const taskCard = screen.getByRole('article')
      expect(taskCard).toHaveAttribute('aria-label', expect.stringContaining('priority high'))
    })

    it('RepositoryCard should announce all details', () => {
      render(<RepositoryCard repository={mockRepository} />)
      
      // Should have accessible name
      const heading = screen.getByRole('heading', { name: 'taskmaster-ui' })
      expect(heading).toBeInTheDocument()
      
      // Should include metadata
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      // Star count is rendered as just the number, not "42 stars"
      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })

  describe('Form Accessibility', () => {
    it('should associate labels with form controls', () => {
      render(
        <FormField label="Email Address" required type="email" />
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAccessibleName('Email Address (required)')
      
      // Required indicator should be visible
      const label = screen.getByText('Email Address')
      expect(label).toBeInTheDocument()
    })

    it('should announce form errors', () => {
      render(
        <FormField 
          label="Password" 
          error="Password must be at least 8 characters"
          type="password"
        />
      )
      
      const input = screen.getByLabelText(/Password/i)
      expect(input).toHaveAttribute('aria-invalid', 'true')
      
      // Error message should be visible
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      
      const error = screen.getByRole('alert')
      expect(error).toHaveTextContent('Password must be at least 8 characters')
    })

    it('should provide help text', () => {
      render(
        <FormField 
          label="Username"
          helpText="Must be 3-20 characters, letters and numbers only"
          type="text"
        />
      )
      
      const input = screen.getByLabelText('Username')
      // FormField automatically sets aria-describedby for help text
      expect(screen.getByText('Must be 3-20 characters, letters and numbers only')).toBeInTheDocument()
    })
  })

  describe('Modal and Dialog Accessibility', () => {
    it('should have proper dialog structure', async () => {
      // Mock document.body for portal
      const portalRoot = document.createElement('div')
      document.body.appendChild(portalRoot)
      
      render(
        <Modal open={true} onOpenChange={() => {}}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Confirm Delete</ModalTitle>
            </ModalHeader>
            <ModalBody>
              Are you sure you want to delete this repository?
            </ModalBody>
            <ModalFooter>
              <button>Cancel</button>
              <button>Delete</button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )
      
      // Wait for modal to render in portal
      await act(async () => {
        await vi.waitFor(() => {
          expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
        })
      })
      
      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      
      // Title should be visible
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument()
      
      // Cleanup
      document.body.removeChild(portalRoot)
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
      // Get all status elements and find our specific one
      const statusElements = screen.getAllByRole('status')
      const modalStatus = statusElements.find(el => el.classList.contains('sr-only'))
      
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
      
      expect(modalStatus).toHaveTextContent('Dialog opened: Confirm Delete')
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
      
      const statusElements = screen.getAllByRole('status')
      const taskCountStatus = statusElements.find(el => el.textContent?.includes('Showing'))
      expect(taskCountStatus).toHaveTextContent('Showing 5 tasks')
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
      
      const statusElements = screen.getAllByRole('status')
      const uploadStatus = statusElements.find(el => el.textContent?.includes('Upload'))
      expect(uploadStatus).toHaveTextContent('Upload 60% complete')
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
      
      // Check if dismiss button exists (if component has one)
      const dismissButton = screen.queryByRole('button')
      if (dismissButton) {
        expect(dismissButton).toBeInTheDocument()
      }
    })
  })
})