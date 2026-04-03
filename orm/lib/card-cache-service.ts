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

import prisma from './prisma'
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
  // Vérifier la base de données
  const existingCard = await prisma.card.findUnique({
    where: { scryfallId },
  })

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
}

/**
 * 💾 SAUVEGARDE DANS LE CACHE PERSISTANT (Prisma/Supabase)
 */
async function saveCacheCard(scryfallCard: ScryfallCard) {
  try {
    const card = await prisma.card.upsert({
      where: { scryfallId: scryfallCard.id },
      update: {
        // Mise à jour seulement si l'image a changé
        imageUrl: scryfallCard.image_uris?.normal,
        lastSearchedAt: new Date(),
        searchCount: {
          increment: 1,
        },
      },
      create: {
        scryfallId: scryfallCard.id,
        name: scryfallCard.name,
        manaValue: scryfallCard.mana_value,
        colors: JSON.stringify(scryfallCard.colors || []),
        type: scryfallCard.type_line,
        imageUrl: scryfallCard.image_uris?.normal,
        source: 'scryfall',
        searchCount: 1,
      },
    })

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
    // Recherche par nom exact ou partielle
    const card = await prisma.card.findFirst({
      where: {
        OR: [
          { name: { equals: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        searchCount: 'desc', // Prioriser les cartes populaires
      },
    })

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
    await prisma.card.update({
      where: { id: cardId },
      data: {
        lastSearchedAt: new Date(),
        searchCount: {
          increment: 1,
        },
      },
    })
  } catch (error) {
    console.error('Error updating card stats:', error)
  }
}

/**
 * 🧹 MAINTENANCE : Nettoyer les cartes non utilisées
 */
export async function cleanupOldCache(daysThreshold: number = 30) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold)

    const result = await prisma.card.deleteMany({
      where: {
        lastSearchedAt: {
          lt: cutoffDate,
        },
        searchCount: {
          lt: 2, // Garder les cartes populaires
        },
      },
    })

    console.log(`🧹 [CLEANUP] ${result.count} cartes supprimées`)
    return result
  } catch (error) {
    console.error('Cleanup error:', error)
    throw error
  }
}

/**
 * 📈 STATISTIQUES DE CACHE
 */
export async function getCacheStats() {
  const total = await prisma.card.count()
  const popular = await prisma.card.findMany({
    take: 5,
    orderBy: { searchCount: 'desc' },
    select: { name: true, searchCount: true, cachedAt: true },
  })

  const memoryUsage = IN_MEMORY_CACHE.size

  return {
    totalCachedCards: total,
    inMemoryCache: memoryUsage,
    mostPopular: popular,
    dbSize: `~${(total * 0.5).toFixed(0)}KB`, // Estimation
  }
}

/**
 * 🔄 FORCER UNE ACTUALISATION MANUELLE
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
