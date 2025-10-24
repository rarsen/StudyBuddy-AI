import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = authService.getStoredUser()
    const token = authService.getToken()
    
    if (storedUser && token) {
      setUser(storedUser)
    }
    
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const data = await authService.login(credentials)
    authService.setAuth(data.access_token, data.user)
    setUser(data.user)
    // Ensure localStorage and state are synchronized before navigation
    await new Promise(resolve => setTimeout(resolve, 50))
    return data
  }

  const register = async (userData) => {
    const data = await authService.register(userData)
    authService.setAuth(data.access_token, data.user)
    setUser(data.user)
    // Ensure localStorage and state are synchronized before navigation
    await new Promise(resolve => setTimeout(resolve, 50))
    return data
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

