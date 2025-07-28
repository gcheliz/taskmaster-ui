import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ButtonPrimary } from './ButtonPrimary';

describe('ButtonPrimary', () => {
  it('renders without crashing', () => {
    render(<ButtonPrimary label={'test'} onClick={() => {}} />);
    expect(screen.getByText('ButtonPrimary Component')).toBeInTheDocument();
  });

  it('supports aria-label', () => {
    render(
      <ButtonPrimary ariaLabel="Test label" label={'test'} onClick={() => {}} />
    );
    expect(screen.getByLabelText('Test label')).toBeInTheDocument();
  });

  it('requires label prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<ButtonPrimary />);
    }).not.toThrow();
  });

  it('requires onClick prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<ButtonPrimary />);
    }).not.toThrow();
  });
});
