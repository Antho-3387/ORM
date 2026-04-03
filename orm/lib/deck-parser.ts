/**
 * Utilitaires pour le parsing et la recherche de cartes
 */

import { searchCards } from './scryfall'

export interface CardInfo {
  quantity: number
  name: string
  imageUrl?: string
  loading?: boolean
  error?: string
}

/**
 * Parse une decklist au format "Quantité Nomdelacarte"
 */
export function parseDecklist(list: string): CardInfo[] {
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
 * Récupère l'image d'une carte via Scryfall
 */
export async function fetchCardImage(cardName: string): Promise<string | undefined> {
  try {
    const results = await searchCards(`!"${cardName}"`)
    
    if (results.length > 0) {
      return results[0].image_uris?.normal
    }
  } catch (error) {
    console.error(`Error fetching image for ${cardName}:`, error)
  }
  
  return undefined
}

/**
 * Récupère les images pour toutes les cartes (avec cache)
 */
export async function fetchAllCardImages(cards: CardInfo[]): Promise<CardInfo[]> {
  const updated: CardInfo[] = []

  for (const card of cards) {
    const imageUrl = await fetchCardImage(card.name)
    updated.push({
      ...card,
      imageUrl,
      error: imageUrl ? undefined : 'Image non trouvée'
    })
    
    // Respecter le rate limit de Scryfall (100ms entre requêtes)
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return updated
}
