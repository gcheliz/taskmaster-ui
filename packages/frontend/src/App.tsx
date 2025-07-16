import { useState } from 'react'
import { AppLayout } from './components/Layout'
import { RepositoryProvider } from './contexts/RepositoryContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { NotificationContainer } from './components/Notifications'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <NotificationProvider>
      <RepositoryProvider>
        <AppLayout>
      <div className="dashboard">
        <h1>Welcome to TaskMaster UI</h1>
        <div className="dashboard-content">
          <div className="card">
            <h2>Dashboard Overview</h2>
            <p>This is the main dashboard where you can manage your tasks and repositories.</p>
            
            <div className="demo-section">
              <h3>Demo Counter</h3>
              <button onClick={() => setCount((count) => count + 1)}>
                count is {count}
              </button>
              <p>This demonstrates React state management in the new layout.</p>
            </div>
          </div>
          
          <div className="card">
            <h2>Quick Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <h4>Active Tasks</h4>
                <span className="stat-number">0</span>
              </div>
              <div className="stat-item">
                <h4>Repositories</h4>
                <span className="stat-number">0</span>
              </div>
              <div className="stat-item">
                <h4>Completed Today</h4>
                <span className="stat-number">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
        </AppLayout>
        <NotificationContainer position="top-right" />
      </RepositoryProvider>
    </NotificationProvider>
  )
}

export default App
