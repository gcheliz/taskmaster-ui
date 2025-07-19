import { Routes, Route, Navigate } from 'react-router-dom';
import { SimpleDashboardView } from '../components/Views/SimpleDashboardView';
import { SimpleRepositoryView } from '../components/Views/SimpleRepositoryView';
import { SimpleTaskBoardView } from '../components/Views/SimpleTaskBoardView';
import { SimpleTerminalView } from '../components/Views/SimpleTerminalView';

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
  );
}

// Simple Settings component
function SettingsView() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Application Settings
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Configure your TaskMaster UI preferences.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Theme
              </label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notifications
              </label>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Auto-save interval (seconds)
              </label>
              <input
                type="number"
                defaultValue="30"
                min="10"
                max="300"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
