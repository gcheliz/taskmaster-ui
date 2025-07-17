import type { Meta, StoryObj } from '@storybook/react-vite';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '../../components/ui/molecules/Card';
import { Button } from '../../components/ui/atoms/Button';
import { Badge } from '../../components/ui/atoms/Badge';
import { Icon, CheckIcon, EyeIcon, PencilIcon } from '../../components/ui/atoms/Icon';

const meta: Meta<typeof Card> = {
  title: 'Molecules/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component with header, content, and footer sections. Perfect for displaying structured content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outline', 'elevated', 'ghost'],
      description: 'Visual variant of the card',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Padding size of the card',
    },
    interactive: {
      control: { type: 'boolean' },
      description: 'Whether the card is interactive (clickable)',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          This is a description of what this card contains.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card variant="default">
        <CardContent>
          <p className="font-medium">Default</p>
          <p className="text-sm text-secondary-600">Standard card with border</p>
        </CardContent>
      </Card>
      
      <Card variant="outline">
        <CardContent>
          <p className="font-medium">Outline</p>
          <p className="text-sm text-secondary-600">Card with prominent border</p>
        </CardContent>
      </Card>
      
      <Card variant="elevated">
        <CardContent>
          <p className="font-medium">Elevated</p>
          <p className="text-sm text-secondary-600">Card with shadow elevation</p>
        </CardContent>
      </Card>
      
      <Card variant="ghost">
        <CardContent>
          <p className="font-medium">Ghost</p>
          <p className="text-sm text-secondary-600">Minimal card without border</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Card size="sm">
        <CardContent>
          <p className="font-medium">Small Card</p>
          <p className="text-sm text-secondary-600">Compact padding</p>
        </CardContent>
      </Card>
      
      <Card size="md">
        <CardContent>
          <p className="font-medium">Medium Card</p>
          <p className="text-sm text-secondary-600">Standard padding</p>
        </CardContent>
      </Card>
      
      <Card size="lg">
        <CardContent>
          <p className="font-medium">Large Card</p>
          <p className="text-sm text-secondary-600">Generous padding</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card interactive onClick={() => alert('Card clicked!')}>
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>
          This card is clickable and shows hover effects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Click anywhere on this card to see the interaction.</p>
      </CardContent>
    </Card>
  ),
};

export const TaskCard: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Task #123: Implement user authentication</CardTitle>
          <Badge variant="in-progress">In Progress</Badge>
        </div>
        <CardDescription>
          Create login and registration forms with proper validation and error handling.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-secondary-600">Progress:</span>
            <span className="font-medium">60%</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '60%' }} />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" size="sm">Frontend</Badge>
            <Badge variant="warning" size="sm">High Priority</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter alignment="between">
        <div className="text-sm text-secondary-600">
          Due: Dec 15, 2024
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Icon icon={EyeIcon} size="sm" />
          </Button>
          <Button size="sm" variant="outline">
            <Icon icon={PencilIcon} size="sm" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <Card>
      <CardHeader alignment="center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-2">
          <span className="text-primary-600 font-semibold text-lg">JD</span>
        </div>
        <CardTitle>John Doe</CardTitle>
        <CardDescription>Senior Frontend Developer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-secondary-600">Email:</span>
            <span>john@example.com</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-600">Location:</span>
            <span>San Francisco, CA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-600">Joined:</span>
            <span>Jan 2023</span>
          </div>
        </div>
      </CardContent>
      <CardFooter alignment="center">
        <div className="flex gap-2">
          <Button size="sm">View Profile</Button>
          <Button size="sm" variant="outline">Message</Button>
        </div>
      </CardFooter>
    </Card>
  ),
};

export const StatsCard: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Tasks</p>
              <p className="text-2xl font-bold">142</p>
            </div>
            <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Icon icon={CheckIcon} size="sm" color="primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Completed</p>
              <p className="text-2xl font-bold text-success-600">89</p>
            </div>
            <div className="h-8 w-8 bg-success-100 rounded-full flex items-center justify-center">
              <Icon icon={CheckIcon} size="sm" color="success" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">In Progress</p>
              <p className="text-2xl font-bold text-warning-600">23</p>
            </div>
            <div className="h-8 w-8 bg-warning-100 rounded-full flex items-center justify-center">
              <Icon icon={EyeIcon} size="sm" color="warning" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

export const NotificationCard: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon icon={CheckIcon} size="sm" color="primary" />
            </div>
            <div>
              <CardTitle className="text-base">Task Completed</CardTitle>
              <CardDescription>
                "Implement user authentication" was marked as complete
              </CardDescription>
            </div>
          </div>
          <Badge variant="success" size="sm">New</Badge>
        </div>
      </CardHeader>
      <CardFooter>
        <div className="flex justify-between items-center w-full">
          <span className="text-sm text-secondary-500">2 minutes ago</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost">Dismiss</Button>
            <Button size="sm">View Task</Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  ),
};

export const ComplexLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>TaskMaster UI Development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-secondary-600">Total Tasks</p>
                <p className="font-semibold">142</p>
              </div>
              <div>
                <p className="text-secondary-600">Completed</p>
                <p className="font-semibold text-success-600">107</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">View Details</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Task completed', task: 'User authentication', time: '2m ago' },
              { action: 'Task created', task: 'Add dark theme', time: '1h ago' },
              { action: 'Task updated', task: 'Fix navigation bug', time: '3h ago' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{item.action}</p>
                  <p className="text-secondary-600">{item.task}</p>
                </div>
                <span className="text-secondary-500 text-xs">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">View All Activity</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};