import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import Repositories from '../../pages/Repositories'
import RepositoryDetail from '../../pages/RepositoryDetail'

// Mock API responses
const mockGetRepositories = vi.fn()
const mockCreateRepository = vi.fn()
const mockUpdateRepository = vi.fn()
const mockDeleteRepository = vi.fn()
const mockGetRepository = vi.fn()
const mockSyncRepository = vi.fn()

vi.mock('../../services/api', () => ({
  api: {
    repositories: {
      getAll: () => mockGetRepositories(),
      create: () => mockCreateRepository(),
      update: () => mockUpdateRepository(),
      delete: () => mockDeleteRepository(),
      getById: () => mockGetRepository(),
      sync: () => mockSyncRepository(),
    },
  },
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const TestApp = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Repositories />} />
          <Route path="/repositories/:id" element={<RepositoryDetail />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

describe('Repository Management Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    queryClient.clear()
    
    // Set auth token
    localStorage.setItem('auth_token', 'test-token')
    
    // Mock initial empty state
    mockGetRepositories.mockResolvedValue([])
  })

  it('should create a new repository', async () => {
    const user = userEvent.setup()
    
    const newRepo = {
      id: 1,
      name: 'test-repo',
      url: 'https://github.com/user/test-repo',
      description: 'Test repository',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockCreateRepository.mockResolvedValueOnce(newRepo)
    mockGetRepositories.mockResolvedValueOnce([newRepo])

    render(<TestApp />)

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText(/add repository/i)).toBeInTheDocument()
    })

    // Click add repository button
    const addButton = screen.getByText(/add repository/i)
    await user.click(addButton)

    // Fill in the form
    const nameInput = screen.getByLabelText(/repository name/i)
    const urlInput = screen.getByLabelText(/repository url/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    await user.type(nameInput, 'test-repo')
    await user.type(urlInput, 'https://github.com/user/test-repo')
    await user.type(descriptionInput, 'Test repository')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create repository/i })
    await user.click(submitButton)

    // Verify API was called
    await waitFor(() => {
      expect(mockCreateRepository).toHaveBeenCalledWith({
        name: 'test-repo',
        url: 'https://github.com/user/test-repo',
        description: 'Test repository',
      })
    })

    // Verify repository appears in the list
    await waitFor(() => {
      expect(screen.getByText('test-repo')).toBeInTheDocument()
    })
  })

  it('should update an existing repository', async () => {
    const user = userEvent.setup()
    
    const existingRepo = {
      id: 1,
      name: 'old-repo',
      url: 'https://github.com/user/old-repo',
      description: 'Old description',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockGetRepositories.mockResolvedValue([existingRepo])
    mockGetRepository.mockResolvedValue(existingRepo)

    render(<TestApp />)

    // Wait for repository to appear
    await waitFor(() => {
      expect(screen.getByText('old-repo')).toBeInTheDocument()
    })

    // Click on the repository to view details
    const repoCard = screen.getByText('old-repo')
    await user.click(repoCard)

    // Wait for detail page to load
    await waitFor(() => {
      expect(screen.getByText(/edit repository/i)).toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByText(/edit repository/i)
    await user.click(editButton)

    // Update the description
    const descriptionInput = screen.getByLabelText(/description/i)
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')

    // Mock update response
    const updatedRepo = {
      ...existingRepo,
      description: 'Updated description',
      updatedAt: new Date().toISOString(),
    }
    
    mockUpdateRepository.mockResolvedValueOnce(updatedRepo)
    mockGetRepository.mockResolvedValueOnce(updatedRepo)

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Verify API was called
    await waitFor(() => {
      expect(mockUpdateRepository).toHaveBeenCalledWith(1, {
        description: 'Updated description',
      })
    })

    // Verify updated description appears
    await waitFor(() => {
      expect(screen.getByText('Updated description')).toBeInTheDocument()
    })
  })

  it('should delete a repository', async () => {
    const user = userEvent.setup()
    
    const existingRepo = {
      id: 1,
      name: 'repo-to-delete',
      url: 'https://github.com/user/repo-to-delete',
      description: 'This will be deleted',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockGetRepositories.mockResolvedValue([existingRepo])

    render(<TestApp />)

    // Wait for repository to appear
    await waitFor(() => {
      expect(screen.getByText('repo-to-delete')).toBeInTheDocument()
    })

    // Find and click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })

    mockDeleteRepository.mockResolvedValueOnce({ success: true })
    mockGetRepositories.mockResolvedValueOnce([])

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    // Verify API was called
    await waitFor(() => {
      expect(mockDeleteRepository).toHaveBeenCalledWith(1)
    })

    // Verify repository is removed
    await waitFor(() => {
      expect(screen.queryByText('repo-to-delete')).not.toBeInTheDocument()
    })
  })

  it('should sync repository data', async () => {
    const user = userEvent.setup()
    
    const repo = {
      id: 1,
      name: 'repo-to-sync',
      url: 'https://github.com/user/repo-to-sync',
      description: 'Repository needing sync',
      isActive: true,
      lastSyncedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockGetRepositories.mockResolvedValue([repo])
    mockGetRepository.mockResolvedValue(repo)

    render(<TestApp />)

    // Navigate to repository detail
    await waitFor(() => {
      expect(screen.getByText('repo-to-sync')).toBeInTheDocument()
    })

    const repoCard = screen.getByText('repo-to-sync')
    await user.click(repoCard)

    // Wait for sync button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument()
    })

    // Mock sync response
    const syncedRepo = {
      ...repo,
      lastSyncedAt: new Date().toISOString(),
    }
    
    mockSyncRepository.mockResolvedValueOnce(syncedRepo)
    mockGetRepository.mockResolvedValueOnce(syncedRepo)

    // Click sync button
    const syncButton = screen.getByRole('button', { name: /sync/i })
    await user.click(syncButton)

    // Verify loading state
    expect(screen.getByText(/syncing/i)).toBeInTheDocument()

    // Verify API was called
    await waitFor(() => {
      expect(mockSyncRepository).toHaveBeenCalledWith(1)
    })

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/sync completed/i)).toBeInTheDocument()
    })
  })

  it('should handle repository URL validation', async () => {
    const user = userEvent.setup()

    render(<TestApp />)

    // Click add repository button
    const addButton = screen.getByText(/add repository/i)
    await user.click(addButton)

    // Try to submit with invalid URL
    const nameInput = screen.getByLabelText(/repository name/i)
    const urlInput = screen.getByLabelText(/repository url/i)

    await user.type(nameInput, 'test-repo')
    await user.type(urlInput, 'not-a-valid-url')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create repository/i })
    await user.click(submitButton)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/invalid repository url/i)).toBeInTheDocument()
    })

    // Verify API was not called
    expect(mockCreateRepository).not.toHaveBeenCalled()
  })

  it('should filter repositories by status', async () => {
    const user = userEvent.setup()
    
    const repositories = [
      {
        id: 1,
        name: 'active-repo',
        url: 'https://github.com/user/active-repo',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'inactive-repo',
        url: 'https://github.com/user/inactive-repo',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    
    mockGetRepositories.mockResolvedValue(repositories)

    render(<TestApp />)

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('active-repo')).toBeInTheDocument()
      expect(screen.getByText('inactive-repo')).toBeInTheDocument()
    })

    // Apply filter for active only
    const filterButton = screen.getByText(/filter/i)
    await user.click(filterButton)

    const activeOnlyCheckbox = screen.getByLabelText(/active only/i)
    await user.click(activeOnlyCheckbox)

    // Verify only active repo is visible
    await waitFor(() => {
      expect(screen.getByText('active-repo')).toBeInTheDocument()
      expect(screen.queryByText('inactive-repo')).not.toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    mockCreateRepository.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Repository already exists',
        },
      },
    })

    render(<TestApp />)

    // Click add repository button
    const addButton = screen.getByText(/add repository/i)
    await user.click(addButton)

    // Fill in the form
    const nameInput = screen.getByLabelText(/repository name/i)
    const urlInput = screen.getByLabelText(/repository url/i)

    await user.type(nameInput, 'existing-repo')
    await user.type(urlInput, 'https://github.com/user/existing-repo')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create repository/i })
    await user.click(submitButton)

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/repository already exists/i)).toBeInTheDocument()
    })
  })
})