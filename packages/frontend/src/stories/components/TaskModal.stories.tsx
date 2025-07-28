import type { Meta, StoryObj } from '@storybook/react-vite'
import { TaskModal } from '../../components/TaskBoard/TaskModal'
import { useState } from 'react'

const meta: Meta<typeof TaskModal> = {
  title: 'Components/TaskBoard/TaskModal',
  component: TaskModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Modal for creating and editing tasks in the Task Board.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the modal is open',
    },
    mode: {
      control: 'select',
      options: ['create', 'edit', 'view'],
      description: 'Mode of the modal',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Interactive wrapper component
const TaskModalDemo = ({ mode = 'create', task = null }: { mode?: 'create' | 'edit' | 'view', task?: any }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Open Task Modal
      </button>
      <TaskModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode={mode}
        task={task}
        onSave={async (taskData) => {
          console.log('Task saved:', taskData)
          setIsOpen(false)
        }}
        onDelete={task ? async (taskId) => {
          console.log('Task deleted:', taskId)
          setIsOpen(false)
        } : undefined}
      />
    </>
  )
}

export const CreateMode: Story = {
  render: () => <TaskModalDemo mode="create" />,
  parameters: {
    docs: {
      description: {
        story: 'Task modal in create mode for adding new tasks.',
      },
    },
  },
}

export const EditMode: Story = {
  render: () => (
    <TaskModalDemo 
      mode="edit" 
      task={{
        id: 1,
        title: 'Sample Task',
        description: 'This is a sample task description',
        priority: 'medium',
        status: 'in-progress',
        assignedTo: 'John Doe',
        tags: ['frontend', 'urgent'],
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Task modal in edit mode with pre-filled task data.',
      },
    },
  },
}

export const ViewMode: Story = {
  render: () => (
    <TaskModalDemo 
      mode="view" 
      task={{
        id: 1,
        title: 'Sample Task',
        description: 'This is a sample task description that can be quite long and detailed.',
        priority: 'high',
        status: 'done',
        assignedTo: 'Jane Smith',
        tags: ['backend', 'completed'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Task modal in view mode (read-only).',
      },
    },
  },
}