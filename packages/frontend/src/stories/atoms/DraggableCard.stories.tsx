import type { Meta, StoryObj } from '@storybook/react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { useState } from 'react'
import { DraggableCard } from '../../components/ui/atoms/DraggableCard'
import { DroppableArea } from '../../components/ui/atoms/DroppableArea'
import { Button } from '../../components/ui/atoms/Button'
import { Badge } from '../../components/ui/atoms/Badge'
import {
  Icon,
  DragHandleIcon,
  StarFilledIcon,
  CheckIcon,
  TimeIcon,
  WarningIcon,
} from '../../components/ui/atoms/Icon'

// Create missing icon aliases for compatibility
const ClockIcon = TimeIcon
const GripVerticalIcon = DragHandleIcon
const AlertTriangleIcon = WarningIcon
const StarIcon = StarFilledIcon

const meta: Meta<typeof DraggableCard> = {
  title: 'Atoms/DraggableCard',
  component: DraggableCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A draggable card component built on top of @dnd-kit that extends the base Card component with drag-and-drop functionality. Features visual feedback during dragging, support for custom drag handles, and accessibility-compliant interactions. Perfect for kanban boards, sortable lists, and interactive dashboards.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    id: {
      control: { type: 'text' },
      description: 'Unique identifier for the draggable card (required)',
    },
    data: {
      control: { type: 'object' },
      description: 'Data object passed during drag operations',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable drag functionality',
    },
    handle: {
      control: { type: 'text' },
      description: 'CSS selector for custom drag handle element',
    },
    children: {
      control: { type: 'text' },
      description: 'Card content',
    },
    // Card props
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'outline', 'ghost'],
      description: 'Card visual variant',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Card size',
    },
  },
  decorators: [
    (Story) => (
      <DndContext collisionDetection={closestCenter}>
        <div className="p-8">
          <Story />
        </div>
      </DndContext>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'default-card',
    children: (
      <div>
        <h3 className="font-semibold mb-2">Draggable Task Card</h3>
        <p className="text-sm text-secondary-600">Click and drag to move this card around</p>
      </div>
    ),
  },
}

export const WithTaskContent: Story = {
  args: {
    id: 'task-card',
    data: { type: 'task', priority: 'high', assignee: 'john' },
    children: (
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-sm leading-tight">
            Implement user authentication system
          </h3>
          <Badge variant="error" size="sm">
            High
          </Badge>
        </div>
        <p className="text-xs text-secondary-600">
          Set up OAuth 2.0 integration with Google and GitHub providers
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon={ClockIcon} size="sm" className="text-secondary-500" />
            <span className="text-xs text-secondary-500">Due: Mar 15</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-medium">
              J
            </div>
          </div>
        </div>
      </div>
    ),
  },
}

export const WithCustomHandle: Story = {
  args: {
    id: 'handle-card',
    handle: '[data-drag-handle]',
    children: (
      <div className="flex gap-3">
        <div
          data-drag-handle
          className="flex-shrink-0 cursor-grab hover:bg-secondary-100 p-1 rounded active:cursor-grabbing"
        >
          <Icon icon={GripVerticalIcon} size="sm" className="text-secondary-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Card with Drag Handle</h3>
          <p className="text-sm text-secondary-600">
            Only the grip icon can be used to drag this card
          </p>
        </div>
      </div>
    ),
  },
}

export const Disabled: Story = {
  args: {
    id: 'disabled-card',
    disabled: true,
    children: (
      <div className="text-center py-4">
        <h3 className="font-semibold mb-2 text-secondary-400">Disabled Card</h3>
        <p className="text-sm text-secondary-400">This card cannot be dragged</p>
      </div>
    ),
  },
}

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <DraggableCard id="small-card" size="sm">
        <div className="text-center">
          <h4 className="font-medium text-sm">Small Card</h4>
          <p className="text-xs text-secondary-600 mt-1">Compact size</p>
        </div>
      </DraggableCard>
      <DraggableCard id="medium-card" size="md">
        <div className="text-center">
          <h4 className="font-medium">Medium Card</h4>
          <p className="text-sm text-secondary-600 mt-1">Default size</p>
        </div>
      </DraggableCard>
      <DraggableCard id="large-card" size="lg">
        <div className="text-center py-2">
          <h4 className="font-medium text-lg">Large Card</h4>
          <p className="text-sm text-secondary-600 mt-2">Spacious size</p>
        </div>
      </DraggableCard>
    </div>
  ),
}

export const DifferentVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DraggableCard id="elevated-card" variant="elevated">
        <div className="text-center">
          <h4 className="font-medium mb-2">Elevated Card</h4>
          <p className="text-sm text-secondary-600">With shadow</p>
        </div>
      </DraggableCard>
      <DraggableCard id="outlined-card" variant="outline">
        <div className="text-center">
          <h4 className="font-medium mb-2">Outlined Card</h4>
          <p className="text-sm text-secondary-600">With border</p>
        </div>
      </DraggableCard>
      <DraggableCard id="filled-card" variant="ghost">
        <div className="text-center">
          <h4 className="font-medium mb-2">Filled Card</h4>
          <p className="text-sm text-secondary-600">With background</p>
        </div>
      </DraggableCard>
    </div>
  ),
}

export const KanbanTaskCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      <DraggableCard
        id="task-todo"
        data={{ status: 'todo', priority: 'high' }}
        size="md"
        variant="outline"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm">Design system components</h3>
            <Badge variant="error" size="sm">
              High
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon={AlertTriangleIcon} size="sm" className="text-warning-500" />
            <span className="text-xs text-secondary-600">Blocked by dependencies</span>
          </div>
        </div>
      </DraggableCard>

      <DraggableCard
        id="task-progress"
        data={{ status: 'in-progress', priority: 'medium' }}
        size="md"
        variant="default"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm">API integration</h3>
            <Badge variant="warning" size="sm">
              Medium
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon={ClockIcon} size="sm" className="text-blue-500" />
            <span className="text-xs text-secondary-600">In progress</span>
          </div>
        </div>
      </DraggableCard>

      <DraggableCard
        id="task-done"
        data={{ status: 'done', priority: 'low' }}
        size="md"
        variant="elevated"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm">Setup project structure</h3>
            <Badge variant="success" size="sm">
              Done
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon={CheckIcon} size="sm" className="text-success-500" />
            <span className="text-xs text-secondary-600">Completed</span>
          </div>
        </div>
      </DraggableCard>
    </div>
  ),
}

// Interactive demo with drag overlay and drop zones
export const InteractiveDragDemo: Story = {
  render: () => {
    const [activeId, setActiveId] = useState<string | null>(null)
    const [todoItems, setTodoItems] = useState(['item-1', 'item-2'])
    const [doneItems, setDoneItems] = useState(['item-3'])

    const handleDragStart = (event: any) => {
      setActiveId(event.active.id)
    }

    const handleDragEnd = (event: any) => {
      const { active, over } = event
      setActiveId(null)

      if (over) {
        const activeId = active.id
        const overId = over.id

        // Move item between lists
        if (overId === 'todo-zone') {
          setTodoItems((prev) => [...prev.filter((id) => id !== activeId), activeId])
          setDoneItems((prev) => prev.filter((id) => id !== activeId))
        } else if (overId === 'done-zone') {
          setDoneItems((prev) => [...prev.filter((id) => id !== activeId), activeId])
          setTodoItems((prev) => prev.filter((id) => id !== activeId))
        }
      }
    }

    const getTaskContent = (id: string) => {
      const tasks: Record<string, { title: string; priority: string }> = {
        'item-1': { title: 'Review pull request', priority: 'high' },
        'item-2': { title: 'Update documentation', priority: 'medium' },
        'item-3': { title: 'Fix login bug', priority: 'high' },
      }
      return tasks[id] || { title: id, priority: 'low' }
    }

    return (
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {/* Todo Column */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">To Do</h3>
            <DroppableArea
              id="todo-zone"
              variant="highlighted"
              size="lg"
              placeholder="Drop tasks here"
              className="space-y-3"
            >
              {todoItems.map((itemId) => {
                const task = getTaskContent(itemId)
                return (
                  <DraggableCard
                    key={itemId}
                    id={itemId}
                    data={{ status: 'todo' }}
                    variant="outline"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge variant={task.priority === 'high' ? 'error' : 'warning'} size="sm">
                        {task.priority}
                      </Badge>
                    </div>
                  </DraggableCard>
                )
              })}
            </DroppableArea>
          </div>

          {/* Done Column */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Done</h3>
            <DroppableArea
              id="done-zone"
              variant="default"
              size="lg"
              placeholder="Drop completed tasks here"
              className="space-y-3"
            >
              {doneItems.map((itemId) => {
                const task = getTaskContent(itemId)
                return (
                  <DraggableCard
                    key={itemId}
                    id={itemId}
                    data={{ status: 'done' }}
                    variant="default"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge variant="success" size="sm">
                        Done
                      </Badge>
                    </div>
                  </DraggableCard>
                )
              })}
            </DroppableArea>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <DraggableCard id={activeId} variant="elevated" className="shadow-2xl">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{getTaskContent(activeId).title}</h4>
                <Badge variant="primary" size="sm">
                  Dragging
                </Badge>
              </div>
            </DraggableCard>
          ) : null}
        </DragOverlay>
      </DndContext>
    )
  },
}

export const DragStatesShowcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Normal State</h3>
        <DraggableCard id="normal-state" variant="outline">
          <div className="text-center py-2">
            <p className="font-medium">Ready to drag</p>
            <p className="text-sm text-secondary-600 mt-1">Hover to see grab cursor</p>
          </div>
        </DraggableCard>
      </div>

      <div>
        <h3 className="font-semibold mb-3">With Drag Handle</h3>
        <DraggableCard id="handle-state" handle="[data-handle]" variant="outline">
          <div className="flex items-center gap-3">
            <div
              data-handle
              className="p-2 hover:bg-secondary-100 rounded cursor-grab active:cursor-grabbing"
            >
              <Icon icon={GripVerticalIcon} size="sm" className="text-secondary-400" />
            </div>
            <div>
              <p className="font-medium">Drag handle only</p>
              <p className="text-sm text-secondary-600">Use the grip to drag</p>
            </div>
          </div>
        </DraggableCard>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Disabled State</h3>
        <DraggableCard id="disabled-state" disabled variant="outline">
          <div className="text-center py-2">
            <p className="font-medium">Cannot be dragged</p>
            <p className="text-sm text-secondary-600 mt-1">Disabled interaction</p>
          </div>
        </DraggableCard>
      </div>
    </div>
  ),
}

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Keyboard Navigation</h3>
        <p className="text-sm text-secondary-600 mb-4">
          Use Space to start dragging, arrow keys to move, Space to drop, Escape to cancel
        </p>
        <div className="space-y-3">
          <DraggableCard
            id="accessible-1"
            variant="outline"
            tabIndex={0}
            role="button"
            aria-label="Task: Review code changes. Press space to start dragging"
          >
            <div className="flex items-center gap-3">
              <Icon icon={StarIcon} size="sm" className="text-yellow-500" />
              <div>
                <h4 className="font-medium text-sm">Review code changes</h4>
                <p className="text-xs text-secondary-600">High priority task</p>
              </div>
            </div>
          </DraggableCard>

          <DraggableCard
            id="accessible-2"
            variant="outline"
            tabIndex={0}
            role="button"
            aria-label="Task: Update test cases. Press space to start dragging"
          >
            <div className="flex items-center gap-3">
              <Icon icon={CheckIcon} size="sm" className="text-green-500" />
              <div>
                <h4 className="font-medium text-sm">Update test cases</h4>
                <p className="text-xs text-secondary-600">Medium priority task</p>
              </div>
            </div>
          </DraggableCard>
        </div>
      </div>
    </div>
  ),
}

export const RealWorldExample: Story = {
  render: () => (
    <div className="space-y-4 max-w-sm">
      <h3 className="font-semibold mb-4">Project Tasks</h3>

      <DraggableCard
        id="real-task-1"
        data={{
          type: 'task',
          id: 'TASK-123',
          priority: 'high',
          assignee: 'john.doe@company.com',
          dueDate: '2024-03-15',
        }}
        variant="outline"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-secondary-500">TASK-123</span>
                <Badge variant="error" size="sm">
                  High
                </Badge>
              </div>
              <h4 className="font-medium text-sm leading-tight">
                Implement real-time notifications system
              </h4>
            </div>
          </div>

          <p className="text-xs text-secondary-600 leading-relaxed">
            Set up WebSocket connections for real-time push notifications across all user sessions
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon={ClockIcon} size="sm" className="text-secondary-400" />
              <span className="text-xs text-secondary-500">Due Mar 15</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-xs text-white font-medium">JD</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-secondary-100">
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
              View Details
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
              Add Comment
            </Button>
          </div>
        </div>
      </DraggableCard>

      <DraggableCard
        id="real-task-2"
        data={{
          type: 'task',
          id: 'TASK-124',
          priority: 'medium',
          assignee: 'jane.smith@company.com',
          dueDate: '2024-03-20',
        }}
        variant="default"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-secondary-500">TASK-124</span>
                <Badge variant="warning" size="sm">
                  Medium
                </Badge>
              </div>
              <h4 className="font-medium text-sm leading-tight">
                Optimize database query performance
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-full bg-secondary-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full w-3/4"></div>
            </div>
            <span className="text-xs text-secondary-600">75%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon={ClockIcon} size="sm" className="text-secondary-400" />
              <span className="text-xs text-secondary-500">Due Mar 20</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-xs text-white font-medium">JS</span>
              </div>
            </div>
          </div>
        </div>
      </DraggableCard>
    </div>
  ),
}
