import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { LoginForm } from '../LoginForm'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LoginForm', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument()
    })

    it('renders social login options by default', () => {
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      expect(screen.getByText(/or continue with email/i)).toBeInTheDocument()
    })

    it('hides social login when showSocialLogins is false', () => {
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} showSocialLogins={false} />)
      
      expect(screen.queryByText(/or continue with email/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows error for invalid email', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /log in/i })
      
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('shows error for empty email', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })
    })

    it('shows error for short password', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const submitButton = screen.getByRole('button', { name: /log in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('calls onSuccess with valid data', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({
          email: 'test@example.com',
          token: expect.stringMatching(/^mock-jwt-token-/)
        })
      }, { timeout: 3000 })
    })

    it('includes remember me value', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.click(screen.getByLabelText(/remember me/i))
      await user.click(screen.getByRole('button', { name: /log in/i }))
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      
      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)
      
      // Should show loading state immediately after click
      expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument()
    })
  })

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      const toggleButton = screen.getByRole('button', { name: /show password/i })
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Error Handling', () => {
    it('clears field errors when user types', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      // Submit empty form to trigger errors
      await user.click(screen.getByRole('button', { name: /log in/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })
      
      // Start typing in email field
      await user.type(screen.getByLabelText(/email address/i), 'test')
      
      // Error should be cleared
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      const form = screen.getByRole('form', { hidden: true })
      expect(form).toBeInTheDocument()
    })

    it('has proper field labels', () => {
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />)
      
      // Tab through form elements
      await user.tab()
      expect(screen.getByLabelText(/email address/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/^password$/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /show password/i })).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/remember me/i)).toHaveFocus()
    })
  })
})