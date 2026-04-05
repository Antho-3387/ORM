/**
 * CACHE FRONTEND - React Hook
 * 
 * Cache en-mémoire uniquement (session) via Supabase Auth session.
 * P.S. : Les sessions utilisateur sont maintenant managées par Supabase Auth,
 * pas besoin de localStorage !
 */

import { useCallback, useEffect, useState } from 'react'

interface CachedCard {
  id: string
  name: string
  imageUrl?: string
  scryfallId: string
}

interface CacheEntry {
  data: CachedCard[]
  timestamp: number
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 heures (session)
const MEMORY_CACHE = new Map<string, CacheEntry>()

/**
 * 🧠 Hook React pour recherche de cartes avec cache en-mémoire
 */
export function useCardSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<CachedCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cacheSource, setCacheSource] = useState<'memory' | 'api' | null>(null)
  const [duration, setDuration] = useState(0)

  /**
   * 1️⃣ Vérifier le cache en-mémoire (ultra-rapide, <1ms)
   */
  const getFromMemoryCache = useCallback((q: string) => {
    const cached = MEMORY_CACHE.get(q)
    
    if (!cached) return null
    
    const age = Date.now() - cached.timestamp
    if (age > CACHE_DURATION) {
      MEMORY_CACHE.delete(q)
      return null
    }

    console.log(`✅ [CACHE FRONTEND - MEMORY] ${q} (Age: ${(age / 1000).toFixed(0)}s)`)
    return cached.data
  }, [])

  /**
   * 2️⃣ Recherche via l'API backend
   */
  const searchViaAPI = useCallback(async (q: string) => {
    try {
      const startTime = Date.now()
      
      const response = await fetch(
        `/api/cards/search-cached?q=${encodeURIComponent(q)}`,
        {
          cache: 'no-store', // Bypass HTTP cache
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const duration = Date.now() - startTime

      console.log(`🔽 [API] ${q} (${duration}ms)`)

      return {
        results: data.results || [],
        duration,
        source: 'api' as const,
      }
    } catch (err) {
      throw new Error(`Failed to fetch cards: ${err}`)
    }
  }, [])

  /**
   * LOGIQUE PRINCIPALE : Recherche depuis cache ou API
   */
  const search = useCallback(
    async (searchQuery: string, forceRefresh: boolean = false) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      setError(null)
      const startTime = Date.now()

      try {
        let data: CachedCard[] | null = null
        let source: 'memory' | 'api' = 'api'

        // 1️⃣ Si pas forced refresh, vérifier le cache en-mémoire
        if (!forceRefresh) {
          data = getFromMemoryCache(searchQuery)
          if (data) {
            source = 'memory'
          }
        }

        // 2️⃣ Si pas de cache, appeler l'API
        if (!data) {
          const apiResponse = await searchViaAPI(searchQuery)
          data = apiResponse.results
          source = 'api'
        }

        // 3️⃣ Sauvegarder dans le cache en-mémoire uniquement
        if (source === 'api' && data && data.length > 0) {
          const entry: CacheEntry = {
            data,
            timestamp: Date.now(),
          }
          
          MEMORY_CACHE.set(searchQuery, entry)
        }

        setResults(data || [])
        setCacheSource(source)
        setDuration(Date.now() - startTime)
      } catch (err: any) {
        setError(err.message)
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [getFromMemoryCache, searchViaAPI]
  )

  // Recherche automatique si query change
  useEffect(() => {
    if (query) {
      search(query)
    }
  }, [query, search])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    cacheSource,
    duration,
    search,
    clearMemoryCache: () => MEMORY_CACHE.clear(),
  }
}

/**
 * 🗑️ Nettoyer le cache frontend
 */
export function clearFrontendCache() {
  // Vider mémoire
  MEMORY_CACHE.clear()
  console.log('🧹 Frontend cache cleared')
}

/**
 * 📊 Afficher les stats du cache frontend
 */
export function getFrontendCacheStats() {
  return {
    inMemory: MEMORY_CACHE.size,
    inLocalStorage: 0, // Pas de localStorage
    estimatedSize: '0KB',
  }
}
