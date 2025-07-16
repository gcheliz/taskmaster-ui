import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationCard } from '../NotificationCard';
import type { Notification } from '../../../contexts/NotificationContext';

const mockNotification: Notification = {
  id: 'test-1',
  type: 'success',
  title: 'Test Notification',
  message: 'This is a test message',
  dismissible: true,
};

describe('NotificationCard', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  it('renders notification with title and message', () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
  });

  it('renders correct icon for success type', () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders correct icon for error type', () => {
    const errorNotification = { ...mockNotification, type: 'error' as const };
    render(
      <NotificationCard
        notification={errorNotification}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('renders correct icon for warning type', () => {
    const warningNotification = { ...mockNotification, type: 'warning' as const };
    render(
      <NotificationCard
        notification={warningNotification}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('renders correct icon for info type', () => {
    const infoNotification = { ...mockNotification, type: 'info' as const };
    render(
      <NotificationCard
        notification={infoNotification}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('shows dismiss button when dismissible is true', () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument();
  });

  it('hides dismiss button when dismissible is false', () => {
    const nonDismissibleNotification = {
      ...mockNotification,
      dismissible: false,
    };

    render(
      <NotificationCard
        notification={nonDismissibleNotification}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.queryByLabelText('Dismiss notification')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = screen.getByLabelText('Dismiss notification');
    fireEvent.click(dismissButton);

    // Wait for animation delay
    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalledWith('test-1');
    }, { timeout: 500 });
  });

  it('renders action button when action is provided', () => {
    const mockAction = vi.fn();
    const notificationWithAction = {
      ...mockNotification,
      action: {
        label: 'Click me',
        onClick: mockAction,
      },
    };

    render(
      <NotificationCard
        notification={notificationWithAction}
        onDismiss={mockOnDismiss}
      />
    );

    const actionButton = screen.getByText('Click me');
    expect(actionButton).toBeInTheDocument();

    fireEvent.click(actionButton);
    expect(mockAction).toHaveBeenCalled();
  });

  it('does not render message when not provided', () => {
    const notificationWithoutMessage = {
      ...mockNotification,
      message: undefined,
    };

    render(
      <NotificationCard
        notification={notificationWithoutMessage}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.queryByText('This is a test message')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onDismiss={mockOnDismiss}
      />
    );

    const card = screen.getByRole('alert');
    expect(card).toHaveAttribute('aria-live', 'polite');
  });

  it('has assertive aria-live for error notifications', () => {
    const errorNotification = { ...mockNotification, type: 'error' as const };
    render(
      <NotificationCard
        notification={errorNotification}
        onDismiss={mockOnDismiss}
      />
    );

    const card = screen.getByRole('alert');
    expect(card).toHaveAttribute('aria-live', 'assertive');
  });

  it('applies correct CSS class for notification type', () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onDismiss={mockOnDismiss}
      />
    );

    const card = screen.getByRole('alert');
    expect(card).toHaveClass('notification-card', 'success');
  });

  it('applies visible class after mounting', async () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onDismiss={mockOnDismiss}
      />
    );

    const card = screen.getByRole('alert');
    
    await waitFor(() => {
      expect(card).toHaveClass('visible');
    });
  });
});