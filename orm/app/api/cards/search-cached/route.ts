import { NextRequest, NextResponse } from 'next/server'
import { 
  searchCardWithCache, 
  getCardByIdWithCache,
  getCacheStats,
  refreshCardCache,
  cleanupOldCache
} from '@/lib/card-cache-service'

/**
 * 🔍 GET /api/cards/search
 * 
 * Recherche intelligente avec cache :
 * - 1ère requête : Scryfall + Sauvegarde DB
 * - Requêtes suivantes : Direct depuis DB (< 50ms)
 * 
 * Params:
 * - q: string (nom de la carte)
 * - refresh: boolean (forcer Scryfall)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const forceRefresh = searchParams.get('refresh') === 'true'
    const statsOnly = searchParams.get('stats') === 'true'

    // 📊 Endpoint stats
    if (statsOnly) {
      const stats = await getCacheStats()
      return NextResponse.json({
        success: true,
        cache: stats,
      })
    }

    if (!query) {
      return NextResponse.json(
        { 
          error: 'Paramètre "q" requis',
          example: '/api/cards/search?q=Black+Lotus'
        },
        { status: 400 }
      )
    }

    // 🔥 Recherche avec cache intelligent
    const startTime = Date.now()
    const results = await searchCardWithCache(query, { forceRefresh })
    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      duration: `${duration}ms`,
      cached: duration < 100, // True si probablement en cache
      results,
    })
  } catch (error: any) {
    console.error('Error in GET /api/cards/search:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Erreur lors de la recherche',
      },
      { status: 500 }
    )
  }
}

/**
 * 📥 POST /api/cards
 * 
 * Créer ou mettre en cache une carte manuellement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scryfallId, name, manaValue, colors, type, imageUrl } = body

    if (!scryfallId || !name) {
      return NextResponse.json(
        { error: 'scryfallId et name sont requis' },
        { status: 400 }
      )
    }

    // Récupérer et mettre en cache
    const card = await getCardByIdWithCache(scryfallId)

    return NextResponse.json({
      success: true,
      card,
      action: 'cached',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/cards:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la sauvegarde' },
      { status: 500 }
    )
  }
}

/**
 * 🔄 PUT /api/cards/refresh
 * 
 * Forcer une actualisation depuis Scryfall
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { scryfallId } = body

    if (!scryfallId) {
      return NextResponse.json(
        { error: 'scryfallId requis' },
        { status: 400 }
      )
    }

    const refreshedCard = await refreshCardCache(scryfallId)

    return NextResponse.json({
      success: true,
      message: 'Cache actualisé',
      card: refreshedCard,
    })
  } catch (error: any) {
    console.error('Error in PUT refresh:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * 🧹 DELETE /api/cards/cleanup
 * 
 * Nettoyer les vieilles entrées de cache
 * À appeler périodiquement (cron job)
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')

    // Vérifier authentification (vous pouvez ajouter un middleware)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.CACHE_ADMIN_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await cleanupOldCache(days)

    return NextResponse.json({
      success: true,
      message: `Cache nettoyé: ${result.count} cartes supprimées`,
      deletedCount: result.count,
    })
  } catch (error: any) {
    console.error('Error in DELETE cleanup:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
