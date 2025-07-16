import { render, screen } from '@testing-library/react';
import { Header } from '../Header';

describe('Header', () => {
  it('renders the TaskMaster UI logo/title', () => {
    render(<Header />);
    expect(screen.getByText('TaskMaster UI')).toBeInTheDocument();
  });

  it('renders the user profile section', () => {
    render(<Header />);
    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });

  it('has the correct CSS class structure', () => {
    const { container } = render(<Header />);
    
    // Check for main header element
    const headerElement = container.querySelector('.app-header');
    expect(headerElement).toBeInTheDocument();
    
    // Check for header content container
    const headerContent = container.querySelector('.header-content');
    expect(headerContent).toBeInTheDocument();
    
    // Check for logo section
    const logoSection = container.querySelector('.logo-section');
    expect(logoSection).toBeInTheDocument();
    
    // Check for user section
    const userSection = container.querySelector('.user-section');
    expect(userSection).toBeInTheDocument();
  });

  it('accepts and applies custom className', () => {
    const { container } = render(<Header className="custom-header" />);
    const headerElement = container.querySelector('.app-header');
    expect(headerElement).toHaveClass('app-header', 'custom-header');
  });

  it('has correct semantic structure', () => {
    render(<Header />);
    
    // Check that the main element is a header tag
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
    
    // Check for heading element
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('TaskMaster UI');
  });
});