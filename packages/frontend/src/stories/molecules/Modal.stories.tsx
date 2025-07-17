import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { 
  Modal, 
  ModalTrigger, 
  ModalContent, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription, 
  ModalBody, 
  ModalFooter,
  ModalClose 
} from '../../components/ui/molecules/Modal';
import { Button } from '../../components/ui/atoms/Button';
import { FormField } from '../../components/ui/molecules/FormField';
import { Card, CardContent } from '../../components/ui/molecules/Card';
import { Badge } from '../../components/ui/atoms/Badge';

const meta: Meta<typeof Modal> = {
  title: 'Molecules/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modal dialog component that overlays content on top of the main interface. Includes focus trapping, keyboard navigation, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Controls the open state of the modal',
    },
    onOpenChange: {
      action: 'onOpenChange',
      description: 'Callback fired when the open state changes',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full min-h-[200px] flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Modal open={open} onOpenChange={setOpen}>
        <ModalTrigger>Open Modal</ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Modal Title</ModalTitle>
            <ModalDescription>
              This is a basic modal dialog with a title and description.
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-secondary-600">
              This is the modal body content. You can place any content here.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
};

export const WithCloseButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Modal open={open} onOpenChange={setOpen}>
        <ModalTrigger>Open Modal with Close Button</ModalTrigger>
        <ModalContent>
          <ModalClose />
          <ModalHeader>
            <ModalTitle>Modal with Close Button</ModalTitle>
            <ModalDescription>
              This modal includes a close button in the top-right corner.
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-secondary-600">
              You can close this modal by clicking the X button, pressing Escape, or clicking outside.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setOpen(false)}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [smallOpen, setSmallOpen] = useState(false);
    const [mediumOpen, setMediumOpen] = useState(false);
    const [largeOpen, setLargeOpen] = useState(false);
    const [xlOpen, setXlOpen] = useState(false);

    return (
      <div className="flex gap-4 flex-wrap">
        <Modal open={smallOpen} onOpenChange={setSmallOpen}>
          <ModalTrigger variant="outline">Small Modal</ModalTrigger>
          <ModalContent size="sm">
            <ModalClose />
            <ModalHeader>
              <ModalTitle>Small Modal</ModalTitle>
              <ModalDescription>This is a small-sized modal.</ModalDescription>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm">Compact content for quick actions.</p>
            </ModalBody>
            <ModalFooter>
              <Button size="sm" onClick={() => setSmallOpen(false)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal open={mediumOpen} onOpenChange={setMediumOpen}>
          <ModalTrigger variant="outline">Medium Modal</ModalTrigger>
          <ModalContent size="md">
            <ModalClose />
            <ModalHeader>
              <ModalTitle>Medium Modal</ModalTitle>
              <ModalDescription>This is a medium-sized modal (default).</ModalDescription>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm">Standard content with moderate amount of information.</p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setMediumOpen(false)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal open={largeOpen} onOpenChange={setLargeOpen}>
          <ModalTrigger variant="outline">Large Modal</ModalTrigger>
          <ModalContent size="lg">
            <ModalClose />
            <ModalHeader>
              <ModalTitle>Large Modal</ModalTitle>
              <ModalDescription>This is a large-sized modal for more content.</ModalDescription>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm">
                Extended content area for detailed information, forms, or complex interactions.
                This size provides more space for comprehensive content.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setLargeOpen(false)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal open={xlOpen} onOpenChange={setXlOpen}>
          <ModalTrigger variant="outline">Extra Large Modal</ModalTrigger>
          <ModalContent size="xl">
            <ModalClose />
            <ModalHeader>
              <ModalTitle>Extra Large Modal</ModalTitle>
              <ModalDescription>This is an extra large modal for extensive content.</ModalDescription>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm">
                Maximum content area for dashboards, detailed forms, or complex data displays.
                This size is ideal when you need to show a lot of information without scrolling.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setXlOpen(false)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    );
  },
};

export const FormModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`Form submitted: ${JSON.stringify(formData, null, 2)}`);
      setOpen(false);
    };

    return (
      <Modal open={open} onOpenChange={setOpen}>
        <ModalTrigger>Contact Form</ModalTrigger>
        <ModalContent size="lg">
          <ModalClose />
          <ModalHeader>
            <ModalTitle>Contact Us</ModalTitle>
            <ModalDescription>
              Send us a message and we'll get back to you as soon as possible.
            </ModalDescription>
          </ModalHeader>
          <form onSubmit={handleSubmit}>
            <ModalBody className="space-y-4">
              <FormField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                required
              />
              <FormField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                required
              />
              <FormField
                label="Message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your message"
                helpText="Tell us how we can help you"
                required
              />
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Send Message
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
  },
};

export const ConfirmationModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
      alert('Action confirmed!');
      setOpen(false);
    };

    return (
      <Modal open={open} onOpenChange={setOpen}>
        <ModalTrigger variant="destructive">Delete Item</ModalTrigger>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>Confirm Deletion</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
};

export const TaskDetailsModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    const task = {
      id: 'TSK-001',
      title: 'Implement user authentication system',
      description: 'Create a comprehensive authentication system with login, registration, and password reset functionality.',
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: '2024-02-15',
      created: '2024-01-20',
      tags: ['backend', 'security', 'api'],
      comments: [
        {
          id: 1,
          author: 'John Doe',
          content: 'Started working on the OAuth integration.',
          timestamp: '2024-01-21 10:30',
        },
        {
          id: 2,
          author: 'Jane Smith',
          content: 'Please make sure to follow the security guidelines.',
          timestamp: '2024-01-21 14:15',
        },
      ],
    };

    return (
      <Modal open={open} onOpenChange={setOpen}>
        <ModalTrigger>View Task Details</ModalTrigger>
        <ModalContent size="lg">
          <ModalClose />
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              {task.title}
              <Badge variant={task.status as any}>{task.status}</Badge>
            </ModalTitle>
            <ModalDescription>
              Task ID: {task.id} • Created {task.created}
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-secondary-700">Priority</h4>
                <Badge variant={task.priority === 'high' ? 'error' : 'warning'}>
                  {task.priority}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-secondary-700">Assignee</h4>
                <p className="text-sm">{task.assignee}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-secondary-700">Due Date</h4>
                <p className="text-sm">{task.dueDate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-secondary-700">Tags</h4>
                <div className="flex gap-1 flex-wrap">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-secondary-700 mb-2">Description</h4>
              <p className="text-sm text-secondary-600">{task.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-secondary-700 mb-3">Comments</h4>
              <div className="space-y-3">
                {task.comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">{comment.author}</span>
                        <span className="text-xs text-secondary-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-secondary-600">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button>
              Edit Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
};

export const NestedModals: Story = {
  render: () => {
    const [firstModalOpen, setFirstModalOpen] = useState(false);
    const [secondModalOpen, setSecondModalOpen] = useState(false);

    return (
      <>
        <Modal open={firstModalOpen} onOpenChange={setFirstModalOpen}>
          <ModalTrigger>Open First Modal</ModalTrigger>
          <ModalContent>
            <ModalClose />
            <ModalHeader>
              <ModalTitle>First Modal</ModalTitle>
              <ModalDescription>
                This is the first modal. You can open another modal from here.
              </ModalDescription>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-secondary-600 mb-4">
                Click the button below to open a second modal on top of this one.
              </p>
              <Modal open={secondModalOpen} onOpenChange={setSecondModalOpen}>
                <ModalTrigger variant="outline">Open Second Modal</ModalTrigger>
                <ModalContent size="sm">
                  <ModalClose />
                  <ModalHeader>
                    <ModalTitle>Second Modal</ModalTitle>
                    <ModalDescription>
                      This modal is stacked on top of the first one.
                    </ModalDescription>
                  </ModalHeader>
                  <ModalBody>
                    <p className="text-sm text-secondary-600">
                      Nested modals work properly with focus management and z-index stacking.
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button onClick={() => setSecondModalOpen(false)}>
                      Close Second Modal
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setFirstModalOpen(false)}>
                Close First Modal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  },
};

export const AccessibilityExample: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Modal open={open} onOpenChange={setOpen}>
        <ModalTrigger>Accessibility Features Demo</ModalTrigger>
        <ModalContent>
          <ModalClose />
          <ModalHeader>
            <ModalTitle>Accessibility Features</ModalTitle>
            <ModalDescription>
              This modal demonstrates various accessibility features.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Keyboard Navigation</h4>
              <ul className="text-sm text-secondary-600 space-y-1">
                <li>• Press <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">Tab</kbd> to navigate between focusable elements</li>
                <li>• Press <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">Shift + Tab</kbd> to navigate backwards</li>
                <li>• Press <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">Escape</kbd> to close the modal</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Button variant="outline" size="sm">First Focusable</Button>
              <Button variant="outline" size="sm">Second Focusable</Button>
              <Button variant="outline" size="sm">Third Focusable</Button>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">ARIA Attributes</h4>
              <ul className="text-sm text-secondary-600 space-y-1">
                <li>• <code>role="dialog"</code> identifies the modal</li>
                <li>• <code>aria-modal="true"</code> indicates modal behavior</li>
                <li>• <code>aria-labelledby</code> connects title to content</li>
                <li>• Focus is trapped within the modal</li>
              </ul>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setOpen(false)}>
              Last Focusable Element
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
};

export const ControlledModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [counter, setCounter] = useState(0);

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)} disabled={open}>
            Open Modal
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={!open}>
            Close Modal
          </Button>
          <Button variant="outline" onClick={() => setCounter(c => c + 1)}>
            Increment: {counter}
          </Button>
        </div>
        
        <Modal open={open} onOpenChange={setOpen}>
          <ModalContent>
            <ModalClose />
            <ModalHeader>
              <ModalTitle>Controlled Modal</ModalTitle>
              <ModalDescription>
                This modal's state is controlled externally.
              </ModalDescription>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-secondary-600">
                Current counter value: <strong>{counter}</strong>
              </p>
              <p className="text-sm text-secondary-600 mt-2">
                The modal state is managed by external buttons and will update reactively.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setCounter(c => c + 1)}>
                Increment from Modal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    );
  },
};