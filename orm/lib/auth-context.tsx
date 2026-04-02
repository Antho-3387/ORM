'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { signIn, signUp, signOut, onAuthStateChange } from './auth-service'
import { User } from './auth-service'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // S'enregistrer aux changements d'authentification Supabase
  useEffect(() => {
    const { subscription } = onAuthStateChange((authUser) => {
      setUser(authUser)
      setLoading(false)
    }) || {}

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const register = async (email: string, password: string, name: string) => {
    const { user: newUser, error } = await signUp(email, password, name)
    if (error) {
      throw new Error(error)
    }
    setUser(newUser)
  }

  const login = async (email: string, password: string) => {
    const { user: authUser, error } = await signIn(email, password)
    if (error) {
      throw new Error(error)
    }
    setUser(authUser)
  }

  const logout = async () => {
    const { error } = await signOut()
    if (error) {
      throw new Error(error)
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
