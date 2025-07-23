import { useState, useCallback } from 'react'

// Mock auth hook - will be implemented properly in the authentication task
interface User {
  id: string
  name: string
  email: string
  role: 'developer' | 'team_lead' | 'manager'
}

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'developer' | 'team_lead' | 'manager'
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'developer',
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser({
        id: '1',
        name: 'John Doe',
        email,
        role: 'developer',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true)
    try {
      // Mock register - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser({
        id: '1',
        name: data.name,
        email: data.email,
        role: data.role,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  }
}