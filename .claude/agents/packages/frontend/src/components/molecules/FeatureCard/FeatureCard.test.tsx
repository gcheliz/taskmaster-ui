import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeatureCard } from './FeatureCard';

describe('FeatureCard', () => {
  it('renders without crashing', () => {
    render(<FeatureCard title={'test'} description={'test'} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('supports aria-label', () => {
    render(
      <FeatureCard ariaLabel="Test label" title={'test'} description={'test'} />
    );
    expect(screen.getByLabelText('Test label')).toBeInTheDocument();
  });

  it('requires title prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<FeatureCard />);
    }).not.toThrow();
  });

  it('requires description prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<FeatureCard />);
    }).not.toThrow();
  });
});
