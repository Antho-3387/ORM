'use client'

import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  name?: string
  created_at?: string
}

export interface AuthResponse {
  user: User | null
  error: string | null
}

/**
 * S'inscrire avec email et mot de passe
 */
export async function signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
  try {
    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    })

    if (authError) {
      return { user: null, error: authError.message }
    }

    if (authData.user) {
      // Créer l'enregistrement utilisateur dans la table User
      const { data, error: dbError } = await supabase
        .from('User')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            password: '',
            name: name || email.split('@')[0],
          },
        ])
        .select()
        .maybeSingle()

      if (dbError) {
        console.error('DB Error:', dbError)
        // If it's a duplicate key error, that's OK - just return the auth user
        if (dbError.message.includes('duplicate')) {
          return {
            user: {
              id: authData.user.id,
              email: authData.user.email,
              name: name || email.split('@')[0],
            },
            error: null,
          }
        }
        return { user: null, error: 'Erreur lors de la création du profil: ' + dbError.message }
      }

      return { user: (data || authData.user) as User, error: null }
    }

    return { user: null, error: 'Erreur inconnue lors de l\'inscription' }
  } catch (error: any) {
    console.error('SignUp Error:', error)
    return { user: null, error: error.message }
  }
}

/**
 * Se connecter avec email et mot de passe
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error: error.message }
    }

    if (data.user) {
      // Récupérer les infos utilisateur depuis la DB
      let { data: userData, error: dbError } = await supabase
        .from('User')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      // If user doesn't exist in DB yet, create it
      if (!userData && !dbError) {
        const { data: newUser, error: createError } = await supabase
          .from('User')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              password: '',
              name: email.split('@')[0],
            },
          ])
          .select()
          .single()

        if (createError) {
          // Ignore duplicate key errors - user might already exist
          if (!createError.message.includes('duplicate')) {
            console.error('Create user error:', createError)
            return { user: null, error: 'Erreur lors de la création du profil' }
          }
          // Try to fetch again
          const { data: retryData } = await supabase
            .from('User')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle()
          userData = retryData
        } else {
          userData = newUser
        }
      }

      if (dbError) {
        console.error('DB Error:', dbError)
        // Return auth user data even if DB lookup fails
        return {
          user: {
            id: data.user.id,
            email: data.user.email,
            name: email.split('@')[0],
          },
          error: null,
        }
      }

      return { user: (userData || data.user) as User, error: null }
    }

    return { user: null, error: 'Unknown error' }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

/**
 * Se déconnecter
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Obtenir l'utilisateur actuel
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Récupérer les infos depuis la DB
    const { data: userData } = await supabase
      .from('User')
      .select('*')
      .eq('id', user.id)
      .single()

    return userData as User || null
  } catch (error) {
    return null
  }
}

/**
 * Listener pour les changements d'authentification
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const { data: userData } = await supabase
        .from('User')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      callback(userData as User || null)
    } else {
      callback(null)
    }
  })

  return data
}
