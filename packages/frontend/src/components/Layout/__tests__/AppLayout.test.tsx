import { render, screen } from '@testing-library/react';
import { AppLayout } from '../AppLayout';

describe('AppLayout', () => {
  it('renders all layout sections', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    // Check for header
    expect(screen.getByText('TaskMaster UI')).toBeInTheDocument();
    expect(screen.getByText('User Profile')).toBeInTheDocument();

    // Check for sidebar navigation
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Repository Management')).toBeInTheDocument();
    expect(screen.getByText('Task Board')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Check for main content
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    // Check for footer
    expect(screen.getByText('© 2025 TaskMaster UI. All rights reserved.')).toBeInTheDocument();
    expect(screen.getByText('Status: Online')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('has correct CSS classes for grid layout', () => {
    const { container } = render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    // Check main layout container
    const layoutContainer = container.querySelector('.app-layout');
    expect(layoutContainer).toBeInTheDocument();

    // Check grid areas
    expect(container.querySelector('.app-header')).toBeInTheDocument();
    expect(container.querySelector('.app-sidebar')).toBeInTheDocument();
    expect(container.querySelector('.app-main')).toBeInTheDocument();
    expect(container.querySelector('.app-footer')).toBeInTheDocument();
  });

  it('renders children in main content area', () => {
    render(
      <AppLayout>
        <div data-testid="child-content">Child Component</div>
      </AppLayout>
    );

    const childContent = screen.getByTestId('child-content');
    expect(childContent).toBeInTheDocument();
    expect(childContent.textContent).toBe('Child Component');
  });

  it('has navigation links in sidebar', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    // Check navigation links
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '#dashboard');
    expect(screen.getByRole('link', { name: 'Repository Management' })).toHaveAttribute('href', '#repository-management');
    expect(screen.getByRole('link', { name: 'Task Board' })).toHaveAttribute('href', '#task-board');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '#settings');
  });
});