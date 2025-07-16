import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer', () => {
  it('renders copyright information', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2025 TaskMaster UI. All rights reserved./)).toBeInTheDocument();
  });

  it('renders application status', () => {
    render(<Footer />);
    expect(screen.getByText('Status: Online')).toBeInTheDocument();
  });

  it('renders version number', () => {
    render(<Footer />);
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('has correct CSS class structure', () => {
    const { container } = render(<Footer />);
    
    // Check for main footer element
    const footerElement = container.querySelector('.app-footer');
    expect(footerElement).toBeInTheDocument();
    
    // Check for footer content container
    const footerContent = container.querySelector('.footer-content');
    expect(footerContent).toBeInTheDocument();
    
    // Check for footer sections
    const footerLeft = container.querySelector('.footer-left');
    expect(footerLeft).toBeInTheDocument();
    
    const footerCenter = container.querySelector('.footer-center');
    expect(footerCenter).toBeInTheDocument();
    
    const footerRight = container.querySelector('.footer-right');
    expect(footerRight).toBeInTheDocument();
  });

  it('accepts and applies custom className', () => {
    const { container } = render(<Footer className="custom-footer" />);
    const footerElement = container.querySelector('.app-footer');
    expect(footerElement).toHaveClass('app-footer', 'custom-footer');
  });

  it('has correct semantic structure', () => {
    render(<Footer />);
    
    // Check that the main element is a footer tag
    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toBeInTheDocument();
  });

  it('displays status with correct styling classes', () => {
    const { container } = render(<Footer />);
    
    const statusElement = container.querySelector('.app-status');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveTextContent('Status: Online');
  });

  it('displays version with correct styling classes', () => {
    const { container } = render(<Footer />);
    
    const versionElement = container.querySelector('.app-version');
    expect(versionElement).toBeInTheDocument();
    expect(versionElement).toHaveTextContent('v1.0.0');
  });

  it('has proper layout structure with three sections', () => {
    const { container } = render(<Footer />);
    
    const footerContent = container.querySelector('.footer-content');
    const sections = footerContent?.children;
    
    expect(sections).toHaveLength(3);
    expect(sections?.[0]).toHaveClass('footer-left');
    expect(sections?.[1]).toHaveClass('footer-center');
    expect(sections?.[2]).toHaveClass('footer-right');
  });
});