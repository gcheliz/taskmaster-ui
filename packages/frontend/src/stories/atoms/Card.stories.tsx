import type { Meta, StoryObj } from '@storybook/react';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../components/ui/atoms/Card';
import { DraggableCard } from '../../components/ui/atoms/DraggableCard';
import { DroppableArea } from '../../components/ui/atoms/DroppableArea';
import { Button } from '../../components/ui/atoms/Button';
import { Icon, TaskIcon, CompleteIcon, DragHandleIcon, StarFilledIcon } from '../../components/ui/atoms/Icon';

const meta = {
  title: 'Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    interactive: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Card Examples
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md',
    interactive: false,
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card.</p>
      </CardContent>
      <CardFooter>
        <Button variant="primary" size="sm">
          Action
        </Button>
        <Button variant="outline" size="sm">
          Cancel
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    size: 'md',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>This card has elevation and shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content with elevated styling for better visual hierarchy.</p>
      </CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  args: {
    variant: 'default',
    size: 'md',
    interactive: true,
  },
  render: (args) => (
    <Card {...args} onCardClick={() => alert('Card clicked!')}>
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>Click me!</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card responds to clicks and has hover effects.</p>
      </CardContent>
    </Card>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Card variant="elevated" size="md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Icon icon={TaskIcon} color="primary" />
          <CardTitle>Task Card</CardTitle>
        </div>
        <CardDescription>A task management card with icons</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Icon icon={CompleteIcon} color="success" size="sm" />
            <span className="text-sm text-secondary-600 dark:text-secondary-400">
              Completed
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon icon={StarFilledIcon} color="warning" size="sm" />
            <span className="text-sm text-secondary-600 dark:text-secondary-400">
              High Priority
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Card key={size} variant="default" size={size}>
          <CardHeader size={size}>
            <CardTitle size={size}>Size: {size}</CardTitle>
            <CardDescription size={size}>
              This card uses {size} sizing
            </CardDescription>
          </CardHeader>
          <CardContent size={size}>
            <p>Content scaled to {size} size</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {(['default', 'elevated', 'outline', 'ghost'] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          <CardHeader>
            <CardTitle>Variant: {variant}</CardTitle>
            <CardDescription>This card uses {variant} variant</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content with {variant} styling</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

// Drag and Drop Examples
export const DragAndDropExample: Story = {
  render: () => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [items, setItems] = useState([
      { id: '1', title: 'Task 1', description: 'First task to drag' },
      { id: '2', title: 'Task 2', description: 'Second task to drag' },
      { id: '3', title: 'Task 3', description: 'Third task to drag' },
    ]);
    const [droppedItems, setDroppedItems] = useState<typeof items>([]);

    const handleDragStart = (event: DragStartEvent) => {
      setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      
      if (over && over.id === 'droppable-area') {
        const draggedItem = items.find(item => item.id === active.id);
        if (draggedItem) {
          setItems(items.filter(item => item.id !== active.id));
          setDroppedItems([...droppedItems, draggedItem]);
        }
      }
      
      setActiveId(null);
    };

    const activeItem = items.find(item => item.id === activeId);

    return (
      <div className="p-4 max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-secondary-900 dark:text-secondary-100">
          Drag and Drop Cards Example
        </h3>
        
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Area */}
            <div>
              <h4 className="text-md font-medium mb-3 text-secondary-700 dark:text-secondary-300">
                Available Tasks
              </h4>
              <div className="space-y-3">
                {items.map((item) => (
                  <DraggableCard
                    key={item.id}
                    id={item.id}
                    data={item}
                    variant="elevated"
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Icon icon={DragHandleIcon} size="sm" color="muted" />
                        <CardTitle size="sm">{item.title}</CardTitle>
                      </div>
                      <CardDescription size="sm">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </DraggableCard>
                ))}
              </div>
            </div>

            {/* Drop Area */}
            <div>
              <h4 className="text-md font-medium mb-3 text-secondary-700 dark:text-secondary-300">
                Completed Tasks
              </h4>
              <DroppableArea 
                id="droppable-area"
                variant="highlighted"
                size="lg"
                placeholder="Drop tasks here to mark as complete"
              >
                <div className="space-y-3">
                  {droppedItems.map((item) => (
                    <Card key={item.id} variant="outline" className="opacity-75">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <Icon icon={CompleteIcon} size="sm" color="success" />
                          <CardTitle size="sm">{item.title}</CardTitle>
                        </div>
                        <CardDescription size="sm">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </DroppableArea>
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeItem && (
              <DraggableCard
                id={activeItem.id}
                data={activeItem}
                variant="elevated"
                className="rotate-2 scale-105 shadow-xl"
              >
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Icon icon={DragHandleIcon} size="sm" color="muted" />
                    <CardTitle size="sm">{activeItem.title}</CardTitle>
                  </div>
                  <CardDescription size="sm">
                    {activeItem.description}
                  </CardDescription>
                </CardHeader>
              </DraggableCard>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    );
  },
};

export const DarkThemeShowcase: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: () => (
    <div className="">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-secondary-100">
          Dark Theme Cards
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Dark Card</CardTitle>
              <CardDescription>Standard dark theme styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card adapts to dark mode automatically.</p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm">
                Primary Action
              </Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Icon icon={TaskIcon} color="primary" />
                <CardTitle>Elevated with Icons</CardTitle>
              </div>
              <CardDescription>Enhanced shadow and icon support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Icon icon={CompleteIcon} color="success" size="sm" />
                  <span className="text-sm text-secondary-400">Status</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon icon={StarFilledIcon} color="warning" size="sm" />
                  <span className="text-sm text-secondary-400">Priority</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  ),
};