import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from '../useAuth'
import * as authApi from '../../services/api/auth'

// Mock the auth API
vi.mock('../../services/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  getProfile: vi.fn(),
  refreshToken: vi.fn(),
  updateProfile: vi.fn()
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useAuth', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('starts with unauthenticated state', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.token).toBe(null)
      expect(result.current.isLoading).toBe(false)
    })

    it('loads token from localStorage', () => {
      const mockToken = 'mock-jwt-token'
      localStorageMock.getItem.mockReturnValue(mockToken)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(result.current.token).toBe(mockToken)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token')
    })

    it('fetches user profile when token exists', async () => {
      const mockToken = 'mock-jwt-token'
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }
      
      localStorageMock.getItem.mockReturnValue(mockToken)
      vi.mocked(authApi.getProfile).mockResolvedValue(mockUser)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(result.current.isLoading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.isAuthenticated).toBe(true)
      })
    })
  })

  describe('Login', () => {
    it('successfully logs in user', async () => {
      const mockCredentials = { email: 'test@example.com', password: 'password123' }
      const mockResponse = {
        token: 'new-jwt-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' }
      }
      
      vi.mocked(authApi.login).mockResolvedValue(mockResponse)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await act(async () => {
        await result.current.login(mockCredentials)
      })
      
      expect(authApi.login).toHaveBeenCalledWith(mockCredentials)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockResponse.token)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockResponse.user)
      expect(result.current.token).toBe(mockResponse.token)
    })

    it('handles login error', async () => {
      const mockCredentials = { email: 'test@example.com', password: 'wrong' }
      const mockError = new Error('Invalid credentials')
      
      vi.mocked(authApi.login).mockRejectedValue(mockError)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await expect(
        act(async () => {
          await result.current.login(mockCredentials)
        })
      ).rejects.toThrow('Invalid credentials')
      
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
    })

    it('sets remember me in localStorage', async () => {
      const mockCredentials = { 
        email: 'test@example.com', 
        password: 'password123',
        rememberMe: true 
      }
      const mockResponse = {
        token: 'new-jwt-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' }
      }
      
      vi.mocked(authApi.login).mockResolvedValue(mockResponse)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await act(async () => {
        await result.current.login(mockCredentials)
      })
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('remember_me', 'true')
    })
  })

  describe('Logout', () => {
    it('successfully logs out user', async () => {
      // Start with authenticated state
      localStorageMock.getItem.mockReturnValue('mock-jwt-token')
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }
      vi.mocked(authApi.getProfile).mockResolvedValue(mockUser)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })
      
      vi.mocked(authApi.logout).mockResolvedValue(undefined)
      
      await act(async () => {
        await result.current.logout()
      })
      
      expect(authApi.logout).toHaveBeenCalled()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('remember_me')
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.token).toBe(null)
    })

    it('clears auth state even if API call fails', async () => {
      localStorageMock.getItem.mockReturnValue('mock-jwt-token')
      vi.mocked(authApi.logout).mockRejectedValue(new Error('Network error'))
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await act(async () => {
        await result.current.logout()
      })
      
      // Should still clear local state
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Register', () => {
    it('successfully registers new user', async () => {
      const mockData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      }
      const mockResponse = {
        token: 'new-jwt-token',
        user: { id: '2', name: 'New User', email: 'new@example.com' }
      }
      
      vi.mocked(authApi.register).mockResolvedValue(mockResponse)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await act(async () => {
        await result.current.register(mockData)
      })
      
      expect(authApi.register).toHaveBeenCalledWith(mockData)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockResponse.token)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockResponse.user)
    })

    it('handles registration error', async () => {
      const mockData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'User'
      }
      const mockError = new Error('Email already exists')
      
      vi.mocked(authApi.register).mockRejectedValue(mockError)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await expect(
        act(async () => {
          await result.current.register(mockData)
        })
      ).rejects.toThrow('Email already exists')
      
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Update Profile', () => {
    it('successfully updates user profile', async () => {
      // Start authenticated
      localStorageMock.getItem.mockReturnValue('mock-jwt-token')
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }
      vi.mocked(authApi.getProfile).mockResolvedValue(mockUser)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })
      
      const updatedUser = { ...mockUser, name: 'Updated Name' }
      vi.mocked(authApi.updateProfile).mockResolvedValue(updatedUser)
      
      await act(async () => {
        await result.current.updateProfile({ name: 'Updated Name' })
      })
      
      expect(authApi.updateProfile).toHaveBeenCalledWith({ name: 'Updated Name' })
      expect(result.current.user).toEqual(updatedUser)
    })

    it('handles profile update error', async () => {
      localStorageMock.getItem.mockReturnValue('mock-jwt-token')
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }
      vi.mocked(authApi.getProfile).mockResolvedValue(mockUser)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })
      
      vi.mocked(authApi.updateProfile).mockRejectedValue(new Error('Update failed'))
      
      await expect(
        act(async () => {
          await result.current.updateProfile({ name: 'New Name' })
        })
      ).rejects.toThrow('Update failed')
      
      // User should remain unchanged
      expect(result.current.user).toEqual(mockUser)
    })
  })

  describe('Token Refresh', () => {
    it('refreshes token when expired', async () => {
      const oldToken = 'old-jwt-token'
      const newToken = 'new-jwt-token'
      
      localStorageMock.getItem.mockReturnValue(oldToken)
      vi.mocked(authApi.refreshToken).mockResolvedValue({ token: newToken })
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await act(async () => {
        await result.current.refreshToken()
      })
      
      expect(authApi.refreshToken).toHaveBeenCalledWith(oldToken)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', newToken)
      expect(result.current.token).toBe(newToken)
    })

    it('logs out user if refresh fails', async () => {
      localStorageMock.getItem.mockReturnValue('old-jwt-token')
      vi.mocked(authApi.refreshToken).mockRejectedValue(new Error('Invalid token'))
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await act(async () => {
        await result.current.refreshToken()
      })
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.token).toBe(null)
    })
  })

  describe('Social Login', () => {
    it('handles OAuth callback', async () => {
      const mockCode = 'oauth-code-123'
      const mockProvider = 'google'
      const mockResponse = {
        token: 'oauth-jwt-token',
        user: { id: '3', name: 'OAuth User', email: 'oauth@example.com' }
      }
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      // Mock OAuth login endpoint
      vi.mocked(authApi.login).mockResolvedValue(mockResponse)
      
      await act(async () => {
        await result.current.handleOAuthCallback(mockCode, mockProvider)
      })
      
      expect(authApi.login).toHaveBeenCalledWith({
        code: mockCode,
        provider: mockProvider,
        type: 'oauth'
      })
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockResponse.user)
    })
  })

  describe('Permission Checks', () => {
    it('checks user permissions', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['admin', 'user']
      }
      
      localStorageMock.getItem.mockReturnValue('mock-jwt-token')
      vi.mocked(authApi.getProfile).mockResolvedValue(mockUser)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })
      
      expect(result.current.hasRole('admin')).toBe(true)
      expect(result.current.hasRole('user')).toBe(true)
      expect(result.current.hasRole('superadmin')).toBe(false)
    })

    it('returns false for permissions when not authenticated', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(result.current.hasRole('admin')).toBe(false)
      expect(result.current.hasPermission('write')).toBe(false)
    })
  })

  describe('Loading States', () => {
    it('manages loading state during operations', async () => {
      const mockCredentials = { email: 'test@example.com', password: 'password123' }
      const mockResponse = {
        token: 'jwt-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' }
      }
      
      vi.mocked(authApi.login).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      )
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(result.current.isLoading).toBe(false)
      
      const loginPromise = act(async () => {
        await result.current.login(mockCredentials)
      })
      
      expect(result.current.isLoading).toBe(true)
      
      await loginPromise
      
      expect(result.current.isLoading).toBe(false)
    })
  })
})