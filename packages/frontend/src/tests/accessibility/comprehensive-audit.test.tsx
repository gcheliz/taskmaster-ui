import { describe, it, afterAll, beforeAll, expect } from 'vitest';
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import {
  runAccessibilityAudit,
  generateAuditReport,
  clearAuditResults,
  getAuditResults,
} from './audit-report';

// Components to audit
import Login from '../../pages/Login';
import Dashboard from '../../pages/Dashboard';
import TaskBoard from '../../pages/TaskBoard';
import Repositories from '../../pages/Repositories';
import Settings from '../../pages/Settings';

// Individual components
import { Header } from '../../components/Layout/Header';
import { Sidebar } from '../../components/Layout/Sidebar';
import { LoginForm } from '../../components/Auth/LoginForm';
import { TaskCard } from '../../components/TaskBoard/TaskCard';
import { KanbanColumn } from '../../components/ui/molecules/KanbanColumn';
import { ExportButton } from '../../components/Export/ExportButton';
import { ThemeToggle } from '../../components/Settings/ThemeToggle';
import { NotificationList } from '../../components/Settings/NotificationList';

// Mock data
const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending' as const,
  priority: 'high' as const,
  complexity: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Comprehensive Accessibility Audit', () => {
  beforeAll(() => {
    clearAuditResults();
  });

  afterAll(() => {
    generateAuditReport();
    const results = getAuditResults();
    
    // Fail the test if critical or serious violations found
    const criticalOrSerious = results.filter(r => 
      r.impact === 'critical' || r.impact === 'serious'
    );
    
    if (criticalOrSerious.length > 0) {
      console.error('\n❌ Critical or serious accessibility violations found!');
      expect(criticalOrSerious).toHaveLength(0);
    }
  });

  // Page-level audits
  it('should audit Login page', async () => {
    await runAccessibilityAudit('Login Page', 
      <TestWrapper>
        <Login />
      </TestWrapper>
    );
  });

  it('should audit Dashboard page', async () => {
    await runAccessibilityAudit('Dashboard Page', 
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );
  });

  it('should audit TaskBoard page', async () => {
    await runAccessibilityAudit('TaskBoard Page', 
      <TestWrapper>
        <TaskBoard />
      </TestWrapper>
    );
  });

  it('should audit Repositories page', async () => {
    const { RepositoryProvider } = await import('../../contexts/RepositoryContext');
    
    await runAccessibilityAudit('Repositories Page', 
      <TestWrapper>
        <RepositoryProvider>
          <Repositories />
        </RepositoryProvider>
      </TestWrapper>
    );
  });

  it('should audit Settings page', async () => {
    await runAccessibilityAudit('Settings Page', 
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );
  });

  // Component-level audits
  it('should audit Header component', async () => {
    await runAccessibilityAudit('Header Component', 
      <TestWrapper>
        <Header title="Test Page" />
      </TestWrapper>
    );
  });

  it('should audit Sidebar component', async () => {
    await runAccessibilityAudit('Sidebar Component', 
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );
  });

  it('should audit LoginForm component', async () => {
    await runAccessibilityAudit('LoginForm Component', 
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );
  });

  it('should audit TaskCard component', async () => {
    await runAccessibilityAudit('TaskCard Component', 
      <TestWrapper>
        <TaskCard 
          task={mockTask}
          onClick={() => {}}
          onEdit={() => {}}
        />
      </TestWrapper>
    );
  });

  it('should audit KanbanColumn component', async () => {
    await runAccessibilityAudit('KanbanColumn Component', 
      <TestWrapper>
        <KanbanColumn
          id="todo"
          title="To Do"
          status="pending"
          tasks={[mockTask]}
          color="gray"
          onTaskClick={() => {}}
          onTaskEdit={() => {}}
          onAddTask={() => {}}
        />
      </TestWrapper>
    );
  });

  it('should audit ExportButton component', async () => {
    await runAccessibilityAudit('ExportButton Component', 
      <TestWrapper>
        <ExportButton />
      </TestWrapper>
    );
  });

  it('should audit ThemeToggle component', async () => {
    await runAccessibilityAudit('ThemeToggle Component', 
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );
  });

  it('should audit NotificationList component', async () => {
    const mockNotifications = [
      { id: '1', type: 'email' as const, enabled: true, label: 'Email notifications' },
      { id: '2', type: 'push' as const, enabled: false, label: 'Push notifications' }
    ];
    
    await runAccessibilityAudit('NotificationList Component', 
      <TestWrapper>
        <NotificationList 
          notifications={mockNotifications}
          onToggle={() => {}}
        />
      </TestWrapper>
    );
  });

  // Modal and overlay audits
  it('should audit TaskModal in create mode', async () => {
    const { TaskModal } = await import('../../components/TaskBoard/TaskModal');
    
    await runAccessibilityAudit('TaskModal (Create Mode)', 
      <TestWrapper>
        <TaskModal 
          isOpen={true}
          onClose={() => {}}
          mode="create"
        />
      </TestWrapper>
    );
  });

  it('should audit TaskModal in edit mode', async () => {
    const { TaskModal } = await import('../../components/TaskBoard/TaskModal');
    
    await runAccessibilityAudit('TaskModal (Edit Mode)', 
      <TestWrapper>
        <TaskModal 
          isOpen={true}
          onClose={() => {}}
          mode="edit"
          task={mockTask}
        />
      </TestWrapper>
    );
  });

  // Form components audit
  it('should audit form fields with errors', async () => {
    const FormWithErrors = () => (
      <form>
        <div>
          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            type="email" 
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">Email is required</span>
        </div>
      </form>
    );
    
    await runAccessibilityAudit('Form with Errors', 
      <TestWrapper>
        <FormWithErrors />
      </TestWrapper>
    );
  });

  // Loading states audit
  it('should audit loading states', async () => {
    const { Skeleton } = await import('../../components/ui/loading');
    
    await runAccessibilityAudit('Loading Skeleton', 
      <TestWrapper>
        <Skeleton className="h-4 w-32" />
      </TestWrapper>
    );
  });

  // Empty states audit
  it('should audit empty states', async () => {
    const EmptyState = () => (
      <div role="status" aria-label="No tasks found">
        <p>No tasks found. Create your first task!</p>
        <button>Create Task</button>
      </div>
    );
    
    await runAccessibilityAudit('Empty State', 
      <TestWrapper>
        <EmptyState />
      </TestWrapper>
    );
  });
});