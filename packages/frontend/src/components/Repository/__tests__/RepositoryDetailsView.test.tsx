import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RepositoryDetailsView } from '../RepositoryDetailsView';
import { RepositoryService } from '../../../services/repositoryService';

// Mock the RepositoryService
vi.mock('../../../services/repositoryService', () => ({
  RepositoryService: {
    getRepositoryDetails: vi.fn(),
    checkoutBranch: vi.fn(),
    fetchRepository: vi.fn(),
    pullRepository: vi.fn(),
    extractRepositoryMetadata: vi.fn(),
    extractBranchInfo: vi.fn(),
  },
}));

const mockRepositoryDetails = {
  name: 'test-repository',
  path: '/Users/john/projects/test-repository',
  currentBranch: 'main',
  lastCommit: {
    hash: 'abc123def456789',
    date: '2023-01-15T10:30:00.000Z',
    message: 'Add new feature for user management',
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
    conflicted: 0,
    ahead: 0,
    behind: 0
  },
  remotes: [
    { name: 'origin', url: 'https://github.com/user/repo.git' }
  ],
  branches: [
    {
      name: 'main',
      isLocal: true,
      isRemote: true,
      isCurrent: true,
      lastCommit: {
        hash: 'abc123def456789',
        date: '2023-01-15T10:30:00.000Z',
        message: 'Add new feature for user management',
        author: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      tracking: {
        remote: 'origin/main',
        ahead: 0,
        behind: 0
      }
    },
    {
      name: 'feature/auth',
      isLocal: true,
      isRemote: false,
      isCurrent: false,
      lastCommit: {
        hash: 'def456ghi789abc',
        date: '2023-01-14T14:20:00.000Z',
        message: 'Implement authentication',
        author: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      },
      tracking: {
        remote: 'origin/main',
        ahead: 2,
        behind: 0
      }
    }
  ]
};

const mockMetadata = {
  name: mockRepositoryDetails.name,
  path: mockRepositoryDetails.path,
  currentBranch: mockRepositoryDetails.currentBranch,
  lastCommit: mockRepositoryDetails.lastCommit,
  status: mockRepositoryDetails.status,
};

const mockBranches = mockRepositoryDetails.branches;

describe('RepositoryDetailsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(RepositoryService.getRepositoryDetails).mockResolvedValue({
      success: true,
      data: mockRepositoryDetails,
    });
    
    vi.mocked(RepositoryService.extractRepositoryMetadata).mockReturnValue(mockMetadata);
    vi.mocked(RepositoryService.extractBranchInfo).mockReturnValue(mockBranches);
  });

  it('renders repository details view correctly', async () => {
    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText((_, element) => 
        element?.textContent === '📁 test-repository'
      )).toBeInTheDocument();
    });

    // Check for header controls
    expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
    expect(screen.getByText('📥 Fetch')).toBeInTheDocument();
    expect(screen.getByText('⬇️ Pull')).toBeInTheDocument();

    // Check for repository metadata
    expect(screen.getByText((_, element) => 
      element?.textContent === '🌿 main'
    )).toBeInTheDocument();

    // Check for branch list
    expect(screen.getByText('Branches (2)')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('feature/auth')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    vi.mocked(RepositoryService.getRepositoryDetails).mockReturnValue(
      new Promise(() => {}) // Never resolves to keep loading
    );

    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    expect(screen.getByRole('button', { name: /refresh/i })).toBeDisabled();
  });

  it('displays error state correctly', async () => {
    vi.mocked(RepositoryService.getRepositoryDetails).mockResolvedValue({
      success: false,
      error: 'Repository not found',
    });

    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load repository')).toBeInTheDocument();
      expect(screen.getByText('Repository not found')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    await waitFor(() => {
      expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('🔄 Refresh');
    fireEvent.click(refreshButton);

    // Should call the API again
    await waitFor(() => {
      expect(RepositoryService.getRepositoryDetails).toHaveBeenCalledTimes(2);
    });
  });

  it('handles fetch button click', async () => {
    vi.mocked(RepositoryService.fetchRepository).mockResolvedValue({
      success: true,
      data: { success: true, message: 'Fetched successfully' },
    });

    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    await waitFor(() => {
      expect(screen.getByText('📥 Fetch')).toBeInTheDocument();
    });

    const fetchButton = screen.getByText('📥 Fetch');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(RepositoryService.fetchRepository).toHaveBeenCalledWith('test-repo-1');
    });
  });

  it('handles pull button click', async () => {
    vi.mocked(RepositoryService.pullRepository).mockResolvedValue({
      success: true,
      data: { success: true, message: 'Pulled successfully' },
    });

    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    await waitFor(() => {
      expect(screen.getByText('⬇️ Pull')).toBeInTheDocument();
    });

    const pullButton = screen.getByText('⬇️ Pull');
    fireEvent.click(pullButton);

    await waitFor(() => {
      expect(RepositoryService.pullRepository).toHaveBeenCalledWith('test-repo-1');
    });
  });

  it('handles branch checkout', async () => {
    vi.mocked(RepositoryService.checkoutBranch).mockResolvedValue({
      success: true,
      data: { success: true, message: 'Checked out successfully' },
    });

    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    await waitFor(() => {
      expect(screen.getByTitle('Checkout branch: feature/auth')).toBeInTheDocument();
    });

    const checkoutButton = screen.getByTitle('Checkout branch: feature/auth');
    fireEvent.click(checkoutButton);

    await waitFor(() => {
      expect(RepositoryService.checkoutBranch).toHaveBeenCalledWith('test-repo-1', 'feature/auth');
    });
  });

  it('displays basic mode correctly', async () => {
    render(<RepositoryDetailsView repositoryId="test-repo-1" mode="basic" />);

    await waitFor(() => {
      expect(screen.getByText((_, element) => 
        element?.textContent === '📁 test-repository'
      )).toBeInTheDocument();
    });

    // Should not show branch list in basic mode
    expect(screen.queryByText('Branches (2)')).not.toBeInTheDocument();
    
    // Should show quick stats instead
    expect(screen.getByText('Branches:')).toBeInTheDocument();
    expect(screen.getByText('Local:')).toBeInTheDocument();
    expect(screen.getByText('Remote:')).toBeInTheDocument();
  });

  it('calls onRepositoryClick when repository is clicked', async () => {
    const mockRepositoryClick = vi.fn();
    
    render(
      <RepositoryDetailsView 
        repositoryId="test-repo-1" 
        onRepositoryClick={mockRepositoryClick}
      />
    );

    await waitFor(() => {
      expect(screen.getByText((_, element) => 
        element?.textContent === '📁 test-repository'
      )).toBeInTheDocument();
    });

    const repositoryName = screen.getByText((_, element) => 
      element?.textContent === '📁 test-repository'
    );
    fireEvent.click(repositoryName);

    expect(mockRepositoryClick).toHaveBeenCalledWith('test-repo-1');
  });

  it('calls onBranchClick when branch is clicked', async () => {
    const mockBranchClick = vi.fn();
    
    render(
      <RepositoryDetailsView 
        repositoryId="test-repo-1" 
        onBranchClick={mockBranchClick}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('main')).toBeInTheDocument();
    });

    const branchName = screen.getByText('main').closest('.branch-item');
    fireEvent.click(branchName!);

    expect(mockBranchClick).toHaveBeenCalledWith('test-repo-1', 'main');
  });

  it('shows success notification on successful action', async () => {
    vi.mocked(RepositoryService.fetchRepository).mockResolvedValue({
      success: true,
      data: { success: true, message: 'Fetch completed successfully' },
    });

    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    await waitFor(() => {
      expect(screen.getByText('📥 Fetch')).toBeInTheDocument();
    });

    const fetchButton = screen.getByText('📥 Fetch');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Fetch completed successfully')).toBeInTheDocument();
    });
  });

  it('shows error notification on failed action', async () => {
    vi.mocked(RepositoryService.fetchRepository).mockResolvedValue({
      success: false,
      error: 'Network error occurred',
    });

    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    await waitFor(() => {
      expect(screen.getByText('📥 Fetch')).toBeInTheDocument();
    });

    const fetchButton = screen.getByText('📥 Fetch');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });
  });

  it('dismisses notifications when clicked', async () => {
    vi.mocked(RepositoryService.fetchRepository).mockResolvedValue({
      success: true,
      data: { success: true, message: 'Test notification' },
    });

    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    await waitFor(() => {
      expect(screen.getByText('📥 Fetch')).toBeInTheDocument();
    });

    const fetchButton = screen.getByText('📥 Fetch');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });

    const notification = screen.getByText('Test notification').closest('.notification');
    fireEvent.click(notification!);

    await waitFor(() => {
      expect(screen.queryByText('Test notification')).not.toBeInTheDocument();
    });
  });

  it('applies custom className correctly', () => {
    const { container } = render(
      <RepositoryDetailsView repositoryId="test-repo-1" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('repository-details-view', 'custom-class');
  });

  it('disables action buttons during actions', async () => {
    // Mock a slow action
    vi.mocked(RepositoryService.fetchRepository).mockReturnValue(
      new Promise(() => {}) // Never resolves to keep loading
    );

    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    await waitFor(() => {
      expect(screen.getByText('📥 Fetch')).toBeInTheDocument();
    });

    const fetchButton = screen.getByText('📥 Fetch');
    fireEvent.click(fetchButton);

    // All action buttons should be disabled during the action
    await waitFor(() => {
      expect(screen.getByText('📥 Fetch')).toBeDisabled();
      expect(screen.getByText('⬇️ Pull')).toBeDisabled();
    });
  });

  it('shows last update time', async () => {
    render(<RepositoryDetailsView repositoryId="test-repo-1" />);

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });

  it('handles auto-refresh with custom interval', async () => {
    const { unmount } = render(
      <RepositoryDetailsView repositoryId="test-repo-1" refreshInterval={1000} />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(RepositoryService.getRepositoryDetails).toHaveBeenCalledTimes(1);
    });

    // Wait for auto-refresh (should happen after 1 second)
    await waitFor(() => {
      expect(RepositoryService.getRepositoryDetails).toHaveBeenCalledTimes(2);
    }, { timeout: 2000 });

    unmount();
  });
});