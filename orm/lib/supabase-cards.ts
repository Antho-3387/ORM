import { supabase } from './supabase'
import { searchCards as scryfallSearch } from './scryfall'

interface Card {
  id: string
  name: string
  image_url?: string
  type_line: string
  mana_value?: number
  colors?: string
  scryfall_id: string
}

interface ScryfallCard {
  id: string
  name: string
  type_line: string
  mana_value?: number
  colors?: string[]
  image_uris?: { normal: string }
}

// Cache en mémoire pour les cartes (TTL: 5 minutes)
const cardCache = new Map<string, { data: any[]; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

/**
 * Transformer une carte Scryfall en carte locale
 */
function transformScryfallCard(scryfallCard: any): Card {
  return {
    id: scryfallCard.id,
    scryfall_id: scryfallCard.id,
    name: scryfallCard.name,
    type_line: scryfallCard.type_line,
    mana_value: scryfallCard.mana_value,
    colors: scryfallCard.colors ? JSON.stringify(scryfallCard.colors) : '',
    image_url: scryfallCard.image_uris?.normal,
  }
}

/**
 * Chercher les cartes dans Supabase (local) ou Scryfall (API)
 */
export async function searchCardsOptimized(query: string): Promise<Card[]> {
  // Vérifier le cache
  const cached = cardCache.get(query)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    // D'abord essayer Supabase
    const { data, error } = await supabase
      .from('Card')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(50)

    if (data && data.length > 0) {
      cardCache.set(query, { data: data as Card[], timestamp: Date.now() })
      return data as Card[]
    }

    // Si pas de résultat dans Supabase, chercher sur Scryfall et mettre en cache
    const scryfallCards = await scryfallSearch(query)
    if (scryfallCards.length > 0) {
      const transformedCards = scryfallCards.map(transformScryfallCard)

      // Sauvegarder dans Supabase pour les prochaines fois (non-bloquant)
      transformedCards.forEach(card => {
        // Fire and forget - sauvegarde en arrière-plan sans bloquer
        void supabase.from('Card').upsert([
          {
            scryfall_id: card.scryfall_id,
            name: card.name,
            type_line: card.type_line,
            image_url: card.image_url,
            mana_value: card.mana_value,
            colors: card.colors,
          },
        ], { onConflict: 'scryfall_id' })
      })

      cardCache.set(query, { data: transformedCards, timestamp: Date.now() })
      return transformedCards
    }

    return []
  } catch (error) {
    console.error('Error searching cards:', error)
    // Fallback sur Scryfall
    const cards = await scryfallSearch(query)
    return cards.map(transformScryfallCard)
  }
}

/**
 * Obtenir les cartes populaires depuis Supabase
 */
export async function getPopularCards(): Promise<Card[]> {
  try {
    const { data } = await supabase
      .from('Card')
      .select('*')
      .limit(100)
      .order('id', { ascending: false })

    return data as Card[] || []
  } catch (error) {
    console.error('Error fetching popular cards:', error)
    return []
  }
}

/**
 * Obtenir une carte par ID
 */
export async function getCardById(id: string): Promise<Card | null> {
  try {
    const { data } = await supabase
      .from('Card')
      .select('*')
      .eq('id', id)
      .single()

    return data as Card || null
  } catch (error) {
    console.error('Error fetching card:', error)
    return null
  }
}

/**
 * Sauvegarder une carte dans Supabase
 */
export async function saveCard(card: Partial<Card>): Promise<Card | null> {
  try {
    const { data } = await supabase
      .from('Card')
      .upsert([card])
      .select()
      .single()

    return data as Card || null
  } catch (error) {
    console.error('Error saving card:', error)
    return null
  }
}
