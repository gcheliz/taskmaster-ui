import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationProvider, useNotification } from '../NotificationContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useNotification hook', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      expect(result.current.state.notifications).toEqual([]);
    });

    it('should add a notification', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'success',
          title: 'Test notification',
          message: 'This is a test',
        });
      });

      expect(result.current.state.notifications).toHaveLength(1);
      expect(result.current.state.notifications[0].title).toBe('Test notification');
      expect(result.current.state.notifications[0].type).toBe('success');
    });

    it('should auto-remove notification after duration', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Auto remove test',
          duration: 1000,
        });
      });

      expect(result.current.state.notifications).toHaveLength(1);

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.state.notifications).toHaveLength(0);
    });

    it('should not auto-remove notification with duration 0', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'error',
          title: 'Persistent notification',
          duration: 0,
        });
      });

      expect(result.current.state.notifications).toHaveLength(1);

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.state.notifications).toHaveLength(1);
    });

    it('should manually remove notification', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      let notificationId: string;

      act(() => {
        result.current.addNotification({
          type: 'warning',
          title: 'Manual remove test',
        });
      });

      notificationId = result.current.state.notifications[0].id;
      expect(result.current.state.notifications).toHaveLength(1);

      act(() => {
        result.current.removeNotification(notificationId);
      });

      expect(result.current.state.notifications).toHaveLength(0);
    });

    it('should clear all notifications', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'success',
          title: 'First notification',
        });
        result.current.addNotification({
          type: 'error',
          title: 'Second notification',
        });
      });

      expect(result.current.state.notifications).toHaveLength(2);

      act(() => {
        result.current.clearNotifications();
      });

      expect(result.current.state.notifications).toHaveLength(0);
    });

    it('should use showSuccess helper', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showSuccess('Success title', 'Success message');
      });

      const notification = result.current.state.notifications[0];
      expect(notification.type).toBe('success');
      expect(notification.title).toBe('Success title');
      expect(notification.message).toBe('Success message');
      expect(notification.duration).toBe(5000); // Default duration
    });

    it('should use showError helper', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showError('Error title', 'Error message');
      });

      const notification = result.current.state.notifications[0];
      expect(notification.type).toBe('error');
      expect(notification.title).toBe('Error title');
      expect(notification.message).toBe('Error message');
      expect(notification.duration).toBe(8000); // Error default duration
    });

    it('should use showWarning helper', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showWarning('Warning title', 'Warning message');
      });

      const notification = result.current.state.notifications[0];
      expect(notification.type).toBe('warning');
      expect(notification.title).toBe('Warning title');
      expect(notification.message).toBe('Warning message');
      expect(notification.duration).toBe(6000); // Warning default duration
    });

    it('should use showInfo helper', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showInfo('Info title', 'Info message');
      });

      const notification = result.current.state.notifications[0];
      expect(notification.type).toBe('info');
      expect(notification.title).toBe('Info title');
      expect(notification.message).toBe('Info message');
      expect(notification.duration).toBe(5000); // Default duration
    });

    it('should handle custom options in helper methods', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      const mockAction = vi.fn();

      act(() => {
        result.current.showSuccess(
          'Custom success',
          'Custom message',
          {
            duration: 2000,
            dismissible: false,
            action: {
              label: 'Click me',
              onClick: mockAction,
            },
          }
        );
      });

      const notification = result.current.state.notifications[0];
      expect(notification.type).toBe('success');
      expect(notification.duration).toBe(2000);
      expect(notification.dismissible).toBe(false);
      expect(notification.action?.label).toBe('Click me');
      expect(notification.action?.onClick).toBe(mockAction);
    });

    it('should generate unique IDs for notifications', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'First',
        });
        result.current.addNotification({
          type: 'info',
          title: 'Second',
        });
      });

      const [first, second] = result.current.state.notifications;
      expect(first.id).not.toBe(second.id);
      expect(first.id).toMatch(/^notification_\d+_[a-z0-9]+$/);
      expect(second.id).toMatch(/^notification_\d+_[a-z0-9]+$/);
    });
  });

  describe('NotificationProvider', () => {
    it('should throw error when useNotification is used outside provider', () => {
      expect(() => {
        renderHook(() => useNotification());
      }).toThrow('useNotification must be used within a NotificationProvider');
    });
  });
});