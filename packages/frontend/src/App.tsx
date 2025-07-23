import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { AppLayout } from './components/Layout'
import { AppRoutes } from './routes/AppRoutes'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { RepositoryProvider } from './contexts/RepositoryContext'
import { FocusProvider } from './contexts/FocusContext'
import { initializeKeyboardDetection } from './utils/keyboard'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: true,
    },
  },
})

function App() {
  // Initialize keyboard detection on app mount
  useEffect(() => {
    initializeKeyboardDetection()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <FocusProvider>
            <NotificationProvider>
              <RepositoryProvider>
                <AppLayout>
                  <AppRoutes />
                </AppLayout>
              </RepositoryProvider>
            </NotificationProvider>
          </FocusProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
