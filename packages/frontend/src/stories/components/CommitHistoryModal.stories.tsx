import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CommitHistoryModal } from '../../components/Repository/CommitHistoryModal';
import { Button } from '../../components/ui/atoms/Button';
import type { CommitData } from '../../components/Repository/CommitHistoryModal';

// Mock commit history data for Storybook
const mockCommits: CommitData[] = [
  {
    hash: 'a1b2c3d4e5f6789012345678901234567890abcd',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    message:
      'Fix: Resolve issue with repository card loading state\n\n- Added proper loading spinners\n- Fixed async data handling\n- Updated error boundaries',
    author: {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
  },
  {
    hash: 'b2c3d4e5f67890123456789012345678901abcde',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    message: 'Feature: Add commit history modal component',
    author: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
    },
  },
  {
    hash: 'c3d4e5f678901234567890123456789012abcdef',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    message:
      'Refactor: Improve repository service error handling\n\nEnhanced error messages and retry logic for better user experience.',
    author: {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
    },
  },
  {
    hash: 'd4e5f67890123456789012345678901abcdef234',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    message: 'Chore: Update dependencies to latest versions',
    author: {
      name: 'Alice Wilson',
      email: 'alice.wilson@example.com',
    },
  },
  {
    hash: 'e5f67890123456789012345678901abcdef23456',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    message:
      'Docs: Add comprehensive API documentation\n\n- Document all service methods\n- Add usage examples\n- Include integration patterns\n- Update README with new features',
    author: {
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
    },
  },
  {
    hash: 'f67890123456789012345678901abcdef2345678',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    message: 'Initial project setup with TypeScript and React',
    author: {
      name: 'System Admin',
      email: 'admin@example.com',
    },
  },
];

// Mock the RepositoryService for Storybook
const mockRepositoryService = {
  getCommitHistory: async (
    repositoryId: string,
    limit: number = 50,
    branchName?: string
  ) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate pagination
    const commits = mockCommits.slice(0, limit);

    return {
      success: true,
      data: commits,
    };
  },
};

// Replace the actual service with our mock for Storybook
(window as any).__STORYBOOK_REPOSITORY_SERVICE__ = mockRepositoryService;

const meta: Meta<typeof CommitHistoryModal> = {
  title: 'Components/Repository/CommitHistoryModal',
  component: CommitHistoryModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The CommitHistoryModal component provides a comprehensive view of repository commit history with the following features:

- **Pagination**: Loads commits in batches with "Load More" functionality
- **Search**: Filter commits by message, author, or hash
- **Real-time formatting**: Shows relative timestamps (e.g., "2h ago", "3d ago")
- **Copy functionality**: Click on commit hashes to copy to clipboard
- **Detailed messages**: Expandable full commit messages for multi-line commits
- **Keyboard navigation**: Full keyboard accessibility support
- **Loading states**: Proper loading indicators and error handling

### Usage

The modal integrates with the repository card system and can be triggered from the "Commits" button on repository cards.
        `,
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    repositoryId: {
      control: 'text',
      description: 'Repository ID to fetch commits for',
    },
    repositoryName: {
      control: 'text',
      description: 'Repository name for display',
    },
    branchName: {
      control: 'text',
      description: 'Branch name to filter commits (optional)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommitHistoryModal>;

// Interactive story that shows the modal in action
const ModalDemo = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} variant="primary">
        Open Commit History Modal
      </Button>

      <CommitHistoryModal {...args} open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
};

export const Default: Story = {
  render: ModalDemo,
  args: {
    repositoryId: 'repo-123',
    repositoryName: 'taskmaster-ui',
    branchName: 'main',
  },
};

export const WithLongBranchName: Story = {
  render: ModalDemo,
  args: {
    repositoryId: 'repo-456',
    repositoryName: 'my-awesome-project',
    branchName:
      'feature/implement-advanced-commit-history-with-search-and-pagination',
  },
};

export const ProductionRepository: Story = {
  render: ModalDemo,
  args: {
    repositoryId: 'prod-repo',
    repositoryName: 'production-app',
    branchName: 'release/v2.1.0',
  },
};

// Story that opens the modal automatically for easier development
export const AlwaysOpen: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    repositoryId: 'demo-repo',
    repositoryName: 'Demo Repository',
    branchName: 'develop',
  },
};

// Story showing error state (mock a failed API call)
export const WithError: Story = {
  render: args => {
    const [isOpen, setIsOpen] = useState(false);

    // Override the mock service to simulate an error
    (window as any).__STORYBOOK_REPOSITORY_SERVICE__ = {
      getCommitHistory: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: false,
          error:
            'Failed to fetch commit history. Repository may be unreachable or you may not have permission.',
        };
      },
    };

    return (
      <div>
        <Button onClick={() => setIsOpen(true)} variant="primary">
          Open Modal (Error State)
        </Button>

        <CommitHistoryModal {...args} open={isOpen} onOpenChange={setIsOpen} />
      </div>
    );
  },
  args: {
    repositoryId: 'error-repo',
    repositoryName: 'Error Repository',
    branchName: 'main',
  },
};

// Story showing loading state
export const LoadingState: Story = {
  render: args => {
    const [isOpen, setIsOpen] = useState(false);

    // Override the mock service to simulate slow loading
    (window as any).__STORYBOOK_REPOSITORY_SERVICE__ = {
      getCommitHistory: async () => {
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
        return {
          success: true,
          data: mockCommits,
        };
      },
    };

    return (
      <div>
        <Button onClick={() => setIsOpen(true)} variant="primary">
          Open Modal (Slow Loading)
        </Button>

        <CommitHistoryModal {...args} open={isOpen} onOpenChange={setIsOpen} />
      </div>
    );
  },
  args: {
    repositoryId: 'slow-repo',
    repositoryName: 'Slow Repository',
    branchName: 'main',
  },
};

// Story showing empty state (no commits)
export const EmptyRepository: Story = {
  render: args => {
    const [isOpen, setIsOpen] = useState(false);

    // Override the mock service to return no commits
    (window as any).__STORYBOOK_REPOSITORY_SERVICE__ = {
      getCommitHistory: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          success: true,
          data: [],
        };
      },
    };

    return (
      <div>
        <Button onClick={() => setIsOpen(true)} variant="primary">
          Open Modal (Empty Repository)
        </Button>

        <CommitHistoryModal {...args} open={isOpen} onOpenChange={setIsOpen} />
      </div>
    );
  },
  args: {
    repositoryId: 'empty-repo',
    repositoryName: 'Empty Repository',
    branchName: 'main',
  },
};
