import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectList } from '../ProjectList';
import type { Project } from '../ProjectList';

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'TaskMaster UI',
    repositoryId: 'repo-1',
    repositoryName: 'taskmaster-ui',
    repositoryPath: '/Users/john/projects/taskmaster-ui',
    createdAt: '2023-01-15T10:30:00.000Z',
    lastAccessed: '2023-01-16T14:20:00.000Z',
    tasksCount: 25,
    status: 'active'
  },
  {
    id: 'proj-2',
    name: 'Backend API',
    repositoryId: 'repo-2',
    repositoryName: 'backend-api',
    repositoryPath: '/Users/john/projects/backend-api',
    createdAt: '2023-01-10T09:15:00.000Z',
    lastAccessed: '2023-01-15T11:45:00.000Z',
    tasksCount: 18,
    status: 'active'
  },
  {
    id: 'proj-3',
    name: 'Legacy Migration',
    repositoryId: 'repo-3',
    repositoryName: 'legacy-system',
    repositoryPath: '/Users/john/projects/legacy-system',
    createdAt: '2022-12-20T16:00:00.000Z',
    tasksCount: 42,
    status: 'inactive'
  }
];

describe('ProjectList', () => {
  it('renders project list with projects', () => {
    render(<ProjectList projects={mockProjects} />);

    expect(screen.getByText('Projects (3)')).toBeInTheDocument();
    expect(screen.getByText('TaskMaster UI')).toBeInTheDocument();
    expect(screen.getByText('Backend API')).toBeInTheDocument();
    expect(screen.getByText('Legacy Migration')).toBeInTheDocument();
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('displays project statistics', () => {
    render(<ProjectList projects={mockProjects} />);

    expect(screen.getByText('🟢 2 active')).toBeInTheDocument();
    expect(screen.getByText('📊 85 total tasks')).toBeInTheDocument();
  });

  it('shows project details correctly', () => {
    render(<ProjectList projects={mockProjects} />);

    // Check first project details
    expect(screen.getByText('TaskMaster UI')).toBeInTheDocument();
    expect(screen.getByText('taskmaster-ui')).toBeInTheDocument();
    expect(screen.getByText('/Users/john/projects/taskmaster-ui')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('tasks')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    const { container } = render(<ProjectList projects={[]} isLoading={true} />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(container.querySelectorAll('.skeleton-line').length).toBeGreaterThan(0);
    expect(screen.getByText('New Project')).toBeDisabled();
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to load projects';
    render(<ProjectList projects={[]} error={errorMessage} />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('New Project')).not.toBeDisabled();
  });

  it('displays empty state', () => {
    render(<ProjectList projects={[]} />);

    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.getByText('Create Your First Project')).toBeInTheDocument();
  });

  it('displays custom empty state message', () => {
    const customMessage = 'Custom empty message';
    render(<ProjectList projects={[]} emptyStateMessage={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('hides create button when showCreateButton is false', () => {
    render(<ProjectList projects={mockProjects} showCreateButton={false} />);

    expect(screen.queryByText('New Project')).not.toBeInTheDocument();
  });

  it('calls onProjectClick when project is clicked', () => {
    const mockOnProjectClick = vi.fn();
    render(<ProjectList projects={mockProjects} onProjectClick={mockOnProjectClick} />);

    const projectItem = screen.getByText('TaskMaster UI').closest('.project-item');
    fireEvent.click(projectItem!);

    expect(mockOnProjectClick).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('calls onCreateProject when create button is clicked', () => {
    const mockOnCreateProject = vi.fn();
    render(<ProjectList projects={mockProjects} onCreateProject={mockOnCreateProject} />);

    fireEvent.click(screen.getByText('New Project'));
    expect(mockOnCreateProject).toHaveBeenCalled();
  });

  it('calls onCreateProject when empty state button is clicked', () => {
    const mockOnCreateProject = vi.fn();
    render(<ProjectList projects={[]} onCreateProject={mockOnCreateProject} />);

    fireEvent.click(screen.getByText('Create Your First Project'));
    expect(mockOnCreateProject).toHaveBeenCalled();
  });

  it('handles keyboard navigation for projects', () => {
    const mockOnProjectClick = vi.fn();
    render(<ProjectList projects={mockProjects} onProjectClick={mockOnProjectClick} />);

    const projectItem = screen.getByText('TaskMaster UI').closest('.project-item');
    
    // Test Enter key
    fireEvent.keyDown(projectItem!, { key: 'Enter' });
    expect(mockOnProjectClick).toHaveBeenCalledWith(mockProjects[0]);

    // Test Space key
    fireEvent.keyDown(projectItem!, { key: ' ' });
    expect(mockOnProjectClick).toHaveBeenCalledTimes(2);

    // Test other key (should not trigger)
    fireEvent.keyDown(projectItem!, { key: 'Escape' });
    expect(mockOnProjectClick).toHaveBeenCalledTimes(2);
  });

  it('displays correct status icons and labels', () => {
    render(<ProjectList projects={mockProjects} />);

    // Active projects should show green icon
    const activeProjects = screen.getAllByText('Active');
    expect(activeProjects).toHaveLength(2);

    // Inactive project should show appropriate icon
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    // Mock current date to make tests predictable
    const mockDate = new Date('2023-01-17T12:00:00.000Z');
    vi.setSystemTime(mockDate);

    render(<ProjectList projects={mockProjects} />);

    // Should show "Yesterday" for projects accessed 1 day ago
    expect(screen.getByText('Last accessed Yesterday')).toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProjectList projects={mockProjects} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('project-list', 'custom-class');
  });

  it('shows project without lastAccessed correctly', () => {
    const projectsWithoutLastAccessed = [
      {
        ...mockProjects[0],
        lastAccessed: undefined
      }
    ];

    render(<ProjectList projects={projectsWithoutLastAccessed} />);

    expect(screen.getByText('TaskMaster UI')).toBeInTheDocument();
    expect(screen.queryByText(/Last accessed/)).not.toBeInTheDocument();
  });

  it('shows project without tasksCount correctly', () => {
    const projectsWithoutTasksCount = [
      {
        ...mockProjects[0],
        tasksCount: undefined
      }
    ];

    render(<ProjectList projects={projectsWithoutTasksCount} />);

    expect(screen.getByText('TaskMaster UI')).toBeInTheDocument();
    // Should not show tasks stat badge
    expect(screen.queryByText('tasks')).not.toBeInTheDocument();
  });

  it('handles projects with no status', () => {
    const projectsWithoutStatus = [
      {
        ...mockProjects[0],
        status: undefined
      }
    ];

    render(<ProjectList projects={projectsWithoutStatus} />);

    expect(screen.getByText('TaskMaster UI')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('🟡')).toBeInTheDocument();
  });

  it('displays archived project correctly', () => {
    const archivedProject = [
      {
        ...mockProjects[0],
        status: 'archived' as const
      }
    ];

    render(<ProjectList projects={archivedProject} />);

    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.getByText('📁')).toBeInTheDocument();
  });

  it('shows correct total in statistics', () => {
    render(<ProjectList projects={mockProjects} />);

    // Total tasks: 25 + 18 + 42 = 85
    expect(screen.getByText('📊 85 total tasks')).toBeInTheDocument();
    // Active projects: 2 out of 3
    expect(screen.getByText('🟢 2 active')).toBeInTheDocument();
  });

  it('handles edge case with invalid dates', () => {
    const projectWithInvalidDate = [
      {
        ...mockProjects[0],
        createdAt: 'invalid-date',
        lastAccessed: 'invalid-date'
      }
    ];

    render(<ProjectList projects={projectWithInvalidDate} />);

    expect(screen.getByText('TaskMaster UI')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('Last accessed Unknown')).toBeInTheDocument();
  });
});