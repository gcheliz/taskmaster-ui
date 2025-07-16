import { render, screen } from '@testing-library/react';
import { TaskBoardView } from '../TaskBoardView';

describe('TaskBoardView', () => {
  it('renders the main heading', () => {
    render(<TaskBoardView />);
    expect(screen.getByRole('heading', { level: 1, name: 'Task Board' })).toBeInTheDocument();
  });

  it('renders the view description', () => {
    render(<TaskBoardView />);
    expect(screen.getByText('Organize and track your tasks with a visual Kanban-style board interface.')).toBeInTheDocument();
  });

  it('renders coming soon message', () => {
    render(<TaskBoardView />);
    expect(screen.getByRole('heading', { level: 2, name: 'Coming Soon' })).toBeInTheDocument();
    expect(screen.getByText('Task board features will be implemented here.')).toBeInTheDocument();
  });

  it('renders feature list items', () => {
    render(<TaskBoardView />);
    
    const featureItems = [
      'Kanban-style task organization',
      'Drag-and-drop task management',
      'Task status tracking',
      'Repository-linked task updates'
    ];
    
    featureItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('has correct CSS class structure', () => {
    const { container } = render(<TaskBoardView />);
    
    // Check for main view container
    const viewElement = container.querySelector('.task-board-view');
    expect(viewElement).toBeInTheDocument();
    
    // Check for header section
    const headerElement = container.querySelector('.view-header');
    expect(headerElement).toBeInTheDocument();
    
    // Check for content section
    const contentElement = container.querySelector('.view-content');
    expect(contentElement).toBeInTheDocument();
    
    // Check for placeholder message
    const placeholderElement = container.querySelector('.placeholder-message');
    expect(placeholderElement).toBeInTheDocument();
  });

  it('accepts and applies custom className', () => {
    const { container } = render(<TaskBoardView className="custom-task-view" />);
    const viewElement = container.querySelector('.task-board-view');
    expect(viewElement).toHaveClass('task-board-view', 'custom-task-view');
  });

  it('renders feature list with correct structure', () => {
    const { container } = render(<TaskBoardView />);
    
    const featureList = container.querySelector('.feature-list');
    expect(featureList).toBeInTheDocument();
    
    const listItems = container.querySelectorAll('.feature-list li');
    expect(listItems).toHaveLength(4);
  });
});