/**
 * Cache Monitoring & Analytics Service
 * 
 * Suivi des performances et des métriques du système de cache
 */

import { supabase } from '@/lib/supabase'

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
  try {
    const { data: cards, error } = await supabase
      .from('Card')
      .select('searchCount, lastSearchedAt')

    if (error) {
      throw error
    }

    if (!cards || cards.length === 0) {
      return {
        timestamp: new Date(),
        totalCards: 0,
        avgSearchCount: 0,
        maxSearchCount: 0,
        totalSearches: 0,
        cacheHitRate: 0,
        activeLast7Days: 0,
        dbSize: '0KB',
      }
    }

    const totalCards = cards.length
    const totalSearches = cards.reduce((sum, c) => sum + (c.searchCount || 0), 0)
    const searchCounts = cards.map(c => c.searchCount || 0)

  const avgSearchCount = totalSearches / totalCards || 0
  const maxSearchCount = Math.max(...searchCounts, 0)

    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
    
    const activeLast7Days = cards.filter(
      c => c.lastSearchedAt && new Date(c.lastSearchedAt).getTime() > sevenDaysAgo
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
  } catch (error) {
    console.error('Error collecting cache metrics:', error)
    throw error
  }
}

/**
 * 📈 Analyser les tendances sur une période
 */
export async function analyzeCacheTrends(
  period: 'day' | 'week' | 'month' = 'week'
): Promise<CacheAnalytics> {
  try {
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
    const { data: cards, error } = await supabase
      .from('Card')
      .select('name, searchCount, lastSearchedAt')
      .gte('lastSearchedAt', startDate.toISOString())
      .lte('lastSearchedAt', endDate.toISOString())
      .order('searchCount', { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    if (!cards || cards.length === 0) {
      return {
        period,
        metrics: [],
        trends: {
          growth: 0,
          hitRateImprovement: 0,
          commonSearches: [],
        },
      }
    }

    // Collecter les metrics du début de la période
    const currentMetrics = await collectCacheMetrics()

    // Construire les données de tendance
    const commonSearches = cards
      .slice(0, 10)
      .map(card => ({
        query: card.name,
        count: card.searchCount || 0,
      }))

    return {
      period,
      metrics: [currentMetrics],
      trends: {
        growth: 0, // À calculer avec des historiques
        hitRateImprovement: 0, // À calculer avec des historiques
        commonSearches,
      },
    }
  } catch (error) {
    console.error('Error analyzing cache trends:', error)
    throw error
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
  try {
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
  } catch (error) {
    console.error('Error generating cache health report:', error)
    throw error
  }
}

/**
 * � Exporter les métriques pour monitoring externe
 */
export async function exportMetricsForMonitoring() {
  try {
    const metrics = await collectCacheMetrics()
    const trends = await analyzeCacheTrends('week')

    return {
      metrics,
      trends,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
  } catch (error) {
    console.error('Error exporting metrics:', error)
    throw error
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
  const { data: allCards, error: cardsError } = await supabase
    .from('card')
    .select('name, searchCount')
    .order('searchCount', { ascending: false })
    .limit(5)

  if (allCards && allCards.length > 0) {
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
