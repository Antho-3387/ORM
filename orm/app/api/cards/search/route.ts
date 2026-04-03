import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { searchCards } from '@/lib/scryfall'

// Interface pour une carte
interface Card {
  id: string
  name: string
  imageUrl?: string
  type: string
  manaValue?: number
  colors?: string[]
}

// Cache simple en mémoire
// Key: "search_query_page_limit"
// Value: { cards, timestamp }
const searchCache = new Map<string, { cards: any[]; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface SearchParams {
  q?: string // Requête de recherche (optionnelle)
  page?: string // Numéro de page (défaut: 1)
  limit?: string // Cartes par page (défaut: 20, max: 100)
  sortBy?: string // 'name' ou 'popularity'
}

/**
 * GET /api/cards/search?q=atraxa&page=1&limit=20
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================================
    // ÉTAPE 1: Parser les paramètres
    // ============================================================
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const sortBy = searchParams.get('sortBy') || 'name'

    const offset = (page - 1) * limit

    // ============================================================
    // ÉTAPE 2: Vérifier le cache
    // ============================================================
    const cacheKey = `${query}_${page}_${limit}`
    const cached = searchCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cached.cards,
        page,
        limit,
        query,
        cached: true,
      })
    }

    // ============================================================
    // ÉTAPE 3: Chercher en base de données
    // OPTION A: Si pas de base Card remplie → chercher via Scryfall
    // OPTION B: Si base remplie → requête SQL simple avec offset
    // ============================================================

    // Pour commencer, on va récupérer depuis Scryfall et mettre en cache
    // Une fois rempli, on utilisera simplement Supabase

    let cards: Card[] = []
    let total = 0

    if (query.trim()) {
      // Recherche via Scryfall
      try {
        // OPTIMISATION: Scryfall search syntax
        // Exemples: !"Atraxa", color:u (bleu), type:creature
        const scryfallResults = await searchCards(query)
        
        if (scryfallResults && scryfallResults.length > 0) {
          // Trier par pertinence (ne pas trier si peu de résultats)
          cards = scryfallResults
            .slice(offset, offset + limit)
            .map((card: any) => ({
              id: card.id,
              name: card.name,
              imageUrl: card.image_uris?.normal,
              type: card.type_line,
              manaValue: card.mana_value,
              colors: card.colors,
            }))

          total = scryfallResults.length
        }
      } catch (error) {
        console.error('Scryfall search error:', error)
        // Fallback silencieux
      }
    } else {
      // Sans requête: cartes populaires par défaut (à implémenter)
      // Pour l'instant, juste des cartes de test
      cards = []
      total = 0
    }

    // ============================================================
    // ÉTAPE 4: Mettre en cache
    // ============================================================
    searchCache.set(cacheKey, {
      cards,
      timestamp: Date.now(),
    })

    // ============================================================
    // ÉTAPE 5: Répondre avec pagination metadata
    // ============================================================
    return NextResponse.json({
      success: true,
      data: cards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      query,
      cached: false,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
