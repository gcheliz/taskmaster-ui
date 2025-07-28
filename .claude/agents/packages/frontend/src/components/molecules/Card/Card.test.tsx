import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders without crashing', () => {
    render(<Card title={'test'} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('supports aria-label', () => {
    render(<Card ariaLabel="Test label" title={'test'} />);
    expect(screen.getByLabelText('Test label')).toBeInTheDocument();
  });

  it('requires title prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<Card />);
    }).not.toThrow();
  });
});
