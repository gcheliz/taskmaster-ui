import { Routes, Route, Navigate } from 'react-router-dom'
import { SimpleDashboardView } from '../components/Views/SimpleDashboardView'
import { SimpleRepositoryView } from '../components/Views/SimpleRepositoryView'
import { SimpleTaskBoardView } from '../components/Views/SimpleTaskBoardView'
import { SimpleTerminalView } from '../components/Views/SimpleTerminalView'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<SimpleDashboardView />} />
      <Route path="/repository-management" element={<SimpleRepositoryView />} />
      <Route path="/task-board" element={<SimpleTaskBoardView />} />
      <Route path="/terminal" element={<SimpleTerminalView />} />
      <Route path="/settings" element={<SettingsView />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

// Simple Settings component
function SettingsView() {
  return (
    <div className="settings-view">
      <h1>Settings</h1>
      <div className="settings-content">
        <div className="card">
          <h2>Application Settings</h2>
          <p>Configure your TaskMaster UI preferences.</p>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Theme</label>
              <select>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Notifications</label>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="setting-item">
              <label>Auto-save interval (seconds)</label>
              <input type="number" defaultValue="30" min="10" max="300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}