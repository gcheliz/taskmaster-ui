import type { Meta, StoryObj } from '@storybook/react-vite';
import { KanbanTaskCard } from '../../components/ui/molecules/KanbanTaskCard';

const meta: Meta<typeof KanbanTaskCard> = {
  title: 'Molecules/KanbanTaskCard',
  component: KanbanTaskCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    priority: {
      control: 'select',
      options: ['urgent', 'high', 'medium', 'low'],
    },
    status: {
      control: 'select',
      options: ['pending', 'in-progress', 'done', 'blocked', 'cancelled', 'deferred'],
    },
    complexity: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
    },
    estimatedHours: {
      control: { type: 'range', min: 0.5, max: 40, step: 0.5 },
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for stories
const sampleTask = {
  id: 1,
  title: 'Implement user authentication',
  description: 'Add login and registration functionality with JWT tokens',
  status: 'in-progress' as const,
  priority: 'high' as const,
  complexity: 7,
  estimatedHours: 12,
  assignedTo: 'John Doe',
  tags: ['authentication', 'security', 'backend'],
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-18T14:45:00Z',
  dueDate: '2024-01-25T23:59:59Z',
  subtasks: [
    { id: 1, title: 'Design login form', status: 'done' as const },
    { id: 2, title: 'Implement JWT service', status: 'in-progress' as const },
    { id: 3, title: 'Add registration endpoint', status: 'pending' as const },
  ],
};

export const Default: Story = {
  args: {
    ...sampleTask,
  },
};

export const UrgentPriority: Story = {
  args: {
    ...sampleTask,
    priority: 'urgent',
    title: 'Critical security vulnerability fix',
    description: 'Patch identified security issue in authentication system',
  },
};

export const LowPriority: Story = {
  args: {
    ...sampleTask,
    priority: 'low',
    title: 'Update documentation',
    description: 'Refresh API documentation with latest changes',
  },
};

export const CompletedTask: Story = {
  args: {
    ...sampleTask,
    status: 'done',
    title: 'Database migration completed',
    description: 'Successfully migrated user data to new schema',
    subtasks: [
      { id: 1, title: 'Backup existing data', status: 'done' as const },
      { id: 2, title: 'Run migration script', status: 'done' as const },
      { id: 3, title: 'Verify data integrity', status: 'done' as const },
    ],
  },
};

export const BlockedTask: Story = {
  args: {
    ...sampleTask,
    status: 'blocked',
    title: 'Integration with third-party API',
    description: 'Cannot proceed until API keys are provided by vendor',
  },
};

export const OverdueTask: Story = {
  args: {
    ...sampleTask,
    dueDate: '2024-01-10T23:59:59Z', // Past date
    title: 'Overdue task example',
    description: 'This task is past its due date',
  },
};

export const NoSubtasks: Story = {
  args: {
    ...sampleTask,
    subtasks: undefined,
    title: 'Simple task without subtasks',
    description: 'A straightforward task with no sub-items',
  },
};

export const NoAssignee: Story = {
  args: {
    ...sampleTask,
    assignedTo: undefined,
    title: 'Unassigned task',
    description: 'This task has not been assigned to anyone yet',
  },
};

export const ManyTags: Story = {
  args: {
    ...sampleTask,
    tags: ['react', 'typescript', 'ui', 'components', 'storybook', 'testing', 'responsive'],
    title: 'Task with many tags',
    description: 'This task has multiple tags to test overflow behavior',
  },
};

export const MinimalTask: Story = {
  args: {
    id: 2,
    title: 'Minimal task example',
    description: 'Only required fields are filled',
    status: 'pending',
    priority: 'medium',
  },
};

export const ComplexTask: Story = {
  args: {
    ...sampleTask,
    complexity: 10,
    estimatedHours: 40,
    title: 'Highly complex task',
    description: 'This is a very complex task that requires significant time and effort',
    subtasks: [
      { id: 1, title: 'Research phase', status: 'done' as const },
      { id: 2, title: 'Design phase', status: 'in-progress' as const },
      { id: 3, title: 'Development phase', status: 'pending' as const },
      { id: 4, title: 'Testing phase', status: 'pending' as const },
      { id: 5, title: 'Documentation phase', status: 'pending' as const },
    ],
  },
};

export const DraggingState: Story = {
  args: {
    ...sampleTask,
    isDragging: true,
    title: 'Task being dragged',
    description: 'Shows the visual state when task is being dragged',
  },
};

export const Interactive: Story = {
  args: {
    ...sampleTask,
  },
  parameters: {
    docs: {
      description: {
        story: 'Click on the task card to see the interaction behavior.',
      },
    },
  },
};