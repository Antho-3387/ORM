'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { signIn, signUp, signOut, type User } from './auth-service'
import { supabase } from './supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return

      const authUser = session?.user
      setUser(authUser ? {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name,
      } : null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const register = async (email: string, password: string, name: string) => {
    const { user: newUser, error, requiresEmailConfirmation } = await signUp(email, password, name)
    if (error) {
      throw new Error(error)
    }
    if (requiresEmailConfirmation) {
      setUser(null)
      setLoading(false)
      return true
    }
    if (!newUser) {
      throw new Error('Inscription réussie, mais aucune session Supabase active n’a été créée. Connectez-vous avant de continuer.')
    }
    console.log('User registered:', newUser)
    setUser(newUser)
    setLoading(false)
    return false
  }

  const login = async (email: string, password: string) => {
    const { user: authUser, error } = await signIn(email, password)
    if (error) {
      throw new Error(error)
    }
    console.log('User logged in:', authUser)
    setUser(authUser)
    setLoading(false)
  }

  const logout = async () => {
    const { error } = await signOut()
    if (error) {
      throw new Error(error)
    }
    setUser(null)
    setLoading(false)
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
