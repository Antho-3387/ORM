/**
 * Utilitaires pour le parsing et la recherche de cartes
 */

import { searchCards } from './scryfall'

interface CardInfo {
  quantity: number
  name: string
  imageUrl?: string
  loading?: boolean
  error?: string
}

/**
 * Parse une decklist au format "Quantité Nomdelacarte"
 */
function parseDecklist(list: string): CardInfo[] {
  const lines = list.split('\n').filter(line => line.trim())
  const cards: CardInfo[] = []

  for (const line of lines) {
    const match = line.match(/^(\d+)\s+(.+)$/)
    if (match) {
      const quantity = parseInt(match[1])
      const name = match[2].trim()

      // Chercher si la carte existe déjà
      const existing = cards.find(c => c.name.toLowerCase() === name.toLowerCase())
      if (existing) {
        existing.quantity += quantity
      } else {
        cards.push({ quantity, name })
      }
    }
  }

  return cards
}

/**
 * Cache simple pour les images de cartes
 */
const imageCache = new Map<string, string | null>()

/**
 * Récupère l'image d'une carte via Supabase avec cache
 * 
 * ⚠️ IMPORTANT: Cet appel est côté SERVEUR uniquement
 * (utilisé par les API routes, pas par le client)
 */
async function fetchCardImageWithCache(cardName: string): Promise<string | undefined> {
  const cacheKey = cardName.toLowerCase()
  
  // Vérifier le cache
  if (imageCache.has(cacheKey)) {
    const cached = imageCache.get(cacheKey)
    return cached || undefined
  }

  try {
    // Essayer exact match d'abord
    let results = await searchCards(`!"${cardName}"`)
    
    // Si pas trouvé, essayer sans exact match (fuzzy search)
    if (results.length === 0) {
      results = await searchCards(cardName)
    }
    
    if (results.length > 0 && results[0].image_uris?.normal) {
      const imageUrl = results[0].image_uris.normal
      imageCache.set(cacheKey, imageUrl)
      return imageUrl
    }
  } catch (error) {
    console.warn(`Error fetching image for "${cardName}":`, error)
  }
  
  // Cache le fait qu'on n'a pas trouvé l'image
  imageCache.set(cacheKey, null)
  return undefined
}

/**
 * Récupère les images pour toutes les cartes avec chargement parallèle
 */
async function fetchAllCardImages(cards: CardInfo[], onProgress?: (count: number) => void): Promise<CardInfo[]> {
  const BATCH_SIZE = 6  // Charger 6 cartes en parallèle pour respecter le rate limit
  const updated: CardInfo[] = new Array(cards.length).fill(null)
  let completed = 0

  // Traiter par lots
  for (let batch = 0; batch < cards.length; batch += BATCH_SIZE) {
    const batchCards = cards.slice(batch, Math.min(batch + BATCH_SIZE, cards.length))
    
    // Charger les cartes du lot en parallèle
    const promises = batchCards.map((card, idx) =>
      fetchCardImageWithCache(card.name).then(imageUrl => ({
        index: batch + idx,
        card,
        imageUrl
      }))
    )

    const results = await Promise.all(promises)
    
    // Mettre à jour les résultats
    for (const result of results) {
      updated[result.index] = {
        ...result.card,
        imageUrl: result.imageUrl,
        error: result.imageUrl ? undefined : undefined
      }
      completed++
      
      if (onProgress) {
        onProgress(completed)
      }
    }

    // Délai entre les lots pour respecter le rate limit
    if (batch + BATCH_SIZE < cards.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  return updated.filter((c): c is CardInfo => c !== null)
}

export { parseDecklist, fetchAllCardImages, fetchCardImageWithCache }
export type { CardInfo }
