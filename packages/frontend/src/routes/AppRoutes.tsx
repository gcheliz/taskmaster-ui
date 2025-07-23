import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Settings from '../pages/Settings'
import TaskBoard from '../pages/TaskBoard'
import Repositories from '../pages/Repositories'
import Terminal from '../pages/Terminal'
import TestPage from '../pages/TestPage'
import Auth from '../pages/Auth'
import Calendar from '../pages/Calendar'
import Analytics from '../pages/Analytics'
import {
  RouteErrorBoundary,
  RepositoryErrorBoundary,
  TerminalErrorBoundary,
} from '../components/ErrorBoundary'

export function AppRoutes() {
  return (
    <RouteErrorBoundary>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/repositories"
          element={
            <RepositoryErrorBoundary>
              <Repositories />
            </RepositoryErrorBoundary>
          }
        />
        <Route
          path="/repository-management"
          element={
            <RepositoryErrorBoundary>
              <Repositories />
            </RepositoryErrorBoundary>
          }
        />
        <Route
          path="/tasks"
          element={
            <RouteErrorBoundary>
              <TaskBoard />
            </RouteErrorBoundary>
          }
        />
        <Route
          path="/task-board"
          element={
            <RouteErrorBoundary>
              <TaskBoard />
            </RouteErrorBoundary>
          }
        />
        <Route
          path="/terminal"
          element={
            <TerminalErrorBoundary>
              <Terminal />
            </TerminalErrorBoundary>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </RouteErrorBoundary>
  )
}
