import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProjectModal } from '../CreateProjectModal';
import { RepositoryService } from '../../../services/repositoryService';

// Mock the RepositoryService
vi.mock('../../../services/repositoryService', () => ({
  RepositoryService: {
    getRepositories: vi.fn(),
  },
}));

const mockRepositories = [
  {
    id: 'repo-1',
    name: 'taskmaster-ui',
    path: '/Users/john/projects/taskmaster-ui'
  },
  {
    id: 'repo-2',
    name: 'backend-api',
    path: '/Users/john/projects/backend-api'
  }
];

describe('CreateProjectModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCreateProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(RepositoryService.getRepositories).mockResolvedValue({
      success: true,
      data: mockRepositories,
    });
  });

  it('does not render when closed', () => {
    render(
      <CreateProjectModal
        isOpen={false}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });

  it('renders modal when open', async () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Repository *')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name *')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
  });

  it('loads repositories on open', async () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(RepositoryService.getRepositories).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('taskmaster-ui (/Users/john/projects/taskmaster-ui)')).toBeInTheDocument();
      expect(screen.getByText('backend-api (/Users/john/projects/backend-api)')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching repositories', () => {
    vi.mocked(RepositoryService.getRepositories).mockReturnValue(
      new Promise(() => {}) // Never resolves
    );

    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    expect(screen.getByText('Loading repositories...')).toBeInTheDocument();
  });

  it('shows error when repository loading fails', async () => {
    vi.mocked(RepositoryService.getRepositories).mockResolvedValue({
      success: false,
      error: 'Network error',
    });

    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('taskmaster-ui (/Users/john/projects/taskmaster-ui)')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Create Project');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Please select a repository')).toBeInTheDocument();
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
    });

    expect(mockOnCreateProject).not.toHaveBeenCalled();
  });

  it('validates project name format', async () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('taskmaster-ui (/Users/john/projects/taskmaster-ui)')).toBeInTheDocument();
    });

    const projectNameInput = screen.getByLabelText('Project Name *');

    // Test too short
    fireEvent.change(projectNameInput, { target: { value: 'a' } });
    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(screen.getByText('Project name must be at least 2 characters long')).toBeInTheDocument();
    });

    // Test invalid characters
    fireEvent.change(projectNameInput, { target: { value: 'test@project!' } });
    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(screen.getByText('Project name can only contain letters, numbers, spaces, hyphens, and underscores')).toBeInTheDocument();
    });

    // Test too long
    fireEvent.change(projectNameInput, { target: { value: 'a'.repeat(51) } });
    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(screen.getByText('Project name must be less than 50 characters')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockOnCreateProject.mockResolvedValue(undefined);

    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('taskmaster-ui (/Users/john/projects/taskmaster-ui)')).toBeInTheDocument();
    });

    // Select repository
    const repositorySelect = screen.getByLabelText('Repository *');
    fireEvent.change(repositorySelect, { target: { value: 'repo-1' } });

    // Enter project name
    const projectNameInput = screen.getByLabelText('Project Name *');
    fireEvent.change(projectNameInput, { target: { value: 'Test Project' } });

    // Submit form
    const createButton = screen.getByText('Create Project');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockOnCreateProject).toHaveBeenCalledWith('repo-1', 'Test Project');
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows project preview when form is valid', async () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('taskmaster-ui (/Users/john/projects/taskmaster-ui)')).toBeInTheDocument();
    });

    // Select repository
    const repositorySelect = screen.getByLabelText('Repository *');
    fireEvent.change(repositorySelect, { target: { value: 'repo-1' } });

    // Enter project name
    const projectNameInput = screen.getByLabelText('Project Name *');
    fireEvent.change(projectNameInput, { target: { value: 'Test Project' } });

    await waitFor(() => {
      expect(screen.getByText('Project Preview')).toBeInTheDocument();
      expect(screen.getByText('taskmaster-ui')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('/Users/john/projects/taskmaster-ui/.taskmaster/')).toBeInTheDocument();
    });
  });

  it('shows loading state during creation', async () => {
    mockOnCreateProject.mockReturnValue(new Promise(() => {})); // Never resolves

    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('taskmaster-ui (/Users/john/projects/taskmaster-ui)')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText('Repository *'), { target: { value: 'repo-1' } });
    fireEvent.change(screen.getByLabelText('Project Name *'), { target: { value: 'Test Project' } });

    // Submit form
    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeDisabled();
    });
  });

  it('handles creation error', async () => {
    mockOnCreateProject.mockRejectedValue(new Error('Creation failed'));

    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('taskmaster-ui (/Users/john/projects/taskmaster-ui)')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText('Repository *'), { target: { value: 'repo-1' } });
    fireEvent.change(screen.getByLabelText('Project Name *'), { target: { value: 'Test Project' } });

    // Submit form
    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(screen.getByText('Creation failed')).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('closes modal when cancel is clicked', () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when close button is clicked', () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when backdrop is clicked', () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    const backdrop = screen.getByText('Create New Project').closest('.create-project-modal');
    fireEvent.click(backdrop!);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close modal when content is clicked', () => {
    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    const content = screen.getByText('Create New Project').closest('.create-project-modal__content');
    fireEvent.click(content!);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('dismisses error banner', async () => {
    vi.mocked(RepositoryService.getRepositories).mockResolvedValue({
      success: false,
      error: 'Network error',
    });

    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Dismiss error'));

    await waitFor(() => {
      expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
        className="custom-class"
      />
    );

    expect(container.querySelector('.create-project-modal')).toHaveClass('custom-class');
  });

  it('shows empty state when no repositories', async () => {
    vi.mocked(RepositoryService.getRepositories).mockResolvedValue({
      success: true,
      data: [],
    });

    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No repositories connected')).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  it('refreshes repositories when refresh button is clicked', async () => {
    vi.mocked(RepositoryService.getRepositories)
      .mockResolvedValueOnce({
        success: true,
        data: [],
      })
      .mockResolvedValueOnce({
        success: true,
        data: mockRepositories,
      });

    render(
      <CreateProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No repositories connected')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Refresh'));

    await waitFor(() => {
      expect(RepositoryService.getRepositories).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText('taskmaster-ui (/Users/john/projects/taskmaster-ui)')).toBeInTheDocument();
    });
  });
});