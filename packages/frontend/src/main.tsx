import { createRoot } from 'react-dom/client'
import './app.css'
import App from './App.tsx'
import { SecurityEnforcer } from './config/security'
import { initSentry } from './config/sentry'
import { initPerformanceMonitoring } from './services/performanceMonitoring'

// Initialize monitoring and security
initSentry()
initPerformanceMonitoring()
SecurityEnforcer.initialize()

createRoot(document.getElementById('root')!).render(
  <App />
)
