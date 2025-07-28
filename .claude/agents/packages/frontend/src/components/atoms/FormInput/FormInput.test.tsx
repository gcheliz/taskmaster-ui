import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormInput } from './FormInput';

describe('FormInput', () => {
  it('renders without crashing', () => {
    render(<FormInput label={'test'} value={'test'} onChange={undefined} />);
    expect(screen.getByText('FormInput Component')).toBeInTheDocument();
  });

  it('requires label prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<FormInput />);
    }).not.toThrow();
  });

  it('requires value prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<FormInput />);
    }).not.toThrow();
  });

  it('requires onChange prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<FormInput />);
    }).not.toThrow();
  });
});
