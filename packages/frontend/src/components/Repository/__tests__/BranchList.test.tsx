import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BranchList } from '../BranchList';
import type { BranchInfo } from '../BranchList';

const mockBranches: BranchInfo[] = [
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
    name: 'feature/authentication',
    isLocal: true,
    isRemote: false,
    isCurrent: false,
    lastCommit: {
      hash: 'def456ghi789abc',
      date: '2023-01-14T14:20:00.000Z',
      message: 'Implement JWT authentication system',
      author: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    },
    tracking: {
      remote: 'origin/main',
      ahead: 3,
      behind: 1
    }
  },
  {
    name: 'origin/develop',
    isLocal: false,
    isRemote: true,
    isCurrent: false,
    lastCommit: {
      hash: 'ghi789abc123def',
      date: '2023-01-13T09:15:00.000Z',
      message: 'Update dependencies and fix security vulnerabilities',
      author: {
        name: 'Bob Johnson',
        email: 'bob@example.com'
      }
    }
  }
];

describe('BranchList', () => {
  it('renders branch list correctly', () => {
    render(<BranchList branches={mockBranches} />);

    expect(screen.getByText('Branches (3)')).toBeInTheDocument();
    expect(screen.getByText('🌿 2 local')).toBeInTheDocument();
    expect(screen.getByText('☁️ 1 remote')).toBeInTheDocument();
    
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('feature/authentication')).toBeInTheDocument();
    expect(screen.getByText('origin/develop')).toBeInTheDocument();
  });

  it('displays current branch with special styling', () => {
    render(<BranchList branches={mockBranches} />);

    const currentBranch = screen.getByText('main').closest('.branch-item');
    expect(currentBranch).toHaveClass('current');
    expect(screen.getByText('CURRENT')).toBeInTheDocument();
    expect(screen.getByTitle('Current branch: main')).toBeInTheDocument();
  });

  it('shows correct branch icons', () => {
    render(<BranchList branches={mockBranches} />);

    // Current branch (main) should have star icon
    const mainBranch = screen.getByTitle('Current branch: main');
    expect(mainBranch.querySelector('.branch-icon')).toHaveTextContent('🌟');

    // Local branch should have branch icon
    const featureBranch = screen.getByTitle('Local branch: feature/authentication');
    expect(featureBranch.querySelector('.branch-icon')).toHaveTextContent('🌿');

    // Remote branch should have cloud icon
    const remoteBranch = screen.getByTitle('Remote branch: origin/develop');
    expect(remoteBranch.querySelector('.branch-icon')).toHaveTextContent('☁️');
  });

  it('displays tracking information correctly', () => {
    render(<BranchList branches={mockBranches} />);

    expect(screen.getByText('↑3')).toBeInTheDocument();
    expect(screen.getByText('↓1')).toBeInTheDocument();
    expect(screen.getByTitle('3 commits ahead of origin/main')).toBeInTheDocument();
    expect(screen.getByTitle('1 commits behind origin/main')).toBeInTheDocument();
  });

  it('shows commit details when enabled', () => {
    render(<BranchList branches={mockBranches} showCommitDetails={true} />);

    expect(screen.getByText('abc123d')).toBeInTheDocument();
    expect(screen.getByText('Add new feature for user management')).toBeInTheDocument();
    expect(screen.getByText('by John Doe')).toBeInTheDocument();
    expect(screen.getByTitle('abc123def456789')).toBeInTheDocument();
  });

  it('hides commit details when disabled', () => {
    render(<BranchList branches={mockBranches} showCommitDetails={false} />);

    expect(screen.queryByText('abc123d')).not.toBeInTheDocument();
    expect(screen.queryByText('Add new feature for user management')).not.toBeInTheDocument();
    expect(screen.queryByText('by John Doe')).not.toBeInTheDocument();
  });

  it('hides tracking information when disabled', () => {
    render(<BranchList branches={mockBranches} showTrackingInfo={false} />);

    expect(screen.queryByText('↑3')).not.toBeInTheDocument();
    expect(screen.queryByText('↓1')).not.toBeInTheDocument();
  });

  it('shows checkout button for non-current local branches', () => {
    const mockCheckout = vi.fn();
    render(<BranchList branches={mockBranches} onCheckoutBranch={mockCheckout} />);

    const checkoutButton = screen.getByTitle('Checkout branch: feature/authentication');
    expect(checkoutButton).toBeInTheDocument();
    expect(checkoutButton).toHaveTextContent('Checkout');

    // Current branch should not have checkout button
    expect(screen.queryByTitle('Checkout branch: main')).not.toBeInTheDocument();
    
    // Remote branch should not have checkout button
    expect(screen.queryByTitle('Checkout branch: origin/develop')).not.toBeInTheDocument();
  });

  it('handles branch click events', () => {
    const mockBranchClick = vi.fn();
    render(<BranchList branches={mockBranches} onBranchClick={mockBranchClick} />);

    const mainBranch = screen.getByText('main').closest('.branch-item');
    expect(mainBranch).toHaveClass('clickable');

    fireEvent.click(mainBranch!);
    expect(mockBranchClick).toHaveBeenCalledTimes(1);
    expect(mockBranchClick).toHaveBeenCalledWith(mockBranches[0]);
  });

  it('handles checkout button clicks', () => {
    const mockCheckout = vi.fn();
    const mockBranchClick = vi.fn();
    render(
      <BranchList 
        branches={mockBranches} 
        onCheckoutBranch={mockCheckout}
        onBranchClick={mockBranchClick}
      />
    );

    const checkoutButton = screen.getByTitle('Checkout branch: feature/authentication');
    fireEvent.click(checkoutButton);
    
    expect(mockCheckout).toHaveBeenCalledTimes(1);
    expect(mockCheckout).toHaveBeenCalledWith('feature/authentication');
    // Should not trigger branch click when checkout button is clicked
    expect(mockBranchClick).not.toHaveBeenCalled();
  });

  it('displays loading state correctly', () => {
    const { container } = render(<BranchList branches={[]} isLoading={true} />);

    expect(screen.getByText('Branches')).toBeInTheDocument();
    expect(container.querySelector('.branch-list__skeleton')).toBeInTheDocument();
    expect(container.querySelectorAll('.branch-item__skeleton')).toHaveLength(5);
  });

  it('displays error state correctly', () => {
    const errorMessage = 'Failed to load branches';
    render(<BranchList branches={[]} error={errorMessage} />);

    expect(screen.getByText('Branches')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('displays empty state when no branches', () => {
    render(<BranchList branches={[]} />);

    expect(screen.getByText('🌿')).toBeInTheDocument();
    expect(screen.getByText('No branches found')).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    const { container } = render(
      <BranchList branches={mockBranches} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('branch-list', 'custom-class');
  });

  it('formats commit dates correctly', () => {
    // Create a recent date (2 hours ago)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const recentBranches = [{
      ...mockBranches[0],
      lastCommit: {
        ...mockBranches[0].lastCommit,
        date: twoHoursAgo
      }
    }];

    render(<BranchList branches={recentBranches} />);
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('handles pagination with maxDisplayCount', () => {
    const manyBranches = Array.from({ length: 15 }, (_, i) => ({
      ...mockBranches[0],
      name: `branch-${i}`,
      isCurrent: i === 0
    }));

    render(<BranchList branches={manyBranches} maxDisplayCount={5} />);

    expect(screen.getByText('Branches (15)')).toBeInTheDocument();
    expect(screen.getByText('Load 5 more branches')).toBeInTheDocument();
    
    // Should show only first 5 branches initially
    expect(screen.getByText('branch-0')).toBeInTheDocument();
    expect(screen.getByText('branch-4')).toBeInTheDocument();
    expect(screen.queryByText('branch-5')).not.toBeInTheDocument();
  });

  it('loads more branches when pagination button is clicked', () => {
    const manyBranches = Array.from({ length: 15 }, (_, i) => ({
      ...mockBranches[0],
      name: `branch-${i}`,
      isCurrent: i === 0
    }));

    render(<BranchList branches={manyBranches} maxDisplayCount={5} />);

    const loadMoreButton = screen.getByText('Load 5 more branches');
    fireEvent.click(loadMoreButton);

    // Should now show more branches
    expect(screen.getByText('branch-5')).toBeInTheDocument();
    expect(screen.getByText('branch-9')).toBeInTheDocument();
    expect(screen.getByText('Load 5 more branches')).toBeInTheDocument();
  });

  it('sorts branches correctly (current first, then local, then remote)', () => {
    const unsortedBranches = [
      { ...mockBranches[2] }, // remote
      { ...mockBranches[1] }, // local
      { ...mockBranches[0] }  // current
    ];

    render(<BranchList branches={unsortedBranches} />);

    const branchNames = screen.getAllByText((_, element) => 
      element?.className === 'branch-name'
    );

    // First should be current branch
    expect(branchNames[0]).toHaveTextContent('main');

    // Second should be local branch
    expect(branchNames[1]).toHaveTextContent('feature/authentication');

    // Third should be remote branch
    expect(branchNames[2]).toHaveTextContent('origin/develop');
  });

  it('handles long branch names gracefully', () => {
    const longNameBranch = {
      ...mockBranches[0],
      name: 'feature/very-long-branch-name-that-should-be-truncated-properly',
      isCurrent: false
    };

    render(<BranchList branches={[longNameBranch]} />);

    const branchName = screen.getByText(longNameBranch.name);
    expect(branchName).toHaveClass('branch-name');
    expect(branchName).toBeInTheDocument();
  });

  it('handles branches without tracking information', () => {
    const branchWithoutTracking = {
      ...mockBranches[0],
      tracking: undefined
    };

    render(<BranchList branches={[branchWithoutTracking]} showTrackingInfo={true} />);

    expect(screen.queryByText('↑')).not.toBeInTheDocument();
    expect(screen.queryByText('↓')).not.toBeInTheDocument();
  });

  it('handles mixed local and remote branches', () => {
    const mixedBranch = {
      ...mockBranches[0],
      name: 'feature/mixed',
      isLocal: true,
      isRemote: true,
      isCurrent: false
    };

    render(<BranchList branches={[mixedBranch]} />);

    const branchIcon = screen.getByTitle('Local + Remote branch: feature/mixed')
      .querySelector('.branch-icon');
    expect(branchIcon).toHaveTextContent('🔗');
  });

  it('displays commit hash tooltip correctly', () => {
    render(<BranchList branches={mockBranches} />);

    const commitHash = screen.getByText('abc123d');
    expect(commitHash).toHaveAttribute('title', 'abc123def456789');
  });

  it('handles edge case with invalid commit date', () => {
    const invalidDateBranch = {
      ...mockBranches[0],
      lastCommit: {
        ...mockBranches[0].lastCommit,
        date: 'invalid-date'
      }
    };

    render(<BranchList branches={[invalidDateBranch]} />);

    expect(screen.getByText('Invalid Date')).toBeInTheDocument();
  });

  it('updates summary counts correctly', () => {
    const branches = [
      { ...mockBranches[0], isLocal: true, isRemote: false },  // local only
      { ...mockBranches[1], isLocal: true, isRemote: true },   // both
      { ...mockBranches[2], isLocal: false, isRemote: true }   // remote only
    ];

    render(<BranchList branches={branches} />);

    expect(screen.getByText('🌿 2 local')).toBeInTheDocument(); // first two are local
    expect(screen.getByText('☁️ 1 remote')).toBeInTheDocument(); // only third is remote-only
  });
});