import { useState, useEffect } from 'react'
import type { User } from '@/api/Users'
import { decodeToken, isTokenValid } from '@/api/Authenticate'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const checkAuthStatus = () => {
      const accessToken = localStorage.getItem('accessToken')
      
      if (accessToken && isTokenValid(accessToken)) {
        const decodedToken = decodeToken(accessToken)
        
        if (decodedToken) {
          setUser({
            userId: decodedToken.sub,
            firstName: decodedToken.firstName,
            lastName: decodedToken.lastName,
            email: decodedToken.email,
            phone: decodedToken.phone || '',
            password: '',
            role: decodedToken.role
          })
        }
      } else {

        clearAuthStorage()
      }
      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = (accessToken: string, refreshToken: string) => {

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    
    const decodedToken = decodeToken(accessToken)
    
    if (decodedToken) {
      const userData: User = {
        userId: decodedToken.sub,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
        email: decodedToken.email,
        phone: decodedToken.phone || '',
        password: '', 
        role: decodedToken.role
      }
      
      setUser(userData)
      localStorage.setItem('userEmail', userData.email)
      if (userData.userId !== undefined) {
     localStorage.setItem('userId', userData.userId.toString());
      } else {
    console.warn('User ID is undefined, not setting in localStorage');
    }
      return userData
    } else {
      throw new Error('Invalid token received')
    }
  }

  const logout = () => {
    setUser(null)
    clearAuthStorage()
  }

  const clearAuthStorage = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  }
}

export const getCurrentUser = (): User | null => {
  const accessToken = localStorage.getItem('accessToken')
  
  if (!accessToken || !isTokenValid(accessToken)) {
    return null
  }
  
  const decodedToken = decodeToken(accessToken)
  
  if (!decodedToken) {
    return null
  }
  
  return {
    userId: decodedToken.sub,
    firstName: decodedToken.firstName,
    lastName: decodedToken.lastName,
    email: decodedToken.email,
    phone: decodedToken.phone || '',
    password: '',
    role: decodedToken.role
  }
}

export const getCurrentUserRole = (): 'admin' | 'driver' | 'customer' | null => {
  const user = getCurrentUser()
  return user?.role || null
}

export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('accessToken')
  return accessToken ? isTokenValid(accessToken) : false
}

export const getAccessToken = (): string | null => {
  const accessToken = localStorage.getItem('accessToken')
  return accessToken && isTokenValid(accessToken) ? accessToken : null
}
