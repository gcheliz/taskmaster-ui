import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from '../FormField';

describe('FormField', () => {
  it('renders with label and input', () => {
    render(
      <FormField
        label="Test Label"
        placeholder="Test placeholder"
      />
    );
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });

  it('displays help text when provided', () => {
    render(
      <FormField
        label="Test Label"
        helpText="This is help text"
      />
    );
    
    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(
      <FormField
        label="Test Label"
        error="This is an error"
      />
    );
    
    expect(screen.getByText('This is an error')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-error-500');
  });

  it('displays success message when provided', () => {
    render(
      <FormField
        label="Test Label"
        success="This is success"
      />
    );
    
    expect(screen.getByText('This is success')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-success-500');
  });

  it('shows required indicator when required', () => {
    render(
      <FormField
        label="Test Label"
        required
      />
    );
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    // The asterisk is added via CSS after pseudo-element, so we check the class instead
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('after:content-[\'*\']');
  });

  it('handles input changes', () => {
    const handleChange = vi.fn();
    
    render(
      <FormField
        label="Test Label"
        onChange={handleChange}
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test value');
  });

  it('applies correct size classes', () => {
    render(
      <FormField
        label="Test Label"
        inputSize="lg"
      />
    );
    
    expect(screen.getByRole('textbox')).toHaveClass('h-12', 'px-4', 'text-lg');
  });

  it('renders with description', () => {
    render(
      <FormField
        label="Test Label"
        description="This is a description"
      />
    );
    
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });
});