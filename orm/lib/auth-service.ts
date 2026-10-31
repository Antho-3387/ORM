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
  requiresEmailConfirmation?: boolean
}

function getAuthRedirectUrl(): string {
  return `${window.location.origin}/auth`
}

async function ensureUserProfile(authUser: { id: string; email?: string }, name?: string): Promise<AuthResponse> {
  const email = authUser.email
  if (!email) {
    return { user: null, error: 'Le compte Supabase ne contient pas d’adresse email.' }
  }

  const { data: existingUser, error: lookupError } = await supabase
    .from('User')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle()

  if (lookupError) {
    return { user: null, error: 'Erreur lors de la vérification du profil: ' + lookupError.message }
  }

  if (existingUser) {
    return { user: existingUser as User, error: null }
  }

  const { data: createdUser, error: createError } = await supabase
    .from('User')
    .insert({
      id: authUser.id,
      email,
      password: '',
      name: name || email.split('@')[0],
    })
    .select()
    .maybeSingle()

  if (!createError && createdUser) {
    return { user: createdUser as User, error: null }
  }

  if (createError?.code === '23505') {
    const { data: userWithAuthId, error: retryError } = await supabase
      .from('User')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (!retryError && userWithAuthId) {
      return { user: userWithAuthId as User, error: null }
    }

    return {
      user: null,
      error: 'Cette adresse email est déjà liée à un ancien profil. Contactez un administrateur pour le rattacher à votre compte.',
    }
  }

  return {
    user: null,
    error: 'Erreur lors de la création du profil: ' + (createError?.message || 'aucune donnée retournée'),
  }
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
        emailRedirectTo: getAuthRedirectUrl(),
      },
    })

    if (authError) {
      return { user: null, error: authError.message }
    }

    if (authData.user && !authData.session) {
      return { user: null, error: null, requiresEmailConfirmation: true }
    }

    if (authData.user) {
      return ensureUserProfile(authData.user, name)
    }

    return { user: null, error: 'Erreur inconnue lors de l\'inscription' }
  } catch (error) {
    console.error('SignUp Error:', error)
    return { user: null, error: error instanceof Error ? error.message : 'Erreur inconnue lors de l’inscription' }
  }
}

export async function resendSignupConfirmation(email: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    })

    return { error: error?.message || null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Erreur inconnue lors du renvoi de l’email.',
    }
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
      return ensureUserProfile(data.user)
    }

    return { user: null, error: 'Unknown error' }
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Erreur inconnue lors de la connexion' }
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
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erreur inconnue lors de la déconnexion' }
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
      .maybeSingle()

    // Return DB user if found, otherwise construct from auth user
    if (userData) {
      return userData as User
    }
    
    // Fallback to auth user data
    return {
      id: user.id,
      email: user.email || 'user@example.com',
      name: user.email?.split('@')[0] || 'User',
    } as User
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
        .maybeSingle()
      
      if (userData) {
        callback(userData as User)
      } else {
        // Fallback to auth user data if not found in DB
        callback({
          id: session.user.id,
          email: session.user.email || 'user@example.com',
          name: session.user.email?.split('@')[0] || 'User',
        } as User)
      }
    } else {
      callback(null)
    }
  })

  return data
}
