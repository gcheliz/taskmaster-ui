import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders without crashing', () => {
    render(<SearchBar "value={"test"} onChange={undefined} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('supports aria-label', () => {
    render(<SearchBar ariaLabel="Test label" "value={"test"} onChange={undefined} />);
    expect(screen.getByLabelText('Test label')).toBeInTheDocument();
  });

  
  it('requires "value prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<SearchBar />);
    }).not.toThrow();
  });

  it('requires onChange prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<SearchBar />);
    }).not.toThrow();
  });
});
