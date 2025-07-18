import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownCheckboxItem,
  DropdownRadioGroup,
  DropdownRadioItem,
} from '../../components/ui/molecules/Dropdown';
import { Button } from '../../components/ui/atoms/Button';
import { Badge } from '../../components/ui/atoms/Badge';
import {
  Icon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '../../components/ui/atoms/Icon';

const meta: Meta<typeof Dropdown> = {
  title: 'Molecules/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A dropdown menu component that displays a list of options in an overlay. Includes support for keyboard navigation, checkboxes, radio groups, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Controls the open state of the dropdown',
    },
    onOpenChange: {
      action: 'onOpenChange',
      description: 'Callback fired when the open state changes',
    },
  },
  decorators: [
    Story => (
      <div className="w-full min-h-[300px] flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>Open Menu</DropdownTrigger>
      <DropdownContent>
        <DropdownItem>Profile</DropdownItem>
        <DropdownItem>Settings</DropdownItem>
        <DropdownItem>Logout</DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger variant="outline">Actions</DropdownTrigger>
      <DropdownContent>
        <DropdownItem>
          <Icon icon={PlusIcon} size="sm" className="mr-2" />
          Create New
        </DropdownItem>
        <DropdownItem>
          <Icon icon={PencilIcon} size="sm" className="mr-2" />
          Edit
        </DropdownItem>
        <DropdownItem>
          <Icon icon={EyeIcon} size="sm" className="mr-2" />
          View Details
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem variant="destructive">
          <Icon icon={TrashIcon} size="sm" className="mr-2" />
          Delete
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
};

export const WithLabelsAndSeparators: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>My Account</DropdownTrigger>
      <DropdownContent>
        <DropdownLabel>My Account</DropdownLabel>
        <DropdownItem>Profile</DropdownItem>
        <DropdownItem>Billing</DropdownItem>
        <DropdownItem>Team</DropdownItem>
        <DropdownSeparator />
        <DropdownLabel>Preferences</DropdownLabel>
        <DropdownItem>Settings</DropdownItem>
        <DropdownItem>Keyboard shortcuts</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Support</DropdownItem>
        <DropdownItem>API</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Logout</DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      <Dropdown>
        <DropdownTrigger size="sm">Small</DropdownTrigger>
        <DropdownContent size="sm">
          <DropdownItem size="sm">Profile</DropdownItem>
          <DropdownItem size="sm">Settings</DropdownItem>
          <DropdownItem size="sm">Logout</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <Dropdown>
        <DropdownTrigger size="md">Medium</DropdownTrigger>
        <DropdownContent size="md">
          <DropdownItem size="md">Profile</DropdownItem>
          <DropdownItem size="md">Settings</DropdownItem>
          <DropdownItem size="md">Logout</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <Dropdown>
        <DropdownTrigger size="lg">Large</DropdownTrigger>
        <DropdownContent size="lg">
          <DropdownItem size="lg">Profile</DropdownItem>
          <DropdownItem size="lg">Settings</DropdownItem>
          <DropdownItem size="lg">Logout</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
};

export const WithCheckboxItems: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [marketing, setMarketing] = useState(false);
    const [social, setSocial] = useState(true);

    return (
      <Dropdown>
        <DropdownTrigger variant="outline">Notifications</DropdownTrigger>
        <DropdownContent>
          <DropdownLabel>Email Notifications</DropdownLabel>
          <DropdownCheckboxItem
            checked={notifications}
            onCheckedChange={setNotifications}
          >
            Comments
          </DropdownCheckboxItem>
          <DropdownCheckboxItem
            checked={marketing}
            onCheckedChange={setMarketing}
          >
            Marketing emails
          </DropdownCheckboxItem>
          <DropdownCheckboxItem checked={social} onCheckedChange={setSocial}>
            Social notifications
          </DropdownCheckboxItem>
          <DropdownSeparator />
          <DropdownItem>More settings...</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
  },
};

export const WithRadioGroup: Story = {
  render: () => {
    const [theme, setTheme] = useState('system');

    return (
      <Dropdown>
        <DropdownTrigger variant="outline">Theme: {theme}</DropdownTrigger>
        <DropdownContent>
          <DropdownLabel>Theme</DropdownLabel>
          <DropdownRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownRadioItem value="light">Light</DropdownRadioItem>
            <DropdownRadioItem value="dark">Dark</DropdownRadioItem>
            <DropdownRadioItem value="system">System</DropdownRadioItem>
          </DropdownRadioGroup>
        </DropdownContent>
      </Dropdown>
    );
  },
};

export const TaskActionsDropdown: Story = {
  render: () => {
    const [taskStatus, setTaskStatus] = useState('in-progress');
    const [showAssigned, setShowAssigned] = useState(true);
    const [showCompleted, setShowCompleted] = useState(false);

    const handleAction = (action: string) => {
      alert(`Action: ${action}`);
    };

    return (
      <div className="space-y-4">
        <div className="p-4 border border-secondary-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Implement user authentication</h3>
              <p className="text-sm text-secondary-600">Task #TSK-001</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={taskStatus as any}>{taskStatus}</Badge>
              <Dropdown>
                <DropdownTrigger variant="ghost" size="sm">
                  Actions
                </DropdownTrigger>
                <DropdownContent align="end">
                  <DropdownLabel>Quick Actions</DropdownLabel>
                  <DropdownItem onClick={() => handleAction('edit')}>
                    <Icon icon={PencilIcon} size="sm" className="mr-2" />
                    Edit Task
                  </DropdownItem>
                  <DropdownItem onClick={() => handleAction('duplicate')}>
                    <Icon icon={PlusIcon} size="sm" className="mr-2" />
                    Duplicate
                  </DropdownItem>
                  <DropdownItem onClick={() => handleAction('view')}>
                    <Icon icon={EyeIcon} size="sm" className="mr-2" />
                    View Details
                  </DropdownItem>
                  <DropdownSeparator />

                  <DropdownLabel>Change Status</DropdownLabel>
                  <DropdownRadioGroup
                    value={taskStatus}
                    onValueChange={setTaskStatus}
                  >
                    <DropdownRadioItem value="pending">
                      Pending
                    </DropdownRadioItem>
                    <DropdownRadioItem value="in-progress">
                      In Progress
                    </DropdownRadioItem>
                    <DropdownRadioItem value="review">
                      Under Review
                    </DropdownRadioItem>
                    <DropdownRadioItem value="done">
                      Completed
                    </DropdownRadioItem>
                  </DropdownRadioGroup>

                  <DropdownSeparator />
                  <DropdownItem
                    variant="destructive"
                    onClick={() => handleAction('delete')}
                  >
                    <Icon icon={TrashIcon} size="sm" className="mr-2" />
                    Delete Task
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            </div>
          </div>
        </div>

        <div className="p-4 border border-secondary-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Task Filters</h3>
            <Dropdown>
              <DropdownTrigger variant="outline" size="sm">
                Filter Options
              </DropdownTrigger>
              <DropdownContent>
                <DropdownLabel>Show Tasks</DropdownLabel>
                <DropdownCheckboxItem
                  checked={showAssigned}
                  onCheckedChange={setShowAssigned}
                >
                  Assigned to me
                </DropdownCheckboxItem>
                <DropdownCheckboxItem
                  checked={showCompleted}
                  onCheckedChange={setShowCompleted}
                >
                  Completed tasks
                </DropdownCheckboxItem>
                <DropdownSeparator />
                <DropdownItem>Reset filters</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
          <div className="text-sm text-secondary-600">
            Filters: {showAssigned && 'Assigned'} {showCompleted && 'Completed'}
          </div>
        </div>
      </div>
    );
  },
};

export const NestedMenuExample: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-secondary-600">
        This demonstrates multiple independent dropdown menus that can be open
        simultaneously.
      </p>
      <div className="flex gap-4">
        <Dropdown>
          <DropdownTrigger variant="outline">File</DropdownTrigger>
          <DropdownContent>
            <DropdownItem>New File</DropdownItem>
            <DropdownItem>Open...</DropdownItem>
            <DropdownItem>Save</DropdownItem>
            <DropdownSeparator />
            <DropdownItem>Export</DropdownItem>
          </DropdownContent>
        </Dropdown>

        <Dropdown>
          <DropdownTrigger variant="outline">Edit</DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Undo</DropdownItem>
            <DropdownItem>Redo</DropdownItem>
            <DropdownSeparator />
            <DropdownItem>Cut</DropdownItem>
            <DropdownItem>Copy</DropdownItem>
            <DropdownItem>Paste</DropdownItem>
          </DropdownContent>
        </Dropdown>

        <Dropdown>
          <DropdownTrigger variant="outline">View</DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Zoom In</DropdownItem>
            <DropdownItem>Zoom Out</DropdownItem>
            <DropdownSeparator />
            <DropdownItem>Full Screen</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </div>
  ),
};

export const ControlledDropdown: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
            {open ? 'Close' : 'Open'} Dropdown
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedItem('')}
          >
            Clear Selection
          </Button>
        </div>

        <Dropdown open={open} onOpenChange={setOpen}>
          <DropdownTrigger disabled={open}>
            Select Option: {selectedItem || 'None'}
          </DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>Options</DropdownLabel>
            <DropdownItem onSelect={() => setSelectedItem('Option 1')}>
              Option 1
            </DropdownItem>
            <DropdownItem onSelect={() => setSelectedItem('Option 2')}>
              Option 2
            </DropdownItem>
            <DropdownItem onSelect={() => setSelectedItem('Option 3')}>
              Option 3
            </DropdownItem>
          </DropdownContent>
        </Dropdown>

        <div className="text-sm text-secondary-600">
          Status: {open ? 'Open' : 'Closed'} | Selected:{' '}
          {selectedItem || 'None'}
        </div>
      </div>
    );
  },
};

export const WithDisabledItems: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger variant="outline">User Actions</DropdownTrigger>
      <DropdownContent>
        <DropdownItem>View Profile</DropdownItem>
        <DropdownItem>Edit Profile</DropdownItem>
        <DropdownItem disabled>Change Password (Coming Soon)</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Settings</DropdownItem>
        <DropdownItem disabled>Admin Panel (No Access)</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Logout</DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
};

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-secondary-600">
        <h4 className="font-medium mb-2">Keyboard Navigation:</h4>
        <ul className="space-y-1">
          <li>
            •{' '}
            <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">
              Enter/Space
            </kbd>{' '}
            to open menu
          </li>
          <li>
            •{' '}
            <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">
              Arrow Keys
            </kbd>{' '}
            to navigate items
          </li>
          <li>
            •{' '}
            <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">
              Enter/Space
            </kbd>{' '}
            to select item
          </li>
          <li>
            •{' '}
            <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">
              Escape
            </kbd>{' '}
            to close menu
          </li>
          <li>
            •{' '}
            <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">
              Home/End
            </kbd>{' '}
            to jump to first/last item
          </li>
        </ul>
      </div>

      <Dropdown>
        <DropdownTrigger>Accessible Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownLabel>Navigation</DropdownLabel>
          <DropdownItem>First Item</DropdownItem>
          <DropdownItem>Second Item</DropdownItem>
          <DropdownItem>Third Item</DropdownItem>
          <DropdownItem disabled>Disabled Item</DropdownItem>
          <DropdownItem>Last Item</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
};

export const AlignmentAndPositioning: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 w-full">
      <div className="text-center">
        <h4 className="text-sm font-medium mb-2">Align Start</h4>
        <Dropdown>
          <DropdownTrigger variant="outline" size="sm">
            Menu
          </DropdownTrigger>
          <DropdownContent align="start">
            <DropdownItem>Option 1</DropdownItem>
            <DropdownItem>Option 2</DropdownItem>
            <DropdownItem>Option 3</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>

      <div className="text-center">
        <h4 className="text-sm font-medium mb-2">Align Center</h4>
        <Dropdown>
          <DropdownTrigger variant="outline" size="sm">
            Menu
          </DropdownTrigger>
          <DropdownContent align="center">
            <DropdownItem>Option 1</DropdownItem>
            <DropdownItem>Option 2</DropdownItem>
            <DropdownItem>Option 3</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>

      <div className="text-center">
        <h4 className="text-sm font-medium mb-2">Align End</h4>
        <Dropdown>
          <DropdownTrigger variant="outline" size="sm">
            Menu
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownItem>Option 1</DropdownItem>
            <DropdownItem>Option 2</DropdownItem>
            <DropdownItem>Option 3</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </div>
  ),
};
