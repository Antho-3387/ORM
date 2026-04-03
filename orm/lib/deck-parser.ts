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
 * Récupère l'image d'une carte via Scryfall avec cache
 */
async function fetchCardImageWithCache(cardName: string): Promise<string | undefined> {
  const cacheKey = cardName.toLowerCase()
  
  // Vérifier le cache
  if (imageCache.has(cacheKey)) {
    const cached = imageCache.get(cacheKey)
    return cached || undefined
  }

  try {
    const results = await searchCards(`!"${cardName}"`)
    
    if (results.length > 0 && results[0].image_uris?.normal) {
      const imageUrl = results[0].image_uris.normal
      imageCache.set(cacheKey, imageUrl)
      return imageUrl
    }
  } catch (error) {
    console.error(`Error fetching image for ${cardName}:`, error)
  }
  
  // Cache le fait qu'on n'a pas trouvé l'image
  imageCache.set(cacheKey, null)
  return undefined
}

/**
 * Récupère les images pour toutes les cartes avec délai
 */
async function fetchAllCardImages(cards: CardInfo[]): Promise<CardInfo[]> {
  const updated: CardInfo[] = []

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]
    try {
      const imageUrl = await fetchCardImageWithCache(card.name)
      updated.push({
        ...card,
        imageUrl,
        error: imageUrl ? undefined : undefined
      })
    } catch (error) {
      updated.push({
        ...card,
        error: 'Erreur de chargement'
      })
    }
    
    // Respecter le rate limit de Scryfall (délai progressif)
    if (i < cards.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 150))
    }
  }

  return updated
}

export { parseDecklist, fetchAllCardImages, fetchCardImageWithCache, CardInfo }
