import { NextResponse } from 'next/server'

interface Card {
  id: string
  name: string
  imageUrl?: string
  type: string
  manaValue?: number
  colors?: string[]
}

// Cache global: stocke toutes les cartes en mémoire
interface CacheEntry {
  cards: Card[]
  timestamp: number
}

const allCardsCache: { current: CacheEntry | null } = { current: null }
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 heures

/**
 * GET /api/cards/all
 * 
 * Retourne TOUTES les cartes en une seule requête
 * Dedupliquées par ID
 * 
 */
export async function GET() {
  try {
    // ============================================================
    // ÉTAPE 1: Vérifier le cache
    // ============================================================
    if (allCardsCache.current) {
      const age = Date.now() - allCardsCache.current.timestamp
      if (age < CACHE_TTL) {
        console.log(`[API] Serving ${allCardsCache.current.cards.length} cards from cache (age: ${(age / 1000).toFixed(0)}s)`)
        return NextResponse.json({
          success: true,
          data: allCardsCache.current.cards,
          cached: true,
          cacheAge: Math.round(age / 1000),
        })
      }
    }

    // ============================================================
    // ÉTAPE 2: Charger toutes les cartes via Scryfall
    // On utilise une requête large + pagination interne
    // ============================================================

    console.log('[API] Loading all cards from Scryfall...')
    const allCards: Card[] = []
    const seenIds = new Set<string>() // Éviter les doublons

    // Scryfall retourne les résultats par page (175 par défaut, max 175)
    let page = 1
    let hasMore = true

    while (hasMore && page <= 50) { // Limiter à 50 pages = 8750 cartes max
      try {
        console.log(`[API] Fetching page ${page}...`)
        
        const response = await fetch(
          `https://api.scryfall.com/cards/search?q=is%3Adigital%3Dfalse&page=${page}&order=name`,
          {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(10000),
          }
        )

        if (!response.ok) {
          console.error(`Scryfall returned status ${response.status}`)
          hasMore = false
          break
        }

        const data = await response.json()

        if (!data.data || data.data.length === 0) {
          hasMore = false
          break
        }

        // Transformer et dédupliquer
        for (const card of data.data) {
          if (!seenIds.has(card.id)) {
            seenIds.add(card.id)
            allCards.push({
              id: card.id,
              name: card.name,
              imageUrl: card.image_uris?.normal,
              type: card.type_line,
              manaValue: card.mana_value,
              colors: card.colors,
            })
          }
        }

        // Vérifier s'il y a une page suivante
        hasMore = data.has_more === true
        page++

        // Respecter rate limit: 100 req/min = 1 req/600ms
        await new Promise(r => setTimeout(r, 650))
      } catch (error) {
        console.error(`Error loading page ${page}:`, error)
        hasMore = false
      }
    }

    console.log(`[API] Loaded ${allCards.length} unique cards`)

    // ============================================================
    // ÉTAPE 3: Mettre en cache
    // ============================================================
    allCardsCache.current = {
      cards: allCards,
      timestamp: Date.now(),
    }

    return NextResponse.json({
      success: true,
      data: allCards,
      cached: false,
      total: allCards.length,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
        data: [],
      },
      { status: 500 }
    )
  }
}
