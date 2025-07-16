import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AddRepository } from '../AddRepository';

describe('AddRepository', () => {
  const mockOnRepositoryAdd = vi.fn();

  beforeEach(() => {
    mockOnRepositoryAdd.mockClear();
  });

  it('renders the component with all required elements', () => {
    render(<AddRepository />);
    
    expect(screen.getByText('Add Repository')).toBeInTheDocument();
    expect(screen.getByText('Connect a local Git repository by providing its absolute path.')).toBeInTheDocument();
    expect(screen.getByLabelText('Repository Path')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect Repository' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByText('Repository Requirements')).toBeInTheDocument();
  });

  it('updates input value when user types', () => {
    render(<AddRepository />);
    
    const input = screen.getByLabelText('Repository Path');
    fireEvent.change(input, { target: { value: '/Users/test/repo' } });
    
    expect(input).toHaveValue('/Users/test/repo');
  });

  it('shows clear button when input has value', () => {
    render(<AddRepository />);
    
    const input = screen.getByLabelText('Repository Path');
    const clearButton = screen.getByLabelText('Clear path');
    
    // Initially no clear button visible
    expect(clearButton).not.toBeVisible();
    
    // Type something
    fireEvent.change(input, { target: { value: '/test' } });
    
    // Clear button should be visible
    expect(clearButton).toBeVisible();
  });

  it('clears input when clear button is clicked', () => {
    render(<AddRepository />);
    
    const input = screen.getByLabelText('Repository Path');
    const clearButton = screen.getByLabelText('Clear path');
    
    // Type something
    fireEvent.change(input, { target: { value: '/test/path' } });
    expect(input).toHaveValue('/test/path');
    
    // Click clear
    fireEvent.click(clearButton);
    expect(input).toHaveValue('');
  });

  it('validates empty input', async () => {
    render(<AddRepository onRepositoryAdd={mockOnRepositoryAdd} />);
    
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    
    // Submit empty form
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Repository path is required');
    });
    
    expect(mockOnRepositoryAdd).not.toHaveBeenCalled();
  });

  it('validates path length', async () => {
    render(<AddRepository onRepositoryAdd={mockOnRepositoryAdd} />);
    
    const input = screen.getByLabelText('Repository Path');
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    
    // Test too short
    fireEvent.change(input, { target: { value: '/' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Path is too short');
    });
    
    // Test too long
    const longPath = '/'.repeat(501);
    fireEvent.change(input, { target: { value: longPath } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Path is too long (max 500 characters)');
    });
    
    expect(mockOnRepositoryAdd).not.toHaveBeenCalled();
  });

  it('validates absolute path format', async () => {
    render(<AddRepository onRepositoryAdd={mockOnRepositoryAdd} />);
    
    const input = screen.getByLabelText('Repository Path');
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    
    // Test relative path
    fireEvent.change(input, { target: { value: 'relative/path' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Please provide an absolute path');
    });
    
    expect(mockOnRepositoryAdd).not.toHaveBeenCalled();
  });

  it('accepts valid Unix absolute paths', async () => {
    mockOnRepositoryAdd.mockResolvedValue(undefined);
    render(<AddRepository onRepositoryAdd={mockOnRepositoryAdd} />);
    
    const input = screen.getByLabelText('Repository Path');
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    
    fireEvent.change(input, { target: { value: '/Users/john/my-repo' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnRepositoryAdd).toHaveBeenCalledWith('/Users/john/my-repo');
    });
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('accepts valid Windows absolute paths', async () => {
    mockOnRepositoryAdd.mockResolvedValue(undefined);
    render(<AddRepository onRepositoryAdd={mockOnRepositoryAdd} />);
    
    const input = screen.getByLabelText('Repository Path');
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    
    fireEvent.change(input, { target: { value: 'C:\\Users\\john\\my-repo' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnRepositoryAdd).toHaveBeenCalledWith('C:\\Users\\john\\my-repo');
    });
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears validation error when user starts typing', async () => {
    render(<AddRepository onRepositoryAdd={mockOnRepositoryAdd} />);
    
    const input = screen.getByLabelText('Repository Path');
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    
    // Trigger validation error
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    // Start typing
    fireEvent.change(input, { target: { value: '/test' } });
    
    // Error should be cleared
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<AddRepository isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: 'Connecting...' });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
    
    const input = screen.getByLabelText('Repository Path');
    expect(input).toBeDisabled();
  });

  it('displays external error message', () => {
    const errorMessage = 'Repository not found';
    render(<AddRepository error={errorMessage} />);
    
    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('prioritizes validation error over external error', async () => {
    const externalError = 'External error';
    render(<AddRepository error={externalError} onRepositoryAdd={mockOnRepositoryAdd} />);
    
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    
    // Trigger validation error
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Repository path is required');
      expect(screen.getByRole('alert')).not.toHaveTextContent(externalError);
    });
  });

  it('disables submit button when path is empty', () => {
    render(<AddRepository />);
    
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    expect(submitButton).toBeDisabled();
    
    const input = screen.getByLabelText('Repository Path');
    fireEvent.change(input, { target: { value: '/test' } });
    
    expect(submitButton).not.toBeDisabled();
  });

  it('clears form when Clear button is clicked', () => {
    render(<AddRepository />);
    
    const input = screen.getByLabelText('Repository Path');
    const clearFormButton = screen.getByRole('button', { name: 'Clear' });
    
    // Add some content
    fireEvent.change(input, { target: { value: '/some/path' } });
    expect(input).toHaveValue('/some/path');
    
    // Click clear form button
    fireEvent.click(clearFormButton);
    expect(input).toHaveValue('');
  });

  it('has proper accessibility attributes', () => {
    render(<AddRepository error="Test error" />);
    
    const input = screen.getByLabelText('Repository Path');
    
    expect(input).toHaveAttribute('aria-describedby', 'path-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toHaveAttribute('id', 'path-error');
  });

  it('trims whitespace from submitted path', async () => {
    mockOnRepositoryAdd.mockResolvedValue(undefined);
    render(<AddRepository onRepositoryAdd={mockOnRepositoryAdd} />);
    
    const input = screen.getByLabelText('Repository Path');
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    
    fireEvent.change(input, { target: { value: '  /Users/john/repo  ' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnRepositoryAdd).toHaveBeenCalledWith('/Users/john/repo');
    });
  });

  it('clears form on successful submission by default', async () => {
    mockOnRepositoryAdd.mockResolvedValue(undefined);
    render(<AddRepository onRepositoryAdd={mockOnRepositoryAdd} />);
    
    const input = screen.getByLabelText('Repository Path');
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    
    fireEvent.change(input, { target: { value: '/Users/john/repo' } });
    expect(input).toHaveValue('/Users/john/repo');
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnRepositoryAdd).toHaveBeenCalledWith('/Users/john/repo');
    });

    // Form should be cleared after successful submission
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('does not clear form when clearOnSuccess is false', async () => {
    mockOnRepositoryAdd.mockResolvedValue(undefined);
    render(<AddRepository onRepositoryAdd={mockOnRepositoryAdd} clearOnSuccess={false} />);
    
    const input = screen.getByLabelText('Repository Path');
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    
    fireEvent.change(input, { target: { value: '/Users/john/repo' } });
    expect(input).toHaveValue('/Users/john/repo');
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnRepositoryAdd).toHaveBeenCalledWith('/Users/john/repo');
    });

    // Form should not be cleared
    expect(input).toHaveValue('/Users/john/repo');
  });

  it('handles async errors from onRepositoryAdd', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnRepositoryAdd.mockRejectedValue(new Error('Connection failed'));
    
    render(<AddRepository onRepositoryAdd={mockOnRepositoryAdd} />);
    
    const input = screen.getByLabelText('Repository Path');
    const submitButton = screen.getByRole('button', { name: 'Connect Repository' });
    
    fireEvent.change(input, { target: { value: '/Users/john/repo' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnRepositoryAdd).toHaveBeenCalledWith('/Users/john/repo');
    });

    // Form should not be cleared on error
    expect(input).toHaveValue('/Users/john/repo');
    
    // Error should be logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Repository add failed:', expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });
});