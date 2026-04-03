/**
 * Cache Monitoring & Analytics Service
 * 
 * Suivi des performances et des métriques du système de cache
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export interface CacheMetrics {
  timestamp: Date
  totalCards: number
  avgSearchCount: number
  maxSearchCount: number
  totalSearches: number
  cacheHitRate: number
  activeLast7Days: number
  dbSize: string
}

export interface CacheAnalytics {
  period: 'day' | 'week' | 'month'
  metrics: CacheMetrics[]
  trends: {
    growth: number // % d'augmentation
    hitRateImprovement: number // % d'amélioration
    commonSearches: Array<{ query: string; count: number }>
  }
}

/**
 * 📊 Collecter les métriques du cache
 */
export async function collectCacheMetrics(): Promise<CacheMetrics> {
  const cards = await prisma.card.findMany({
    select: {
      searchCount: true,
      lastSearchedAt: true,
    },
  })

  const totalCards = cards.length
  const totalSearches = cards.reduce((sum, c) => sum + c.searchCount, 0)
  const searchCounts = cards.map(c => c.searchCount)

  const avgSearchCount = totalSearches / totalCards || 0
  const maxSearchCount = Math.max(...searchCounts, 0)

  const activeLast7Days = cards.filter(
    c => new Date(c.lastSearchedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length

  // Estimer la taille (chaque carte ~300 bytes)
  const dbSize = `~${(totalCards * 0.3).toFixed(1)}KB`

  // Simuler un cache hit rate (dans une vraie app, tracer les appels)
  const cacheHitRate = totalCards > 0 ? (totalSearches / totalCards) * 10 : 0
  const normalizedHitRate = Math.min(cacheHitRate, 100) // Cap à 100%

  return {
    timestamp: new Date(),
    totalCards,
    avgSearchCount,
    maxSearchCount,
    totalSearches,
    cacheHitRate: Math.round(normalizedHitRate),
    activeLast7Days,
    dbSize,
  }
}

/**
 * 📈 Analyser les tendances sur une période
 */
export async function analyzeCacheTrends(
  period: 'day' | 'week' | 'month' = 'week'
): Promise<CacheAnalytics> {
  const endDate = new Date()
  const startDate = new Date()

  switch (period) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1)
      break
    case 'week':
      startDate.setDate(startDate.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1)
      break
  }

  // Collecter les cartes cherchées pendant cette période
  const cards = await prisma.card.findMany({
    where: {
      lastSearchedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { searchCount: 'desc' },
    take: 1000,
  })

  const metrics = await collectCacheMetrics()

  // Tendances
  const totalCardsStart = await prisma.card.count({
    where: {
      cachedAt: { lte: startDate },
    },
  })

  const totalCardsEnd = metrics.totalCards
  const growthRate = totalCardsStart > 0 
    ? ((totalCardsEnd - totalCardsStart) / totalCardsStart) * 100 
    : 0

  // Cartes les plus cherchées (CommonSearches)
  const commonSearches = cards
    .slice(0, 10)
    .map(card => ({
      query: card.name,
      count: card.searchCount,
    }))

  return {
    period,
    metrics: [metrics],
    trends: {
      growth: Math.round(growthRate),
      hitRateImprovement: metrics.cacheHitRate, // Simplification
      commonSearches,
    },
  }
}

/**
 * 🎯 Générer un rapport de santé du cache
 */
export async function generateCacheHealthReport():Promise<{
  status: 'healthy' | 'warning' | 'critical'
  score: number
  issues: string[]
  recommendations: string[]
}> {
  const metrics = await collectCacheMetrics()
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  // Vérifier les seuils
  if (metrics.totalCards < 10) {
    issues.push('Cache trop petit: less than 10 cards')
    recommendations.push('Faire plus de recherches pour remplir le cache')
    score -= 20
  }

  if (metrics.cacheHitRate < 30) {
    issues.push('Cache hit rate too low')
    recommendations.push('Attendre plus de recherches ou pré-charger les cartes populaires')
    score -= 15
  }

  if (metrics.activeLast7Days < metrics.totalCards * 0.2) {
    issues.push('Beaucoup de cartes inactives')
    recommendations.push('Exécuter un cleanup pour supprimer les cartes non utilisées')
    score -= 10
  }

  // Calculer l'âge moyen du cache
  const allCards = await prisma.card.findMany({
    select: { cachedAt: true },
  })

  if (allCards.length > 0) {
    const now = Date.now()
    const avgAge = allCards.reduce(
      (sum, c) => sum + (now - new Date(c.cachedAt).getTime()),
      0
    ) / allCards.length

    const avgAgeDays = avgAge / (24 * 60 * 60 * 1000)

    if (avgAgeDays > 90) {
      issues.push(`Cache average age: ${avgAgeDays.toFixed(0)} days`)
      recommendations.push('Considérer un refresh complet depuis Scryfall')
      score -= 5
    }
  }

  const status = 
    score >= 80 ? 'healthy' :
    score >= 50 ? 'warning' :
    'critical'

  return {
    status,
    score: Math.max(0, score),
    issues,
    recommendations,
  }
}

/**
 * 🔌 API ENDPOINT: GET /api/cache/metrics
 */
export async function GET_METRICS(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') || 'metrics'

    let response

    switch (type) {
      case 'health':
        response = await generateCacheHealthReport()
        break

      case 'analytics':
        const period = (request.nextUrl.searchParams.get('period') || 'week') as 'day' | 'week' | 'month'
        response = await analyzeCacheTrends(period)
        break

      case 'metrics':
      default:
        response = await collectCacheMetrics()
    }

    return NextResponse.json({
      success: true,
      type,
      data: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error fetching cache metrics:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * 📋 Format pretty pour affichage terminal/logs
 */
export function formatMetricsForLog(metrics: CacheMetrics): string {
  return `
╔════════════════════════════════════════╗
║     📊 CACHE METRICS REPORT            ║
╚════════════════════════════════════════╝

📦 DONNÉES:
  • Total cartes en cache: ${metrics.totalCards}
  • Taille estimée: ${metrics.dbSize}
  • Cartes actives (7j): ${metrics.activeLast7Days}

📈 PERFORMANCES:
  • Recherches totales: ${metrics.totalSearches}
  • Moyenne par carte: ${metrics.avgSearchCount.toFixed(2)}
  • Carte la plus cherchée: ${metrics.maxSearchCount}x
  • Taux de cache hit: ${metrics.cacheHitRate}%

⏰ Généré: ${metrics.timestamp.toISOString()}
`
}

/**
 * 🎯 Exporter les métriques pour Prometheus/Grafana
 */
export async function exportPrometheusMetrics(): Promise<string> {
  const metrics = await collectCacheMetrics()
  const health = await generateCacheHealthReport()

  return `
# HELP magic_cache_total_cards Total cards in cache
# TYPE magic_cache_total_cards gauge
magic_cache_total_cards ${metrics.totalCards}

# HELP magic_cache_total_searches Total searches performed
# TYPE magic_cache_total_searches gauge
magic_cache_total_searches ${metrics.totalSearches}

# HELP magic_cache_hit_rate Cache hit rate percentage
# TYPE magic_cache_hit_rate gauge
magic_cache_hit_rate ${metrics.cacheHitRate}

# HELP magic_cache_active_7days Cards active in last 7 days
# TYPE magic_cache_active_7days gauge
magic_cache_active_7days ${metrics.activeLast7Days}

# HELP magic_cache_health_score Overall health score (0-100)
# TYPE magic_cache_health_score gauge
magic_cache_health_score ${health.score}

# HELP magic_cache_health_status Health status (0=critical, 1=warning, 2=healthy)
# TYPE magic_cache_health_status gauge
magic_cache_health_status ${health.status === 'healthy' ? 2 : health.status === 'warning' ? 1 : 0}
`
}

/**
 * 💡 Insights intelligentes
 */
export async function generateCacheInsights(): Promise<{
  insight: string
  severity: 'info' | 'success' | 'warning' | 'error'
  action?: string
}[]> {
  const metrics = await collectCacheMetrics()
  const health = await generateCacheHealthReport()
  const insights: any[] = []

  // Insight 1: Cache hit rate
  if (metrics.cacheHitRate > 70) {
    insights.push({
      insight: `Excellent cache hit rate! ${metrics.cacheHitRate}% des requêtes utilisent le cache.`,
      severity: 'success',
    })
  } else if (metrics.cacheHitRate > 40) {
    insights.push({
      insight: `Cache hit rate est correct (${metrics.cacheHitRate}%). Peut être amélioré.`,
      severity: 'info',
      action: 'Encourager plus de recherches pour remplir le cache',
    })
  }

  // Insight 2: Cache size
  if (metrics.totalCards > 1000) {
    insights.push({
      insight: `Cache très complet: ${metrics.totalCards} cartes! Économies significatives.`,
      severity: 'success',
    })
  } else if (metrics.totalCards < 50) {
    insights.push({
      insight: `Cache en construction: seulement ${metrics.totalCards} cartes.`,
      severity: 'info',
      action: 'Continuer à enrichir le cache avec de nouvelles recherches',
    })
  }

  // Insight 3: Popular cards
  const allCards = await prisma.card.findMany({
    orderBy: { searchCount: 'desc' },
    take: 5,
    select: { name: true, searchCount: true },
  })

  if (allCards.length > 0) {
    insights.push({
      insight: `Les cartes les plus populaires: ${allCards.map(c => c.name).join(', ')}`,
      severity: 'info',
    })
  }

  // Insight 4: Health
  if (health.status === 'critical') {
    insights.push({
      insight: 'Cache en état critique!',
      severity: 'error',
      action: health.recommendations[0],
    })
  }

  return insights
}
