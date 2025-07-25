import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('starts with authenticated state (mock implementation)', () => {
      const { result } = renderHook(() => useAuth())
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).not.toBe(null)
      expect(result.current.isLoading).toBe(false)
    })

    it('returns user data', () => {
      const { result } = renderHook(() => useAuth())
      
      expect(result.current.user).toHaveProperty('id')
      expect(result.current.user).toHaveProperty('name')
      expect(result.current.user).toHaveProperty('email')
      expect(result.current.user).toHaveProperty('role')
    })
  })

  describe('Login', () => {
    it('handles login process', async () => {
      const { result } = renderHook(() => useAuth())
      
      // Already logged in for mock, so logout first
      act(() => {
        result.current.logout()
      })
      
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      
      // Now login
      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).not.toBe(null)
      })
    })

    it('shows loading state during login', async () => {
      const { result } = renderHook(() => useAuth())
      
      // Logout first
      act(() => {
        result.current.logout()
      })
      
      let loginPromise: Promise<void>
      
      act(() => {
        loginPromise = result.current.login('test@example.com', 'password')
      })
      
      // Should be loading immediately
      expect(result.current.isLoading).toBe(true)
      
      await act(async () => {
        await loginPromise
      })
      
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Logout', () => {
    it('clears user data on logout', () => {
      const { result } = renderHook(() => useAuth())
      
      // Should start authenticated
      expect(result.current.isAuthenticated).toBe(true)
      
      act(() => {
        result.current.logout()
      })
      
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
    })
  })

  describe('Register', () => {
    it('handles registration process', async () => {
      const { result } = renderHook(() => useAuth())
      
      // Logout first
      act(() => {
        result.current.logout()
      })
      
      const registerData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'developer' as const
      }
      
      await act(async () => {
        await result.current.register(registerData)
      })
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).not.toBe(null)
        expect(result.current.user?.name).toBe(registerData.name)
        expect(result.current.user?.email).toBe(registerData.email)
        expect(result.current.user?.role).toBe(registerData.role)
      })
    })
  })
})