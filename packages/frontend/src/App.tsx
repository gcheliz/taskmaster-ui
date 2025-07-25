import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { RepositoryProvider } from './contexts/RepositoryContext'
import { FocusProvider } from './contexts/FocusContext'
import { initializeKeyboardDetection } from './utils/keyboard'
import { AppRouter } from './routes/router'
import { FPSMonitor } from './components/common/FPSMonitor'
import { WebVitalsMonitor } from './components/Performance/WebVitals'
import { PerformanceMonitor } from './components/Performance/PerformanceMonitor'
import { WebVitalsDashboard } from './components/Performance/WebVitalsDashboard'
import { PerformanceDashboard } from './components/Performance/PerformanceDashboard'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
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
      <ThemeProvider>
        <FocusProvider>
          <NotificationProvider>
            <RepositoryProvider>
              <AppRouter />
              <FPSMonitor enabled={process.env.NODE_ENV === 'development'} />
              <WebVitalsMonitor 
                enabled={true}
                debug={process.env.NODE_ENV === 'development'}
                onReport={(metric) => {
                  // Send to analytics in production
                  if (process.env.NODE_ENV === 'production') {
                    console.log('Web Vitals:', metric)
                  }
                }}
              />
              <PerformanceMonitor />
              {process.env.NODE_ENV === 'development' && <WebVitalsDashboard />}
              {process.env.NODE_ENV === 'development' && <PerformanceDashboard />}
            </RepositoryProvider>
          </NotificationProvider>
        </FocusProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
