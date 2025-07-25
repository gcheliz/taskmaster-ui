import type { RouteObject } from "react-router"
import { lazy } from 'react'

// Import core layout components directly (not lazy loaded)
import { AppLayout } from '../components/Layout'
import { ProtectedRoute } from './ProtectedRoute'

// Lazy load all pages with webpackChunkName comments for better debugging
const DashboardPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '../pages/Dashboard'))
const SettingsPage = lazy(() => import(/* webpackChunkName: "settings" */ '../pages/Settings'))
const RepositoriesPage = lazy(() => import(/* webpackChunkName: "repositories" */ '../pages/Repositories'))
const TerminalPage = lazy(() => import(/* webpackChunkName: "terminal" */ '../pages/Terminal'))
const TaskBoardPage = lazy(() => import(/* webpackChunkName: "task-board" */ '../pages/TaskBoard'))
const TasksPage = lazy(() => import(/* webpackChunkName: "tasks" */ '../pages/Tasks'))
const TaskDetailPage = lazy(() => import(/* webpackChunkName: "task-detail" */ '../pages/TaskDetail'))
const AnalyticsPage = lazy(() => import(/* webpackChunkName: "analytics" */ '../pages/Analytics'))
const TeamPage = lazy(() => import(/* webpackChunkName: "team" */ '../pages/Team'))
const CalendarPage = lazy(() => import(/* webpackChunkName: "calendar" */ '../pages/Calendar'))
const DocumentationPage = lazy(() => import(/* webpackChunkName: "docs" */ '../pages/Documentation'))
const ProfilePage = lazy(() => import(/* webpackChunkName: "profile" */ '../pages/Profile'))
const LoginPage = lazy(() => import(/* webpackChunkName: "login" */ '../pages/Login'))
const RegisterPage = lazy(() => import(/* webpackChunkName: "register" */ '../pages/Register'))
const ForgotPasswordPage = lazy(() => import(/* webpackChunkName: "forgot-password" */ '../pages/ForgotPassword'))
const ResetPasswordPage = lazy(() => import(/* webpackChunkName: "reset-password" */ '../pages/ResetPassword'))
const NotFoundPage = lazy(() => import(/* webpackChunkName: "not-found" */ '../pages/NotFound'))
const OnboardingPage = lazy(() => import(/* webpackChunkName: "onboarding" */ '../pages/Onboarding'))
const NavigationTestPage = lazy(() => import(/* webpackChunkName: "nav-test" */ '../pages/NavigationTest'))

// Import the Auth page wrapper
const AuthPageWrapper = lazy(() => import(/* webpackChunkName: "auth" */ '../pages/Auth'))
const OAuthCallback = lazy(() => import(/* webpackChunkName: "oauth-callback" */ '../components/Auth/OAuthCallback').then(module => ({ default: module.OAuthCallback })))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'tasks',
            element: <TaskBoardPage />,
          },
          {
            path: 'tasks/list',
            children: [
              {
                index: true,
                element: <TasksPage />,
              },
              {
                path: ':taskId',
                element: <TaskDetailPage />,
              },
            ],
          },
          {
            path: 'repositories',
            element: <RepositoriesPage />,
          },
          {
            path: 'terminal',
            element: <TerminalPage />,
          },
          {
            path: 'analytics',
            element: <AnalyticsPage />,
          },
          {
            path: 'team',
            element: <TeamPage />,
          },
          {
            path: 'calendar',
            element: <CalendarPage />,
          },
          {
            path: 'docs',
            element: <DocumentationPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'navigation-test',
            element: <NavigationTestPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/onboarding',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <OnboardingPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthPageWrapper />,
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/auth/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/auth/callback',
    element: <OAuthCallback />,
  },
  // Legacy routes for backward compatibility - redirect to new auth page
  {
    path: '/auth/login',
    element: <AuthPageWrapper />,
  },
  {
    path: '/auth/register', 
    element: <AuthPageWrapper />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]
