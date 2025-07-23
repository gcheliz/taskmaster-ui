import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { KanbanDragOverlay } from '../../components/ui/organisms/KanbanDragOverlay'
import { Button } from '../../components/ui/atoms/Button'
import type { KanbanTask } from '../../components/ui/molecules/KanbanColumn'

const meta: Meta<typeof KanbanDragOverlay> = {
  title: 'Organisms/KanbanDragOverlay',
  component: KanbanDragOverlay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A drag overlay organism that provides visual feedback during kanban card drag operations. Combines KanbanTaskCard molecules with drag state styling to create a floating ghost card that follows the cursor during drag operations. Essential for providing clear visual feedback in drag-and-drop interfaces.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    task: {
      description: 'The task being dragged (KanbanTask object or null)',
      control: { type: 'object' },
    },
    isActive: {
      control: { type: 'boolean' },
      description: 'Whether the drag overlay is currently active',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS class name for styling',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[400px] bg-secondary-50 p-8">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const mockTask: KanbanTask = {
  id: 1,
  title: 'Implement User Authentication',
  description: 'Create secure login and registration system with JWT tokens and password hashing.',
  status: 'in-progress',
  priority: 'high',
  complexity: 8,
  estimatedHours: 16,
  assignedTo: 'Sarah Johnson',
  tags: ['Backend', 'Security'],
  createdAt: new Date('2024-01-15T09:00:00Z').toISOString(),
  updatedAt: new Date('2024-01-16T14:30:00Z').toISOString(),
  dueDate: new Date('2024-01-20T17:00:00Z').toISOString(),
  subtasks: [
    { id: 1, title: 'Set up JWT authentication', status: 'done' },
    { id: 2, title: 'Implement password hashing', status: 'done' },
    { id: 3, title: 'Create login endpoint', status: 'in-progress' },
    { id: 4, title: 'Add email verification', status: 'pending' },
  ],
}

const urgentTask: KanbanTask = {
  id: 2,
  title: 'Fix Critical Production Bug',
  description: 'Database connection timeout causing 500 errors for user login attempts.',
  status: 'pending',
  priority: 'urgent',
  complexity: 5,
  estimatedHours: 4,
  assignedTo: 'Alex Chen',
  tags: ['Hotfix', 'Production'],
  createdAt: new Date('2024-01-16T08:00:00Z').toISOString(),
  updatedAt: new Date('2024-01-16T08:05:00Z').toISOString(),
  dueDate: new Date('2024-01-16T18:00:00Z').toISOString(),
  subtasks: [
    { id: 5, title: 'Identify root cause', status: 'pending' },
    { id: 6, title: 'Deploy hotfix', status: 'pending' },
  ],
}

const largeTask: KanbanTask = {
  id: 3,
  title: 'Design System Implementation',
  description:
    'Implement comprehensive design system with atomic components, tokens, and documentation. This is a large epic task that will span multiple sprints and require coordination across teams.',
  status: 'in-progress',
  priority: 'medium',
  complexity: 10,
  estimatedHours: 120,
  assignedTo: 'Maria Rodriguez',
  tags: ['Design System', 'Frontend', 'Epic'],
  createdAt: new Date('2024-01-01T09:00:00Z').toISOString(),
  updatedAt: new Date('2024-01-16T16:45:00Z').toISOString(),
  dueDate: new Date('2024-03-01T17:00:00Z').toISOString(),
  subtasks: [
    { id: 7, title: 'Research design patterns', status: 'done' },
    { id: 8, title: 'Create design tokens', status: 'done' },
    { id: 9, title: 'Build atomic components', status: 'done' },
    { id: 10, title: 'Implement molecules', status: 'in-progress' },
    { id: 11, title: 'Create organisms', status: 'pending' },
    { id: 12, title: 'Document components', status: 'pending' },
  ],
}

export const Default: Story = {
  args: {
    task: mockTask,
    isActive: true,
  },
}

export const NotActive: Story = {
  args: {
    task: mockTask,
    isActive: false,
  },
}

export const NoTask: Story = {
  args: {
    task: null,
    isActive: true,
  },
}

export const DifferentTaskTypes: Story = {
  render: () => (
    <div className="space-y-8 w-full">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">High Priority Task</h3>
        <div className="relative">
          <KanbanDragOverlay task={mockTask} isActive={true} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Urgent Priority Task</h3>
        <div className="relative">
          <KanbanDragOverlay task={urgentTask} isActive={true} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Large Epic Task</h3>
        <div className="relative">
          <KanbanDragOverlay task={largeTask} isActive={true} />
        </div>
      </div>
    </div>
  ),
}

export const InteractiveDemo: Story = {
  render: () => {
    const [isDragging, setIsDragging] = useState(false)
    const [currentTask, setCurrentTask] = useState<KanbanTask | null>(mockTask)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const tasks = [mockTask, urgentTask, largeTask]

    const startDrag = (task: KanbanTask) => {
      setCurrentTask(task)
      setIsDragging(true)
    }

    const stopDrag = () => {
      setIsDragging(false)
      setCurrentTask(null)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
        setMousePosition({
          x: e.clientX - 150, // Offset to center the card
          y: e.clientY - 100,
        })
      }
    }

    return (
      <div
        className="w-full min-h-[600px] bg-secondary-50 p-8 relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={stopDrag}
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Interactive Drag Demo</h3>
          <p className="text-secondary-600 text-sm mb-4">
            Click and hold any task card below to simulate dragging. The drag overlay will follow
            your mouse cursor.
          </p>

          <div className="flex gap-2 mb-4">
            {tasks.map((task, index) => (
              <Button
                key={task.id}
                size="sm"
                variant="outline"
                onMouseDown={() => startDrag(task)}
                onMouseUp={stopDrag}
                className="cursor-grab active:cursor-grabbing"
              >
                Drag {index + 1}: {task.title.substring(0, 20)}...
              </Button>
            ))}
          </div>

          {isDragging && (
            <div className="text-sm text-primary-600 mb-4">
              🖱️ Dragging: {currentTask?.title} - Move your mouse to see the overlay follow
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        {isDragging && currentTask && (
          <div
            className="fixed pointer-events-none z-50"
            style={{
              left: mousePosition.x,
              top: mousePosition.y,
            }}
          >
            <KanbanDragOverlay task={currentTask} isActive={isDragging} />
          </div>
        )}

        {/* Static Task Cards for Reference */}
        <div className="space-y-4">
          <h4 className="font-medium text-secondary-700">Task Cards (Click to drag)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-lg border border-secondary-200 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                onMouseDown={() => startDrag(task)}
                onMouseUp={stopDrag}
              >
                <h5 className="font-medium text-secondary-900 mb-1">{task.title}</h5>
                <p className="text-xs text-secondary-600 mb-2">
                  {task.description.substring(0, 100)}...
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      task.priority === 'urgent'
                        ? 'bg-red-500'
                        : task.priority === 'high'
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-secondary-500">{task.estimatedHours}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <h4 className="font-medium text-primary-800 mb-2">Drag Overlay Features:</h4>
          <ul className="text-sm text-primary-700 space-y-1">
            <li>• Rotated appearance (5 degrees) for visual distinction</li>
            <li>• Reduced opacity (0.8) to indicate ghost state</li>
            <li>• Enhanced styling with border and background highlights</li>
            <li>• Disabled pointer events to avoid interference</li>
            <li>• High z-index (1000) to appear above other elements</li>
            <li>• Maintains original task card styling and information</li>
          </ul>
        </div>
      </div>
    )
  },
}

export const DragStates: Story = {
  render: () => (
    <div className="space-y-8 w-full">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Different Drag States</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-secondary-700">Active Drag Overlay</h4>
            <div className="bg-white p-6 rounded-lg border border-secondary-200 relative min-h-[200px]">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <KanbanDragOverlay task={mockTask} isActive={true} />
              </div>
            </div>
            <p className="text-sm text-secondary-600">
              Drag overlay is active and visible with rotation and enhanced styling
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-secondary-700">Inactive Drag Overlay</h4>
            <div className="bg-white p-6 rounded-lg border border-secondary-200 min-h-[200px] flex items-center justify-center">
              <KanbanDragOverlay task={mockTask} isActive={false} />
              <div className="text-secondary-400 text-center">
                <p>Drag overlay is inactive</p>
                <p className="text-xs">(renders nothing)</p>
              </div>
            </div>
            <p className="text-sm text-secondary-600">
              When inactive, the overlay renders nothing (null)
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-secondary-700">Null Task State</h4>
        <div className="bg-white p-6 rounded-lg border border-secondary-200 min-h-[150px] flex items-center justify-center">
          <KanbanDragOverlay task={null} isActive={true} />
          <div className="text-secondary-400 text-center">
            <p>No task provided</p>
            <p className="text-xs">(renders nothing)</p>
          </div>
        </div>
        <p className="text-sm text-secondary-600">
          When no task is provided, the overlay renders nothing regardless of isActive state
        </p>
      </div>
    </div>
  ),
}

export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-8 w-full">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Custom Styling Examples</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-secondary-700">Default Styling</h4>
            <div className="bg-white p-6 rounded-lg border border-secondary-200 relative min-h-[200px]">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <KanbanDragOverlay task={mockTask} isActive={true} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-secondary-700">Custom Border</h4>
            <div className="bg-white p-6 rounded-lg border border-secondary-200 relative min-h-[200px]">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <KanbanDragOverlay
                  task={urgentTask}
                  isActive={true}
                  className="ring-4 ring-red-500 ring-opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-secondary-700">Enhanced Shadow</h4>
            <div className="bg-white p-6 rounded-lg border border-secondary-200 relative min-h-[200px]">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <KanbanDragOverlay
                  task={largeTask}
                  isActive={true}
                  className="shadow-2xl ring-2 ring-purple-500 ring-opacity-30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
        <h4 className="font-medium text-secondary-700 mb-2">Styling Guidelines:</h4>
        <ul className="text-sm text-secondary-600 space-y-1">
          <li>• Default styling includes 5-degree rotation and 0.8 opacity</li>
          <li>• Enhanced border and background are applied automatically</li>
          <li>• Custom className prop allows additional styling</li>
          <li>• Consider using rings or shadows for better visual feedback</li>
          <li>• Maintain good contrast against various background colors</li>
        </ul>
      </div>
    </div>
  ),
}
