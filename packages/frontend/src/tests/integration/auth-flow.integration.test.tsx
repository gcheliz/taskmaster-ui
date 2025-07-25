import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import Login from '../../pages/Login'
import Dashboard from '../../pages/Dashboard'
import { ProtectedRoute } from '../../routes/ProtectedRoute'

// Mock API responses
const mockLogin = vi.fn()
const mockGetUser = vi.fn()

vi.mock('../../services/api', () => ({
  api: {
    auth: {
      login: () => mockLogin(),
      getUser: () => mockGetUser(),
    },
  },
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const TestApp = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    queryClient.clear()
  })

  it('should complete full login flow and redirect to dashboard', async () => {
    const user = userEvent.setup()
    
    // Mock successful login
    mockLogin.mockResolvedValueOnce({
      token: 'test-token',
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      },
    })

    mockGetUser.mockResolvedValueOnce({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    })

    // Start at login page
    window.history.pushState({}, 'Login', '/login')
    render(<TestApp />)

    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Wait for login to complete
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    // Verify token is stored
    expect(localStorage.getItem('auth_token')).toBe('test-token')

    // Verify redirect to dashboard
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard')
    })
  })

  it('should handle login errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock failed login
    mockLogin.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    })

    window.history.pushState({}, 'Login', '/login')
    render(<TestApp />)

    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })

    // Verify no token is stored
    expect(localStorage.getItem('auth_token')).toBeNull()
    
    // Verify still on login page
    expect(window.location.pathname).toBe('/login')
  })

  it('should logout and redirect to login', async () => {
    const user = userEvent.setup()
    
    // Set initial auth state
    localStorage.setItem('auth_token', 'test-token')
    
    mockGetUser.mockResolvedValueOnce({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    })

    // Start at dashboard
    window.history.pushState({}, 'Dashboard', '/dashboard')
    render(<TestApp />)

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    // Find and click logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    // Verify token is removed
    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    // Verify redirect to login
    expect(window.location.pathname).toBe('/login')
  })

  it('should persist authentication across page refreshes', async () => {
    // Set initial auth state
    localStorage.setItem('auth_token', 'test-token')
    
    mockGetUser.mockResolvedValueOnce({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    })

    // Start at dashboard
    window.history.pushState({}, 'Dashboard', '/dashboard')
    render(<TestApp />)

    // Verify user is loaded
    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalled()
    })

    // Verify dashboard is accessible
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
  })

  it('should redirect to login when accessing protected route without auth', async () => {
    // No token set
    localStorage.clear()

    // Try to access dashboard
    window.history.pushState({}, 'Dashboard', '/dashboard')
    render(<TestApp />)

    // Should redirect to login
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login')
    })
  })
})