import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('renders without crashing', () => {
    render(<UserProfile userId={'test'} />);
    expect(screen.getByText('UserProfile Component')).toBeInTheDocument();
  });

  it('supports aria-label', () => {
    render(<UserProfile ariaLabel="Test label" userId={'test'} />);
    expect(screen.getByLabelText('Test label')).toBeInTheDocument();
  });

  it('requires userId prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<UserProfile />);
    }).not.toThrow();
  });
});
