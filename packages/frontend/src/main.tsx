import { createRoot } from 'react-dom/client'
import './app.css'
import App from './App.tsx'
import { SecurityEnforcer } from './config/security'

// Initialize security policies
SecurityEnforcer.initialize()

// Temporarily remove StrictMode to debug React 19 compatibility issue
createRoot(document.getElementById('root')!).render(
  <App />
)
