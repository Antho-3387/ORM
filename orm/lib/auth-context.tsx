'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { signIn, signUp, signOut } from './auth-service'
import { User } from './auth-service'
import { supabase } from './supabase'

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

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      try {
        // Check if there's a current session
        const { data: { session } } = await supabase.auth.getSession()
        if (isMounted && session?.user) {
          console.log('Found session:', session.user.email)
          // Get user from DB
          try {
            const { data: userData, error: userError } = await supabase
              .from('User')
              .select('*')
              .eq('id', session.user.id)
              .single()
            if (userError) {
              console.error('User fetch error:', userError)
              setUser(null)
            } else {
              setUser(userData || null)
            }
          } catch (err) {
            console.error('User fetch exception:', err)
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkSession()

    return () => {
      isMounted = false
    }
  }, [])

  const register = async (email: string, password: string, name: string) => {
    const { user: newUser, error } = await signUp(email, password, name)
    if (error) {
      throw new Error(error)
    }
    console.log('User registered:', newUser)
    setUser(newUser)
    setLoading(false)
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
