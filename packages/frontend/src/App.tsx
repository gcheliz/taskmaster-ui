import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/Layout';
import { RepositoryProvider } from './contexts/RepositoryContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationContainer } from './components/Notifications';
import { AppRoutes } from './routes/AppRoutes';
import { initializeKeyboardDetection } from './utils/keyboard';

function App() {
  // Initialize keyboard navigation detection
  useEffect(() => {
    initializeKeyboardDetection();
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <WebSocketProvider config={{ autoConnect: true }}>
            <RepositoryProvider>
              <AppLayout>
                <AppRoutes />
              </AppLayout>
              <NotificationContainer position="top-right" />
            </RepositoryProvider>
          </WebSocketProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
