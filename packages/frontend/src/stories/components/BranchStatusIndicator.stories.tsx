import type { Meta, StoryObj } from '@storybook/react'
import { BranchStatusIndicator } from '../../components/Repository/BranchStatusIndicator'

const meta: Meta<typeof BranchStatusIndicator> = {
  title: 'Components/Repository/BranchStatusIndicator',
  component: BranchStatusIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A component that displays the current status of a Git branch with visual indicators for various states like ahead/behind, conflicts, and working directory status.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ahead: {
      control: { type: 'number', min: 0, max: 20 },
      description: 'Number of commits ahead of remote',
    },
    behind: {
      control: { type: 'number', min: 0, max: 20 },
      description: 'Number of commits behind remote',
    },
    isClean: {
      control: { type: 'boolean' },
      description: 'Whether working directory is clean',
    },
    conflicted: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Number of conflicted files',
    },
    lastCommitDate: {
      control: { type: 'text' },
      description: 'Last commit date ISO string',
    },
    showDetails: {
      control: { type: 'boolean' },
      description: 'Show detailed information',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Helper to generate dates relative to now
const getRelativeDate = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

export const UpToDate: Story = {
  args: {
    ahead: 0,
    behind: 0,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(2),
    showDetails: false,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Branch is synchronized with remote and working directory is clean.',
      },
    },
  },
}

export const UpToDateWithChanges: Story = {
  args: {
    ahead: 0,
    behind: 0,
    isClean: false,
    conflicted: 0,
    lastCommitDate: getRelativeDate(1),
    showDetails: false,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Branch is synchronized but has uncommitted changes.',
      },
    },
  },
}

export const Ahead: Story = {
  args: {
    ahead: 3,
    behind: 0,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(4),
    showDetails: false,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Branch has commits that need to be pushed to remote.',
      },
    },
  },
}

export const Behind: Story = {
  args: {
    ahead: 0,
    behind: 5,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(24),
    showDetails: false,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Branch is behind remote and needs to pull changes.',
      },
    },
  },
}

export const Diverged: Story = {
  args: {
    ahead: 2,
    behind: 3,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(6),
    showDetails: false,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Branch has diverged from remote with commits on both sides.',
      },
    },
  },
}

export const Conflicted: Story = {
  args: {
    ahead: 1,
    behind: 1,
    isClean: false,
    conflicted: 3,
    lastCommitDate: getRelativeDate(2),
    showDetails: false,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Branch has merge conflicts that need to be resolved.',
      },
    },
  },
}

export const WithDetails: Story = {
  args: {
    ahead: 2,
    behind: 1,
    isClean: false,
    conflicted: 0,
    lastCommitDate: getRelativeDate(8),
    showDetails: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows detailed information including commit counts and descriptions.',
      },
    },
  },
}

export const LargeSize: Story = {
  args: {
    ahead: 5,
    behind: 0,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(12),
    showDetails: true,
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large size variant with detailed information.',
      },
    },
  },
}

export const SmallSize: Story = {
  args: {
    ahead: 0,
    behind: 2,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(48),
    showDetails: false,
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small size variant for compact displays.',
      },
    },
  },
}

// Showcase different time periods
export const RecentCommit: Story = {
  args: {
    ahead: 1,
    behind: 0,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(0.5), // 30 minutes ago
    showDetails: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Branch with a very recent commit (30 minutes ago).',
      },
    },
  },
}

export const OldCommit: Story = {
  args: {
    ahead: 0,
    behind: 0,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(24 * 30), // 30 days ago
    showDetails: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Branch with an old commit (30 days ago).',
      },
    },
  },
}
