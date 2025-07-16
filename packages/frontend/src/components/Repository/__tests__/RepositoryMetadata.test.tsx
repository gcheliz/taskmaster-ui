import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RepositoryMetadata } from '../RepositoryMetadata';
import type { RepositoryMetadataData } from '../RepositoryMetadata';

const mockRepository: RepositoryMetadataData = {
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
  }
};

describe('RepositoryMetadata', () => {
  it('renders repository metadata correctly', () => {
    render(<RepositoryMetadata repository={mockRepository} />);

    expect(screen.getByText((_, element) => 
      element?.textContent === '📁 test-repository'
    )).toBeInTheDocument();
    expect(screen.getByText((_, element) => 
      element?.textContent === '🌿 main'
    )).toBeInTheDocument();
    expect(screen.getByText('abc123d')).toBeInTheDocument();
    expect(screen.getByText('Add new feature for user management')).toBeInTheDocument();
    expect(screen.getByText('by John Doe')).toBeInTheDocument();
  });

  it('shows full path when showFullPath is true', () => {
    render(<RepositoryMetadata repository={mockRepository} showFullPath={true} />);

    expect(screen.getByText((_, element) => 
      element?.textContent === '📁 /Users/john/projects/test-repository'
    )).toBeInTheDocument();
  });

  it('hides commit details when showCommitDetails is false', () => {
    render(<RepositoryMetadata repository={mockRepository} showCommitDetails={false} />);

    expect(screen.queryByText('abc123d')).not.toBeInTheDocument();
    expect(screen.queryByText('Add new feature for user management')).not.toBeInTheDocument();
    expect(screen.queryByText('by John Doe')).not.toBeInTheDocument();
  });

  it('displays clean status indicator correctly', () => {
    render(<RepositoryMetadata repository={mockRepository} />);

    expect(screen.getByText('Clean')).toBeInTheDocument();
    const statusIndicator = screen.getByTitle('Working directory is clean');
    expect(statusIndicator).toHaveClass('status-clean');
  });

  it('displays dirty status with changes count', () => {
    const dirtyRepository = {
      ...mockRepository,
      status: {
        isClean: false,
        staged: 2,
        unstaged: 1,
        untracked: 3,
        conflicted: 0,
        ahead: 0,
        behind: 0
      }
    };

    render(<RepositoryMetadata repository={dirtyRepository} />);

    expect(screen.getByText('6 changes')).toBeInTheDocument();
    expect(screen.getByText('📄 2')).toBeInTheDocument(); // staged
    expect(screen.getByText('📝 1')).toBeInTheDocument(); // unstaged
    expect(screen.getByText('❓ 3')).toBeInTheDocument(); // untracked
  });

  it('displays conflicted status correctly', () => {
    const conflictedRepository = {
      ...mockRepository,
      status: {
        isClean: false,
        staged: 0,
        unstaged: 0,
        untracked: 0,
        conflicted: 2,
        ahead: 0,
        behind: 0
      }
    };

    render(<RepositoryMetadata repository={conflictedRepository} />);

    expect(screen.getByText('Conflicts')).toBeInTheDocument();
    expect(screen.getByText('⚠️ 2')).toBeInTheDocument();
    const statusIndicator = screen.getByTitle('2 conflicted file(s)');
    expect(statusIndicator).toHaveClass('status-conflicted');
  });

  it('displays branch tracking information', () => {
    const trackingRepository = {
      ...mockRepository,
      status: {
        ...mockRepository.status,
        ahead: 2,
        behind: 1
      }
    };

    render(<RepositoryMetadata repository={trackingRepository} />);

    expect(screen.getByText('↑2')).toBeInTheDocument();
    expect(screen.getByText('↓1')).toBeInTheDocument();
    expect(screen.getByTitle('2 commits ahead')).toBeInTheDocument();
    expect(screen.getByTitle('1 commits behind')).toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    const mockRepositoryClick = vi.fn();
    const mockBranchClick = vi.fn();

    render(
      <RepositoryMetadata 
        repository={mockRepository}
        onRepositoryClick={mockRepositoryClick}
        onBranchClick={mockBranchClick}
      />
    );

    fireEvent.click(screen.getByText((_, element) => 
      element?.textContent === '📁 test-repository'
    ));
    expect(mockRepositoryClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText((_, element) => 
      element?.textContent === '🌿 main'
    ));
    expect(mockBranchClick).toHaveBeenCalledTimes(1);
  });

  it('formats commit hash correctly', () => {
    render(<RepositoryMetadata repository={mockRepository} />);

    expect(screen.getByText('abc123d')).toBeInTheDocument();
    expect(screen.getByTitle('abc123def456789')).toBeInTheDocument();
  });

  it('formats relative dates correctly', () => {
    // Create a recent date (1 hour ago)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentRepository = {
      ...mockRepository,
      lastCommit: {
        ...mockRepository.lastCommit,
        date: oneHourAgo
      }
    };

    render(<RepositoryMetadata repository={recentRepository} />);

    expect(screen.getByText('1h ago')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    const { container } = render(<RepositoryMetadata repository={mockRepository} isLoading={true} />);

    expect(container.querySelector('.repository-metadata__skeleton')).toBeInTheDocument();
    expect(screen.queryByText((_, element) => 
      element?.textContent === '📁 test-repository'
    )).not.toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const errorMessage = 'Failed to load repository data';
    render(<RepositoryMetadata repository={mockRepository} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.queryByText((_, element) => 
      element?.textContent === '📁 test-repository'
    )).not.toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    const { container } = render(
      <RepositoryMetadata repository={mockRepository} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('repository-metadata', 'custom-class');
  });

  it('shows changes section only when repository is dirty', () => {
    // Clean repository
    render(<RepositoryMetadata repository={mockRepository} />);
    expect(screen.queryByText('📄')).not.toBeInTheDocument();

    // Dirty repository
    const dirtyRepository = {
      ...mockRepository,
      status: {
        ...mockRepository.status,
        isClean: false,
        staged: 1
      }
    };

    render(<RepositoryMetadata repository={dirtyRepository} />);
    expect(screen.getByText('📄 1')).toBeInTheDocument();
  });

  it('handles long commit messages gracefully', () => {
    const longMessageRepository = {
      ...mockRepository,
      lastCommit: {
        ...mockRepository.lastCommit,
        message: 'This is a very long commit message that should be truncated properly when displayed in the UI to ensure it does not break the layout or become unreadable'
      }
    };

    render(<RepositoryMetadata repository={longMessageRepository} />);

    const commitMessage = screen.getByText(longMessageRepository.lastCommit.message);
    expect(commitMessage).toBeInTheDocument();
    expect(commitMessage).toHaveClass('commit-message');
  });

  it('handles repository names with special characters', () => {
    const specialNameRepository = {
      ...mockRepository,
      name: 'my-awesome-project_v2.0',
      path: '/Users/john/projects/my-awesome-project_v2.0'
    };

    render(<RepositoryMetadata repository={specialNameRepository} />);

    expect(screen.getByText((_, element) => 
      element?.textContent === '📁 my-awesome-project_v2.0'
    )).toBeInTheDocument();
  });

  it('displays tooltip information correctly', () => {
    const dirtyRepository = {
      ...mockRepository,
      status: {
        isClean: false,
        staged: 2,
        unstaged: 1,
        untracked: 3,
        conflicted: 0,
        ahead: 0,
        behind: 0
      }
    };

    render(<RepositoryMetadata repository={dirtyRepository} />);

    expect(screen.getByTitle('2 staged, 1 unstaged, 3 untracked')).toBeInTheDocument();
    expect(screen.getByTitle('Staged files')).toBeInTheDocument();
    expect(screen.getByTitle('Unstaged files')).toBeInTheDocument();
    expect(screen.getByTitle('Untracked files')).toBeInTheDocument();
  });

  it('handles single change correctly (singular vs plural)', () => {
    const singleChangeRepository = {
      ...mockRepository,
      status: {
        isClean: false,
        staged: 1,
        unstaged: 0,
        untracked: 0,
        conflicted: 0,
        ahead: 0,
        behind: 0
      }
    };

    render(<RepositoryMetadata repository={singleChangeRepository} />);

    expect(screen.getByText('1 change')).toBeInTheDocument(); // singular
  });

  it('shows clickable indicators when handlers are provided', () => {
    const mockRepositoryClick = vi.fn();
    const mockBranchClick = vi.fn();

    render(
      <RepositoryMetadata 
        repository={mockRepository}
        onRepositoryClick={mockRepositoryClick}
        onBranchClick={mockBranchClick}
      />
    );

    const repositoryName = screen.getByText((_, element) => 
      element?.textContent === '📁 test-repository'
    );
    const branchName = screen.getByText((_, element) => 
      element?.textContent === '🌿 main'
    );

    expect(repositoryName).toHaveClass('clickable');
    expect(branchName).toHaveClass('clickable');
  });

  it('handles edge case with invalid date', () => {
    const invalidDateRepository = {
      ...mockRepository,
      lastCommit: {
        ...mockRepository.lastCommit,
        date: 'invalid-date'
      }
    };

    render(<RepositoryMetadata repository={invalidDateRepository} />);

    expect(screen.getByText('Invalid Date')).toBeInTheDocument();
  });
});