import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
  PaginationEllipsis,
  CompletePagination 
} from '../../components/ui/molecules/Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Molecules/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Pagination component for navigating through multiple pages of content. Includes complete pagination with ellipsis support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the pagination elements',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
  },
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const WithEllipsis: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>4</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>5</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>6</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Small</h3>
        <Pagination size="sm">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious size="sm" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink size="sm">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink size="sm" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink size="sm">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext size="sm" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Medium (Default)</h3>
        <Pagination size="md">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious size="md" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink size="md">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink size="md" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink size="md">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext size="md" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Large</h3>
        <Pagination size="lg">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious size="lg" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink size="lg">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink size="lg" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink size="lg">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext size="lg" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Default Variant</h3>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious variant="default" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink variant="default">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink variant="default" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink variant="default">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext variant="default" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Outline Variant</h3>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious variant="outline" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink variant="outline">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink variant="outline" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink variant="outline">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext variant="outline" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  ),
};

export const CompletePaginationExample: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(5);
    const totalPages = 20;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-secondary-600">
            Page {currentPage} of {totalPages}
          </p>
        </div>
        
        <CompletePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          maxVisiblePages={5}
        />
        
        <div className="text-center">
          <p className="text-xs text-secondary-500">
            Click on page numbers to navigate. This example shows ellipsis when there are many pages.
          </p>
        </div>
      </div>
    );
  },
};

export const CompletePaginationSizes: Story = {
  render: () => {
    const [smallPage, setSmallPage] = useState(2);
    const [mediumPage, setMediumPage] = useState(3);
    const [largePage, setLargePage] = useState(4);

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium mb-4">Small Size</h3>
          <CompletePagination
            currentPage={smallPage}
            totalPages={10}
            onPageChange={setSmallPage}
            size="sm"
            maxVisiblePages={5}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-4">Medium Size</h3>
          <CompletePagination
            currentPage={mediumPage}
            totalPages={10}
            onPageChange={setMediumPage}
            size="md"
            maxVisiblePages={5}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-4">Large Size</h3>
          <CompletePagination
            currentPage={largePage}
            totalPages={10}
            onPageChange={setLargePage}
            size="lg"
            maxVisiblePages={5}
          />
        </div>
      </div>
    );
  },
};

export const TaskListPagination: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 8;
    const tasksPerPage = 5;
    const totalTasks = 38;

    const startTask = (currentPage - 1) * tasksPerPage + 1;
    const endTask = Math.min(currentPage * tasksPerPage, totalTasks);

    return (
      <div className="space-y-6">
        <div className="border border-secondary-200 rounded-lg">
          <div className="p-4 border-b border-secondary-200">
            <h3 className="font-medium">Task List</h3>
            <p className="text-sm text-secondary-600">
              Showing {startTask}-{endTask} of {totalTasks} tasks
            </p>
          </div>
          
          <div className="divide-y divide-secondary-200">
            {Array.from({ length: Math.min(tasksPerPage, totalTasks - startTask + 1) }, (_, i) => {
              const taskNumber = startTask + i;
              return (
                <div key={taskNumber} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Task #{taskNumber}</h4>
                    <p className="text-sm text-secondary-600">Sample task description</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="status-in-progress px-2 py-1 rounded text-xs">
                      In Progress
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="p-4 border-t border-secondary-200">
            <CompletePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              maxVisiblePages={5}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const MinimalPagination: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(3);
    const totalPages = 5;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="font-medium mb-2">Minimal Pagination</h3>
          <p className="text-sm text-secondary-600">For small page counts</p>
        </div>
        
        <CompletePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showPreviousNext={false}
          maxVisiblePages={5}
        />
      </div>
    );
  },
};

export const WithoutPreviousNext: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(5);
    const totalPages = 15;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="font-medium mb-2">Numbers Only</h3>
          <p className="text-sm text-secondary-600">Without Previous/Next buttons</p>
        </div>
        
        <CompletePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showPreviousNext={false}
          maxVisiblePages={7}
        />
      </div>
    );
  },
};