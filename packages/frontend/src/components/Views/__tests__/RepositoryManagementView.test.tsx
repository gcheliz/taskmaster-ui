import { render, screen } from '@testing-library/react';
import { RepositoryManagementView } from '../RepositoryManagementView';

describe('RepositoryManagementView', () => {
  it('renders the main heading', () => {
    render(<RepositoryManagementView />);
    expect(screen.getByRole('heading', { level: 1, name: 'Repository Management' })).toBeInTheDocument();
  });

  it('renders the view description', () => {
    render(<RepositoryManagementView />);
    expect(screen.getByText('Connect and manage your Git repositories for task tracking and automation.')).toBeInTheDocument();
  });

  it('renders coming soon message', () => {
    render(<RepositoryManagementView />);
    expect(screen.getByRole('heading', { level: 2, name: 'Coming Soon' })).toBeInTheDocument();
    expect(screen.getByText('Repository management features will be implemented here.')).toBeInTheDocument();
  });

  it('renders feature list items', () => {
    render(<RepositoryManagementView />);
    
    const featureItems = [
      'Connect local Git repositories',
      'View repository status and commits',
      'Manage repository settings',
      'Track repository-linked tasks'
    ];
    
    featureItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('has correct CSS class structure', () => {
    const { container } = render(<RepositoryManagementView />);
    
    // Check for main view container
    const viewElement = container.querySelector('.repository-management-view');
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
    const { container } = render(<RepositoryManagementView className="custom-repo-view" />);
    const viewElement = container.querySelector('.repository-management-view');
    expect(viewElement).toHaveClass('repository-management-view', 'custom-repo-view');
  });

  it('renders feature list with correct structure', () => {
    const { container } = render(<RepositoryManagementView />);
    
    const featureList = container.querySelector('.feature-list');
    expect(featureList).toBeInTheDocument();
    
    const listItems = container.querySelectorAll('.feature-list li');
    expect(listItems).toHaveLength(4);
  });
});