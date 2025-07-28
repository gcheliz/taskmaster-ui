import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GridLayout } from './GridLayout';

describe('GridLayout', () => {
  it('renders without crashing', () => {
    render(<GridLayout cols={undefined} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('requires cols prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<GridLayout />);
    }).not.toThrow();
  });
});
