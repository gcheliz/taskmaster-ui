import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../components/ui/molecules/Tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/molecules/Card';
import { Badge } from '../../components/ui/atoms/Badge';
import { Button } from '../../components/ui/atoms/Button';
import {
  HomeFilledIcon,
  TaskIcon,
  UserCircleIcon,
  SettingsIcon,
} from '../../components/ui/atoms/Icon';

const meta: Meta<typeof Tabs> = {
  title: 'Molecules/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A set of layered sections of content that display one panel of content at a time. Perfect for organizing related content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'line', 'pills'],
      description: 'Visual variant of the tabs',
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Default active tab value',
    },
  },
  decorators: [
    Story => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 'tab1',
    variant: 'default',
  },
  render: args => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="tab1">Account</TabsTrigger>
        <TabsTrigger value="tab2">Password</TabsTrigger>
        <TabsTrigger value="tab3">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  className="input-base mt-1 w-full"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  className="input-base mt-1 w-full"
                  placeholder="Enter your email"
                />
              </div>
              <Button>Save changes</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tab2">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current password</label>
                <input
                  type="password"
                  className="input-base mt-1 w-full"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-sm font-medium">New password</label>
                <input
                  type="password"
                  className="input-base mt-1 w-full"
                  placeholder="Enter new password"
                />
              </div>
              <Button>Save password</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tab3">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your application settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-sm text-secondary-600">
                    Receive emails about your account activity
                  </p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Push notifications</p>
                  <p className="text-sm text-secondary-600">
                    Receive push notifications in your browser
                  </p>
                </div>
                <input type="checkbox" />
              </div>
              <Button>Save settings</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Default Variant</h3>
        <Tabs defaultValue="tab1" variant="default">
          <TabsList>
            <TabsTrigger value="tab1">Overview</TabsTrigger>
            <TabsTrigger value="tab2">Analytics</TabsTrigger>
            <TabsTrigger value="tab3">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="text-sm text-secondary-600 mt-4">
              Default variant content
            </p>
          </TabsContent>
          <TabsContent value="tab2">
            <p className="text-sm text-secondary-600 mt-4">Analytics content</p>
          </TabsContent>
          <TabsContent value="tab3">
            <p className="text-sm text-secondary-600 mt-4">Reports content</p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Line Variant</h3>
        <Tabs defaultValue="tab1" variant="line">
          <TabsList>
            <TabsTrigger value="tab1">Overview</TabsTrigger>
            <TabsTrigger value="tab2">Analytics</TabsTrigger>
            <TabsTrigger value="tab3">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="text-sm text-secondary-600 mt-4">
              Line variant content
            </p>
          </TabsContent>
          <TabsContent value="tab2">
            <p className="text-sm text-secondary-600 mt-4">Analytics content</p>
          </TabsContent>
          <TabsContent value="tab3">
            <p className="text-sm text-secondary-600 mt-4">Reports content</p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Pills Variant</h3>
        <Tabs defaultValue="tab1" variant="pills">
          <TabsList>
            <TabsTrigger value="tab1">Overview</TabsTrigger>
            <TabsTrigger value="tab2">Analytics</TabsTrigger>
            <TabsTrigger value="tab3">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="text-sm text-secondary-600 mt-4">
              Pills variant content
            </p>
          </TabsContent>
          <TabsContent value="tab2">
            <p className="text-sm text-secondary-600 mt-4">Analytics content</p>
          </TabsContent>
          <TabsContent value="tab3">
            <p className="text-sm text-secondary-600 mt-4">Reports content</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
};

export const TaskMasterDashboard: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="tasks" variant="line">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="tasks">
            Tasks
            <Badge variant="secondary" size="sm" className="ml-2">
              12
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="projects">
            Projects
            <Badge variant="secondary" size="sm" className="ml-2">
              3
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Active Tasks</h2>
              <Button>Add Task</Button>
            </div>
            <div className="grid gap-4">
              {[
                {
                  id: 1,
                  title: 'Implement user authentication',
                  status: 'in-progress',
                  priority: 'high',
                },
                {
                  id: 2,
                  title: 'Add dark theme support',
                  status: 'pending',
                  priority: 'medium',
                },
                {
                  id: 3,
                  title: 'Fix navigation bug',
                  status: 'done',
                  priority: 'high',
                },
              ].map(task => (
                <Card key={task.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-secondary-600">
                        Task #{task.id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={task.status as any}>{task.status}</Badge>
                      <Badge
                        variant={task.priority === 'high' ? 'error' : 'warning'}
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Projects</h2>
              <Button>New Project</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'TaskMaster UI', progress: 75, tasks: 24 },
                { name: 'Mobile App', progress: 45, tasks: 18 },
                { name: 'API Documentation', progress: 90, tasks: 8 },
              ].map((project, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.tasks} tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'John Doe', role: 'Frontend Developer', avatar: 'JD' },
                { name: 'Jane Smith', role: 'Backend Developer', avatar: 'JS' },
                { name: 'Mike Johnson', role: 'UI/UX Designer', avatar: 'MJ' },
                { name: 'Sarah Wilson', role: 'Project Manager', avatar: 'SW' },
              ].map((member, index) => (
                <Card key={index}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {member.avatar}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-secondary-600">
                        {member.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Analytics</h2>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">142</p>
                    <p className="text-sm text-secondary-600">Total Tasks</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success-600">89</p>
                    <p className="text-sm text-secondary-600">Completed</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning-600">23</p>
                    <p className="text-sm text-secondary-600">In Progress</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const ControlledTabs: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('overview');

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeTab === 'overview' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Switch to Overview
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'details' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('details')}
          >
            Switch to Details
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardContent className="p-4">
                <p>Overview content - controlled externally</p>
                <p className="text-sm text-secondary-600 mt-2">
                  Current tab: {activeTab}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details">
            <Card>
              <CardContent className="p-4">
                <p>Details content - controlled externally</p>
                <p className="text-sm text-secondary-600 mt-2">
                  Current tab: {activeTab}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardContent className="p-4">
                <p>Settings content</p>
                <p className="text-sm text-secondary-600 mt-2">
                  Current tab: {activeTab}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};

export const WithIconsAndBadges: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: () => (
    <div className="bg-white">
      <div className="p-6 space-y-8">
        <h3 className="text-lg font-semibold text-slate-900">
          Navigation Tabs with Icons
        </h3>

        <div className="space-y-8">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-4">
              Enhanced Tabs with Icons and Badges
            </h4>
            <Tabs defaultValue="dashboard" className="w-[500px]">
              <TabsList>
                <TabsTrigger value="dashboard" icon={HomeFilledIcon}>
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="tasks" icon={TaskIcon} badge="12">
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="team" icon={UserCircleIcon}>
                  Team
                </TabsTrigger>
                <TabsTrigger value="settings" icon={SettingsIcon}>
                  Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Dashboard with enhanced visibility and contrast.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tasks">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Task management interface with clean design.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="team">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Team collaboration features with modern design.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Application settings and preferences.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-4">
              Line Variant
            </h4>
            <Tabs defaultValue="overview" variant="line" className="w-[500px]">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Line variant tabs with clean styling.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="analytics">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Analytics dashboard with optimized layout.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reports">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Reporting interface with clean design.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  ),
};
