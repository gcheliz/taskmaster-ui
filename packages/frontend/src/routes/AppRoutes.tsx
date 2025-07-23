import { Routes, Route, Navigate } from 'react-router-dom';
// import { SimpleDashboardView } from '../components/Views/SimpleDashboardView';
import Dashboard from '../pages/Dashboard';
import Settings from '../pages/Settings';
import TaskBoard from '../pages/TaskBoard';
import TaskBoardSimple from '../pages/TaskBoardSimple';
import Repository from '../pages/Repository';
import Terminal from '../pages/Terminal';
import TestPage from '../pages/TestPage';
import { RouteErrorBoundary, RepositoryErrorBoundary, TerminalErrorBoundary } from '../components/ErrorBoundary';

export function AppRoutes() {
  return (
    <RouteErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route 
          path="/repository-management" 
          element={
            <RepositoryErrorBoundary>
              <Repository />
            </RepositoryErrorBoundary>
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
        <Route path="/test" element={<TestPage />} />
        <Route path="/task-board-simple" element={<TaskBoardSimple />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </RouteErrorBoundary>
  );
}
