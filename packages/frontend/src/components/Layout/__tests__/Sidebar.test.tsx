import { render, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';

describe('Sidebar', () => {
  it('renders primary navigation links', () => {
    render(<Sidebar />);
    
    // Check for primary feature area links as specified in the requirements
    expect(screen.getByRole('link', { name: 'Repository Management' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Task Board' })).toBeInTheDocument();
  });

  it('renders all navigation links including dashboard and settings', () => {
    render(<Sidebar />);
    
    // Check for all navigation links
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Repository Management' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Task Board' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('has correct href attributes for navigation links', () => {
    render(<Sidebar />);
    
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '#dashboard');
    expect(screen.getByRole('link', { name: 'Repository Management' })).toHaveAttribute('href', '#repository-management');
    expect(screen.getByRole('link', { name: 'Task Board' })).toHaveAttribute('href', '#task-board');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '#settings');
  });

  it('has correct CSS class structure', () => {
    const { container } = render(<Sidebar />);
    
    // Check for main sidebar element
    const sidebarElement = container.querySelector('.app-sidebar');
    expect(sidebarElement).toBeInTheDocument();
    
    // Check for navigation container
    const navElement = container.querySelector('.sidebar-nav');
    expect(navElement).toBeInTheDocument();
    
    // Check for navigation list
    const listElement = container.querySelector('.sidebar-nav ul');
    expect(listElement).toBeInTheDocument();
  });

  it('accepts and applies custom className', () => {
    const { container } = render(<Sidebar className="custom-sidebar" />);
    const sidebarElement = container.querySelector('.app-sidebar');
    expect(sidebarElement).toHaveClass('app-sidebar', 'custom-sidebar');
  });

  it('has correct semantic structure', () => {
    render(<Sidebar />);
    
    // Check that the main element is an aside tag with navigation
    const asideElement = screen.getByRole('complementary');
    expect(asideElement).toBeInTheDocument();
    
    // Check for navigation element
    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();
  });

  it('renders navigation items in a list structure', () => {
    const { container } = render(<Sidebar />);
    
    const listItems = container.querySelectorAll('.sidebar-nav li');
    expect(listItems).toHaveLength(4);
    
    // Each list item should contain a link
    listItems.forEach(item => {
      expect(item.querySelector('a')).toBeInTheDocument();
    });
  });
});