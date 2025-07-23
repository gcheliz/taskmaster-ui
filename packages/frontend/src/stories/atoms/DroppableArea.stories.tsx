import type { Meta, StoryObj } from '@storybook/react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { useState } from 'react'
import { DroppableArea } from '../../components/ui/atoms/DroppableArea'
import { DraggableCard } from '../../components/ui/atoms/DraggableCard'
import { Button } from '../../components/ui/atoms/Button'
import { Badge } from '../../components/ui/atoms/Badge'
import {
  Icon,
  PlusIcon,
  ArchiveIcon,
  TrashIcon,
  CheckIcon,
  TimeIcon,
} from '../../components/ui/atoms/Icon'

// Create missing icon aliases for compatibility
const ClockIcon = TimeIcon
const FolderIcon = ArchiveIcon // Use ArchiveIcon as folder substitute
const InboxIcon = ArchiveIcon // Use ArchiveIcon as inbox substitute

const meta: Meta<typeof DroppableArea> = {
  title: 'Atoms/DroppableArea',
  component: DroppableArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A droppable area component built on top of @dnd-kit that provides visual feedback when items are dragged over it. Features multiple variants, sizes, and customizable placeholder content. Perfect for drag-and-drop interfaces, file uploads, and sortable lists.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    id: {
      control: { type: 'text' },
      description: 'Unique identifier for the droppable area (required)',
    },
    data: {
      control: { type: 'object' },
      description: 'Data object passed during drop operations',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable drop functionality',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Content to display when area is empty',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'highlighted', 'minimal'],
      description: 'Visual styling variant',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the droppable area',
    },
    children: {
      control: { type: 'text' },
      description: 'Content inside the droppable area',
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
    id: 'default-drop-zone',
    placeholder: 'Drop items here',
  },
}

export const WithCustomPlaceholder: Story = {
  args: {
    id: 'custom-placeholder',
    placeholder: (
      <div className="text-center">
        <Icon icon={InboxIcon} size="lg" className="text-secondary-400 mb-2" />
        <p className="font-medium text-secondary-600">Drop tasks to get started</p>
        <p className="text-sm text-secondary-500 mt-1">Drag task cards from the sidebar</p>
      </div>
    ),
  },
}

export const DifferentVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
      <div>
        <h4 className="font-medium mb-3">Default</h4>
        <DroppableArea id="default-variant" variant="default" placeholder="Default styling" />
      </div>
      <div>
        <h4 className="font-medium mb-3">Highlighted</h4>
        <DroppableArea
          id="highlighted-variant"
          variant="highlighted"
          placeholder="Highlighted styling"
        />
      </div>
      <div>
        <h4 className="font-medium mb-3">Minimal</h4>
        <DroppableArea id="minimal-variant" variant="minimal" placeholder="Minimal styling" />
      </div>
    </div>
  ),
}

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h4 className="font-medium mb-3">Small (80px min-height)</h4>
        <DroppableArea id="small-size" size="sm" placeholder="Small drop zone" />
      </div>
      <div>
        <h4 className="font-medium mb-3">Medium (120px min-height)</h4>
        <DroppableArea id="medium-size" size="md" placeholder="Medium drop zone" />
      </div>
      <div>
        <h4 className="font-medium mb-3">Large (160px min-height)</h4>
        <DroppableArea id="large-size" size="lg" placeholder="Large drop zone" />
      </div>
      <div>
        <h4 className="font-medium mb-3">Extra Large (200px min-height)</h4>
        <DroppableArea id="xl-size" size="xl" placeholder="Extra large drop zone" />
      </div>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    id: 'disabled-zone',
    disabled: true,
    placeholder: 'This drop zone is disabled',
  },
}

export const WithContent: Story = {
  args: {
    id: 'content-zone',
    children: (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <Icon icon={FolderIcon} size="lg" className="text-blue-500 mb-2" />
          <h3 className="font-semibold">Active Tasks</h3>
          <p className="text-sm text-secondary-600">3 tasks in progress</p>
        </div>
        <div className="space-y-2">
          <div className="bg-white rounded-lg p-3 border border-secondary-200 shadow-sm">
            <h4 className="font-medium text-sm">Design system updates</h4>
            <p className="text-xs text-secondary-600 mt-1">Due tomorrow</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-secondary-200 shadow-sm">
            <h4 className="font-medium text-sm">API documentation</h4>
            <p className="text-xs text-secondary-600 mt-1">Due next week</p>
          </div>
        </div>
      </div>
    ),
  },
}

// Interactive demo showing drop functionality
export const InteractiveDropDemo: Story = {
  render: () => {
    const [droppedItems, setDroppedItems] = useState<string[]>([])
    const [availableItems] = useState([
      { id: 'item-1', title: 'Task 1', color: 'blue' },
      { id: 'item-2', title: 'Task 2', color: 'green' },
      { id: 'item-3', title: 'Task 3', color: 'yellow' },
    ])

    const handleDragEnd = (event: any) => {
      const { active, over } = event

      if (over && over.id === 'interactive-drop-zone') {
        const itemId = active.id
        if (!droppedItems.includes(itemId)) {
          setDroppedItems((prev) => [...prev, itemId])
        }
      }
    }

    const clearDropZone = () => {
      setDroppedItems([])
    }

    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {/* Available Items */}
          <div>
            <h3 className="font-semibold mb-4">Available Items</h3>
            <div className="space-y-3">
              {availableItems.map((item) => (
                <DraggableCard
                  key={item.id}
                  id={item.id}
                  variant="outline"
                  className={droppedItems.includes(item.id) ? 'opacity-50' : ''}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                    <span className="font-medium">{item.title}</span>
                    {droppedItems.includes(item.id) && (
                      <Badge variant="success" size="sm">
                        Dropped
                      </Badge>
                    )}
                  </div>
                </DraggableCard>
              ))}
            </div>
          </div>

          {/* Drop Zone */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Drop Zone</h3>
              {droppedItems.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearDropZone}>
                  Clear ({droppedItems.length})
                </Button>
              )}
            </div>

            <DroppableArea
              id="interactive-drop-zone"
              variant="highlighted"
              size="lg"
              data={{ acceptsItems: true }}
              placeholder={
                droppedItems.length === 0 ? (
                  <div className="text-center">
                    <Icon icon={InboxIcon} size="lg" className="text-blue-400 mb-2" />
                    <p className="font-medium text-blue-600">Drop items here</p>
                    <p className="text-sm text-blue-500 mt-1">Drag tasks from the left column</p>
                  </div>
                ) : undefined
              }
            >
              {droppedItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon={CheckIcon} size="sm" className="text-green-500" />
                    <span className="font-medium text-green-700">
                      {droppedItems.length} item
                      {droppedItems.length > 1 ? 's' : ''} received
                    </span>
                  </div>
                  {droppedItems.map((itemId) => {
                    const item = availableItems.find((i) => i.id === itemId)
                    return item ? (
                      <div
                        key={itemId}
                        className="bg-green-50 border border-green-200 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                          <span className="font-medium">{item.title}</span>
                          <Badge variant="success" size="sm">
                            Received
                          </Badge>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              )}
            </DroppableArea>
          </div>
        </div>
      </DndContext>
    )
  },
}

export const KanbanColumns: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl">
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Icon icon={InboxIcon} size="sm" />
          Backlog
        </h4>
        <DroppableArea
          id="backlog-column"
          variant="default"
          size="lg"
          data={{ status: 'backlog' }}
          placeholder="Drop new tasks here"
        />
      </div>

      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Icon icon={ClockIcon} size="sm" className="text-blue-500" />
          In Progress
        </h4>
        <DroppableArea
          id="progress-column"
          variant="highlighted"
          size="lg"
          data={{ status: 'in-progress' }}
          placeholder="Active work items"
        />
      </div>

      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Icon icon={CheckIcon} size="sm" className="text-green-500" />
          Review
        </h4>
        <DroppableArea
          id="review-column"
          variant="default"
          size="lg"
          data={{ status: 'review' }}
          placeholder="Ready for review"
        />
      </div>

      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Icon icon={ArchiveIcon} size="sm" className="text-secondary-500" />
          Done
        </h4>
        <DroppableArea
          id="done-column"
          variant="minimal"
          size="lg"
          data={{ status: 'done' }}
          placeholder="Completed tasks"
        />
      </div>
    </div>
  ),
}

export const FileUploadZones: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <div>
        <h4 className="font-semibold mb-3">Document Upload</h4>
        <DroppableArea
          id="document-upload"
          variant="default"
          size="lg"
          placeholder={
            <div className="text-center">
              <Icon icon={FolderIcon} size="xl" className="text-secondary-400 mb-3" />
              <p className="font-medium text-secondary-700 mb-1">Drop documents here</p>
              <p className="text-sm text-secondary-500">Supports PDF, DOC, TXT files</p>
              <Button variant="ghost" size="sm" className="mt-3">
                Or click to browse
              </Button>
            </div>
          }
        />
      </div>

      <div>
        <h4 className="font-semibold mb-3">Image Upload</h4>
        <DroppableArea
          id="image-upload"
          variant="highlighted"
          size="lg"
          placeholder={
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center">
                <Icon icon={PlusIcon} size="lg" className="text-blue-400" />
              </div>
              <p className="font-medium text-blue-700 mb-1">Drop images here</p>
              <p className="text-sm text-blue-600">PNG, JPG, GIF up to 10MB</p>
            </div>
          }
        />
      </div>
    </div>
  ),
}

export const DragStatesShowcase: Story = {
  render: () => {
    const [isOver, setIsOver] = useState(false)

    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h3 className="font-semibold mb-3">Normal State</h3>
          <DroppableArea id="normal-state" variant="default" placeholder="Ready to receive items" />
        </div>

        <div>
          <h3 className="font-semibold mb-3">Highlighted Variant</h3>
          <DroppableArea
            id="highlighted-state"
            variant="highlighted"
            placeholder="Highlighted when items approach"
          />
        </div>

        <div>
          <h3 className="font-semibold mb-3">Hover State Simulation</h3>
          <div
            className="relative"
            onMouseEnter={() => setIsOver(true)}
            onMouseLeave={() => setIsOver(false)}
          >
            <DroppableArea
              id="hover-state"
              variant="default"
              className={isOver ? 'border-primary-400 bg-primary-100/50' : ''}
              placeholder={isOver ? 'Drop items now!' : 'Hover to see drop state'}
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Disabled State</h3>
          <DroppableArea
            id="disabled-state"
            variant="default"
            disabled
            placeholder="Cannot receive items"
          />
        </div>
      </div>
    )
  },
}

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-semibold mb-3">Keyboard Navigation Support</h3>
        <p className="text-sm text-secondary-600 mb-4">
          Drop zones should be announced to screen readers and support keyboard interactions
        </p>
      </div>

      <DroppableArea
        id="accessible-zone-1"
        variant="default"
        size="lg"
        role="region"
        aria-label="Task drop zone: Drop tasks here to add them to the project"
        tabIndex={0}
        placeholder={
          <div className="text-center">
            <Icon icon={InboxIcon} size="lg" className="text-secondary-400 mb-2" />
            <p className="font-medium text-secondary-700">Project Tasks</p>
            <p className="text-sm text-secondary-500 mt-1">Drop or press Enter to add tasks</p>
          </div>
        }
      />

      <DroppableArea
        id="accessible-zone-2"
        variant="highlighted"
        size="lg"
        role="region"
        aria-label="Archive drop zone: Drop completed tasks here to archive them"
        tabIndex={0}
        placeholder={
          <div className="text-center">
            <Icon icon={ArchiveIcon} size="lg" className="text-secondary-400 mb-2" />
            <p className="font-medium text-secondary-700">Archive</p>
            <p className="text-sm text-secondary-500 mt-1">Drop completed tasks to archive</p>
          </div>
        }
      />
    </div>
  ),
}

export const RealWorldExample: Story = {
  render: () => (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Project Management Board</h3>
        <p className="text-secondary-600">
          Drag tasks between different status columns to update their progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-secondary-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-secondary-800">To Do</h4>
            <Badge variant="secondary" size="sm">
              3
            </Badge>
          </div>

          <DroppableArea
            id="todo-real"
            variant="minimal"
            size="xl"
            data={{ status: 'todo', allowedTypes: ['task'] }}
            className="min-h-[400px]"
          >
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-secondary-200 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-sm">Setup CI/CD pipeline</h5>
                  <Badge variant="error" size="sm">
                    High
                  </Badge>
                </div>
                <p className="text-xs text-secondary-600 mb-3">
                  Configure GitHub Actions for automated testing and deployment
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary-500">Due: Mar 20</span>
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-xs text-white">JD</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-secondary-200 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-sm">Design user onboarding</h5>
                  <Badge variant="warning" size="sm">
                    Medium
                  </Badge>
                </div>
                <p className="text-xs text-secondary-600 mb-3">
                  Create wireframes and user flow for new user experience
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary-500">Due: Mar 25</span>
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-xs text-white">AM</span>
                  </div>
                </div>
              </div>
            </div>
          </DroppableArea>
        </div>

        {/* In Progress Column */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-blue-800">In Progress</h4>
            <Badge variant="primary" size="sm">
              2
            </Badge>
          </div>

          <DroppableArea
            id="progress-real"
            variant="highlighted"
            size="xl"
            data={{ status: 'in-progress', allowedTypes: ['task'] }}
            className="min-h-[400px]"
            placeholder={
              <div className="text-center">
                <Icon icon={ClockIcon} size="lg" className="text-blue-400 mb-3" />
                <p className="font-medium text-blue-600">Active Work</p>
                <p className="text-sm text-blue-500 mt-1">Drop tasks being worked on</p>
              </div>
            }
          />
        </div>

        {/* Done Column */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-green-800">Done</h4>
            <Badge variant="success" size="sm">
              1
            </Badge>
          </div>

          <DroppableArea
            id="done-real"
            variant="minimal"
            size="xl"
            data={{ status: 'done', allowedTypes: ['task'] }}
            className="min-h-[400px]"
          >
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm opacity-75">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-sm line-through">Setup project structure</h5>
                  <Badge variant="success" size="sm">
                    Done
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-secondary-500">Completed Mar 10</span>
                  <Icon icon={CheckIcon} size="sm" className="text-green-500" />
                </div>
              </div>
            </div>
          </DroppableArea>
        </div>
      </div>
    </div>
  ),
}
