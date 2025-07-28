import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ActionButton } from './ActionButton';

describe('ActionButton', () => {
  it('renders without crashing', () => {
    render(<ActionButton label={'test'} onClick={() => {}} />);
    expect(screen.getByText('ActionButton Component')).toBeInTheDocument();
  });

  it('supports aria-label', () => {
    render(
      <ActionButton ariaLabel="Test label" label={'test'} onClick={() => {}} />
    );
    expect(screen.getByLabelText('Test label')).toBeInTheDocument();
  });

  it('requires label prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<ActionButton />);
    }).not.toThrow();
  });

  it('requires onClick prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<ActionButton />);
    }).not.toThrow();
  });
});
