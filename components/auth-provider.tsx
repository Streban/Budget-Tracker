"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  authenticate: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      const authenticated = localStorage.getItem('budgetTracker_authenticated')
      const authTime = localStorage.getItem('budgetTracker_authTime')
      
      if (authenticated === 'true' && authTime) {
        const authTimestamp = parseInt(authTime)
        const currentTime = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        
        // Check if authentication is still valid (within 24 hours)
        if (currentTime - authTimestamp < twentyFourHours) {
          setIsAuthenticated(true)
        } else {
          // Authentication expired, clear localStorage
          localStorage.removeItem('budgetTracker_authenticated')
          localStorage.removeItem('budgetTracker_authTime')
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const authenticate = () => {
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('budgetTracker_authenticated')
    localStorage.removeItem('budgetTracker_authTime')
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  )
} 