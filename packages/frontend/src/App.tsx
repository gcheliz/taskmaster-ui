import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/Layout';
import { RepositoryProvider } from './contexts/RepositoryContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationContainer } from './components/Notifications';
import { AppRoutes } from './routes/AppRoutes';
import { initializeKeyboardDetection } from './utils/keyboard';
import { AppErrorBoundary } from './components/ErrorBoundary/AppErrorBoundary';
import { WebSocketErrorBoundary } from './components/ErrorBoundary';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default to 5 minutes for stale time
      staleTime: 5 * 60 * 1000,
      // Default to 10 minutes for cache time
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Refetch on window focus
      refetchOnWindowFocus: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

function App() {
  // Initialize keyboard navigation detection
  useEffect(() => {
    initializeKeyboardDetection();
  }, []);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <NotificationProvider>
              <WebSocketErrorBoundary>
                <WebSocketProvider config={{ autoConnect: true }}>
                  <RepositoryProvider>
                    <AppLayout>
                      <AppRoutes />
                    </AppLayout>
                    <NotificationContainer position="top-right" />
                  </RepositoryProvider>
                </WebSocketProvider>
              </WebSocketErrorBoundary>
            </NotificationProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
