/**
 * Utilitaires pour le parsing et la recherche de cartes
 */

import { searchCards } from './scryfall'
import { getCardImageUrl } from './card-image'

interface CardInfo {
  quantity: number
  name: string
  section?: 'commander'
  imageUrl?: string
  loading?: boolean
  error?: string
}

/**
 * Parse une decklist au format "Quantité Nomdelacarte".
 * Le dernier bloc séparé par une ligne vide correspond à la zone de commandant.
 */
function parseDecklist(list: string): CardInfo[] {
  const sections = list.split(/\r?\n\s*\r?\n/)
  let lastSectionIndex = sections.length - 1
  while (lastSectionIndex >= 0 && !sections[lastSectionIndex].trim()) {
    lastSectionIndex--
  }
  const lastSection = sections[lastSectionIndex]?.trim()
  const commanderSection =
    lastSectionIndex > 0 &&
    lastSection &&
    !lastSection.split(/\r?\n/).some(line => /^\s*SB:/i.test(line))
      ? lastSectionIndex
      : -1
  const cards: CardInfo[] = []

  sections.forEach((sectionText, sectionIndex) => {
    const section = sectionIndex === commanderSection ? 'commander' : undefined

    for (const line of sectionText.split(/\r?\n/)) {
      const match = line.match(/^(?:SB:\s*)?(\d+)\s*x?\s+(.+)$/i)
      if (!match) continue

      const quantity = parseInt(match[1])
      const name = match[2]
        .trim()
        .replace(/\s+\([A-Z0-9]{2,6}\)(?:\s+[\w-]+)?$/i, '')
        .trim()

      if (!name || quantity < 1) continue

      const existing = cards.find(
        card =>
          card.name.toLowerCase() === name.toLowerCase() &&
          card.section === section
      )
      if (existing) {
        existing.quantity += quantity
      } else {
        cards.push({ quantity, name, section })
      }
    }
  })

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
    
    if (results.length > 0) {
      const imageUrl = getCardImageUrl(results[0])
      if (!imageUrl) return undefined
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
