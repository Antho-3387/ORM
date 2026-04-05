import { supabase } from './supabase'

/**
 * Crée un nouvel utilisateur
 *
 * Architecture:
 * - Supabase Auth = authentification + JWT + hachage mot de passe
 * - Table "User" = profil utilisateur SANS password
 * - Séparation complète entre auth et profil
 */
export async function createUser(email: string, password: string, name: string) {
  try {
    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      throw new Error(authError.message || 'Erreur lors de la création de l\'utilisateur')
    }

    if (!authData.user) {
      throw new Error('Réponse Auth invalide: aucun utilisateur créé')
    }

    const userId = authData.user.id

    // 2. Créer le profil utilisateur dans la table "User" (SANS password)
    const { data: profileData, error: profileError } = await supabase
      .from('User')
      .insert([
        {
          id: userId,
          email,
          name: name || null,
          // Password est géré UNIQUEMENT par Supabase Auth
        },
      ])
      .select()
      .single()

    if (profileError) {
      console.error('Erreur création profil utilisateur:', profileError)
      throw profileError
    }

    return {
      id: userId,
      email,
      name,
    }
  } catch (error) {
    console.error('Erreur createUser:', error)
    throw error
  }
}

/**
 * Récupère un utilisateur par email (depuis la table "User")
 * Retourne null si l'utilisateur n'existe pas
 */
export async function getUserByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('id, email, name, createdAt, updatedAt')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Aucun utilisateur trouvé - pas une erreur
        return null
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Erreur getUserByEmail:', error)
    return null
  }
}

/**
 * Vérifie les identifiants de l'utilisateur
 * Utilise Supabase Auth pour la vérification sécurisée du mot de passe
 * Retourne null si l'authentification échoue
 */
export async function verifyUserCredentials(email: string, password: string) {
  try {
    // Utiliser signInWithPassword de Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.warn('Authentification échouée pour:', email)
      return null
    }

    if (!authData.user) {
      console.warn('Réponse Auth invalide')
      return null
    }

    // Récupérer les données du profil utilisateur
    const userProfile = await getUserByEmail(email)

    if (!userProfile) {
      console.warn('Profil utilisateur non trouvé pour:', email)
      return null
    }

    return {
      id: authData.user.id,
      email: userProfile.email,
      name: userProfile.name,
    }
  } catch (error) {
    console.error('Erreur verifyUserCredentials:', error)
    return null
  }
}

/**
 * Déconnexion sécurisée
 */
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Erreur logout:', error)
    throw error
  }
}

/**
 * Obtenir la session actuelle
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Erreur getCurrentSession:', error)
    return null
  }
}
