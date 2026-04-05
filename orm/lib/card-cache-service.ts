/**
 * SERVICE DE CACHE INTELLIGENT POUR LES CARTES
 * 
 * Stratégie :
 * 1. Cache persistant (Supabase/Prisma) - Source de vérité
 * 2. Cache temporaire (Frontend) - Réduit requêtes backend
 * 3. Cache en-mémoire (Backend) - Accélère requêtes répétées
 * 
 * Objectif : <200ms pour cache hit, enrichissement automatique
 */

import { supabase } from './supabase'
import { searchCards, getCardById, ScryfallCard } from './scryfall'

// Cache en-mémoire (backend) - TTL 30 minutes
const IN_MEMORY_CACHE = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

/**
 * ✅ LOGIQUE PRINCIPALE : Recherche avec cache intelligent
 */
export async function searchCardWithCache(
  query: string,
  options: { forceRefresh?: boolean } = {}
) {
  // Normaliser la requête
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery) {
    throw new Error('Query is required')
  }

  // 1️⃣ CACHE HIT - En-mémoire (très rapide, < 1ms)
  if (!options.forceRefresh) {
    const cachedInMemory = getInMemoryCache(normalizedQuery)
    if (cachedInMemory) {
      console.log(`✅ [CACHE HIT - EN-MÉMOIRE] ${query}`)
      return cachedInMemory
    }
  }

  // 2️⃣ CACHE HIT - Base de données (rapide, < 50ms)
  const cardFromDb = await getCardFromDatabase(normalizedQuery)
  if (cardFromDb) {
    console.log(`✅ [CACHE HIT - DATABASE] ${query}`)
    
    // Mettre en cache en-mémoire
    setInMemoryCache(normalizedQuery, cardFromDb)
    
    // Incrémenter les stats (asynchrone, non-bloquant)
    updateCardStats(cardFromDb.id).catch(err => 
      console.error('Error updating stats:', err)
    )
    
    return cardFromDb
  }

  // 3️⃣ CACHE MISS - Appel API externe
  console.log(`❌ [CACHE MISS] Appel Scryfall pour : ${query}`)
  
  const scryfallResults = await searchCards(normalizedQuery)
  if (!scryfallResults || scryfallResults.length === 0) {
    throw new Error(`No cards found for "${query}"`)
  }

  // Enrichamento progressif : stocker toutes les cartes trouvées
  const enrichedCards = await Promise.all(
    scryfallResults.map(card => saveCacheCard(card))
  )

  // Cache en-mémoire
  if (enrichedCards.length > 0) {
    setInMemoryCache(normalizedQuery, enrichedCards)
  }

  return enrichedCards
}

/**
 * ✅ RECHERCHE PAR ID SCRYFALL
 */
export async function getCardByIdWithCache(scryfallId: string) {
  try {
    // Vérifier la base de données
    const { data: existingCard, error } = await supabase
      .from('Card')
      .select('*')
      .eq('scryfallId', scryfallId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (existingCard) {
      console.log(`✅ [CACHE HIT] Card by ID: ${scryfallId}`)
      updateCardStats(existingCard.id).catch(console.error)
      return existingCard
    }

    // Appel Scryfall si inexistant
    console.log(`❌ [CACHE MISS] Fetching from Scryfall: ${scryfallId}`)
    const scryfallCard = await getCardById(scryfallId)
    
    if (!scryfallCard) {
      throw new Error(`Card not found on Scryfall: ${scryfallId}`)
    }

    return saveCacheCard(scryfallCard)
  } catch (error) {
    console.error('Error in getCardByIdWithCache:', error)
    throw error
  }
}

/**
 * 💾 SAUVEGARDE DANS LE CACHE PERSISTANT (Supabase)
 */
async function saveCacheCard(scryfallCard: ScryfallCard) {
  try {
    const { data: card, error } = await supabase
      .from('Card')
      .upsert({
        scryfallId: scryfallCard.id,
        name: scryfallCard.name,
        manaValue: scryfallCard.mana_value,
        colors: JSON.stringify(scryfallCard.colors || []),
        type: scryfallCard.type_line,
        imageUrl: scryfallCard.image_uris?.normal,
        source: 'scryfall',
        searchCount: 1,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    console.log(`💾 [SAVED TO DB] ${scryfallCard.name}`)
    return card
  } catch (error) {
    console.error('Error saving card:', error)
    throw error
  }
}

/**
 * 🗄️ RÉCUPÉRATION DEPUIS LA BASE DE DONNÉES
 */
async function getCardFromDatabase(query: string) {
  try {
    // Recherche par nom exact ou partielle (Supabase FTS ou ilike)
    const { data: card, error } = await supabase
      .from('Card')
      .select('*')
      .or(`name.ilike.%${query}%,name.eq.${query}`)
      .order('searchCount', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code === 'PGRST116') {
      // Aucun résultat trouvé
      return null
    }

    if (error) {
      throw error
    }

    return card || null
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

/**
 * 🧠 CACHE EN-MÉMOIRE (Backend)
 */
function getInMemoryCache(key: string) {
  const cached = IN_MEMORY_CACHE.get(key)
  
  if (!cached) return null
  
  // Vérifier si le cache n'a pas expiré
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    IN_MEMORY_CACHE.delete(key)
    return null
  }

  return cached.data
}

function setInMemoryCache(key: string, data: any) {
  IN_MEMORY_CACHE.set(key, {
    data,
    timestamp: Date.now(),
  })
}

/**
 * 📊 MISE À JOUR DES STATISTIQUES
 */
async function updateCardStats(cardId: string) {
  try {
    const { error } = await supabase
      .from('Card')
      .update({
        lastSearchedAt: new Date().toISOString(),
        searchCount: { increment: 1 },
      })
      .eq('id', cardId)

    if (error) {
      console.error('Error updating card stats:', error)
    }
  } catch (error) {
    console.error('Unexpected error in updateCardStats:', error)
  }
}

/**
 * 🧹 MAINTENANCE : Nettoyer les cartes non utilisées
 */
export async function cleanupOldCache(daysThreshold: number = 30) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold)

    const { data: deletedCards, error } = await supabase
      .from('Card')
      .delete()
      .lt('lastSearchedAt', cutoffDate.toISOString())
      .lt('searchCount', 2)
      .select('id')

    if (error) {
      throw error
    }

    console.log(`🧹 [CLEANUP] ${deletedCards?.length || 0} cartes supprimées`)
    return { count: deletedCards?.length || 0 }
  } catch (error) {
    console.error('Cleanup error:', error)
    throw error
  }
}

/**
 * 📈 STATISTIQUES DE CACHE
 */
export async function getCacheStats() {
  try {
    const { count: total, error: countError } = await supabase
      .from('Card')
      .select('id', { count: 'exact' })

    if (countError) {
      throw countError
    }

    const { data: popular, error: popularError } = await supabase
      .from('Card')
      .select('name, searchCount, cachedAt')
      .order('searchCount', { ascending: false })
      .limit(5)

    if (popularError) {
      throw popularError
    }

    const memoryUsage = IN_MEMORY_CACHE.size

    return {
      totalCachedCards: total || 0,
      inMemoryCache: memoryUsage,
      mostPopular: popular || [],
      dbSize: `~${((total || 0) * 0.5).toFixed(0)}KB`, // Estimation
    }
  } catch (error) {
    console.error('Error getting cache stats:', error)
    throw error
  }
}

/**
 * � RECHERCHE AVANCÉE (avec filtres)
 */
export async function searchCardsAdvanced(filters: {
  name?: string
  type?: string
  manaValue?: number
  colors?: string[]
  minSearchCount?: number
}) {
  try {
    let query = supabase.from('Card').select('*')

    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }

    if (filters.type) {
      query = query.ilike('type', `%${filters.type}%`)
    }

    if (filters.manaValue !== undefined) {
      query = query.eq('manaValue', filters.manaValue)
    }

    if (filters.minSearchCount) {
      query = query.gte('searchCount', filters.minSearchCount)
    }

    query = query.order('searchCount', { ascending: false }).limit(50)

    const { data: cards, error } = await query

    if (error) {
      throw error
    }

    return cards || []
  } catch (error) {
    console.error('Error in searchCardsAdvanced:', error)
    throw error
  }
}

/**
 * 📦 BATCH - Sauvegarder plusieurs cartes
 */
export async function saveMultipleCards(scryfallCards: ScryfallCard[]) {
  try {
    const cardsToInsert = scryfallCards.map(card => ({
      scryfallId: card.id,
      name: card.name,
      manaValue: card.mana_value,
      colors: JSON.stringify(card.colors || []),
      type: card.type_line,
      imageUrl: card.image_uris?.normal,
      source: 'scryfall',
      searchCount: 1,
    }))

    const { data: cards, error } = await supabase
      .from('Card')
      .upsert(cardsToInsert)
      .select()

    if (error) {
      throw error
    }

    console.log(`💾 [BATCH SAVED] ${cards?.length || 0} cards`)
    return cards || []
  } catch (error) {
    console.error('Error saving multiple cards:', error)
    throw error
  }
}

/**
 * ✨ PRÉCHARGER LES CARTES POPULAIRES
 */
export async function preloadPopularCards() {
  try {
    const { data: topCards, error } = await supabase
      .from('Card')
      .select('*')
      .order('searchCount', { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    topCards?.forEach(card => {
      setInMemoryCache(card.name.toLowerCase(), card)
    })

    console.log(`⭐ Preloaded ${topCards?.length || 0} popular cards`)
    return topCards || []
  } catch (error) {
    console.error('Error preloading cards:', error)
    throw error
  }
}

/**
 * �🔄 FORCER UNE ACTUALISATION MANUELLE
 */
export async function refreshCardCache(scryfallId: string) {
  console.log(`🔄 [REFRESH] ${scryfallId}`)
  
  const scryfallCard = await getCardById(scryfallId)
  if (!scryfallCard) {
    throw new Error(`Cannot refresh: card not found on Scryfall`)
  }

  return saveCacheCard(scryfallCard)
}

/**
 * 🗑️ VIDER LE CACHE EN-MÉMOIRE (RAREMENT UTILISÉ)
 */
export function clearInMemoryCache() {
  IN_MEMORY_CACHE.clear()
  console.log('🗑️ [INFO] Cache en-mémoire vidé')
}
