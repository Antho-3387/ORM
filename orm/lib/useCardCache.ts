/**
 * CACHE FRONTEND - React Hook
 * 
 * 2 niveaux :
 * 1. LocalStorage (persistant 24h) - Survit aux rafraîchissements
 * 2. En-mémoire (React Query) - Pendant la session
 * 
 * BUT : Réduire au maximum les appels backend
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

const CACHE_KEY_PREFIX = 'card_cache_'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 heures
const MEMORY_CACHE = new Map<string, CacheEntry>()

/**
 * 🧠 Hook React pour recherche de cartes avec cache multi-niveaux
 */
export function useCardSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<CachedCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cacheSource, setCacheSource] = useState<'memory' | 'localstorage' | 'api' | null>(null)
  const [duration, setDuration] = useState(0)

  const getCacheKey = useCallback((q: string) => {
    return `${CACHE_KEY_PREFIX}${q.toLowerCase()}`
  }, [])

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
   * 2️⃣ Vérifier le LocalStorage (rapide, <10ms)
   */
  const getFromLocalStorage = useCallback((q: string) => {
    try {
      const key = getCacheKey(q)
      const stored = localStorage.getItem(key)
      
      if (!stored) return null

      const entry: CacheEntry = JSON.parse(stored)
      const age = Date.now() - entry.timestamp

      if (age > CACHE_DURATION) {
        localStorage.removeItem(key)
        return null
      }

      console.log(`✅ [CACHE FRONTEND - LOCALSTORAGE] ${q} (Age: ${(age / 1000 / 60).toFixed(0)}min)`)
      return entry.data
    } catch (e) {
      console.error('Error reading from localStorage:', e)
      return null
    }
  }, [getCacheKey])

  /**
   * 3️⃣ Recherche via l'API backend
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
   * LOGIQUE PRINCIPALE : Recherche depuis + en cache multi-niveaux
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
        let source: 'memory' | 'localstorage' | 'api' = 'api'

        // 1️⃣ Si pas forced refresh, vérifier les caches
        if (!forceRefresh) {
          data = getFromMemoryCache(searchQuery)
          if (data) {
            source = 'memory'
          }

          if (!data) {
            data = getFromLocalStorage(searchQuery)
            if (data) {
              source = 'localstorage'
            }
          }
        }

        // 2️⃣ Si pas de cache, appeler l'API
        if (!data) {
          const apiResponse = await searchViaAPI(searchQuery)
          data = apiResponse.results
          source = 'api'
        }

        // 3️⃣ Sauvegarder dans les caches (frontend uniquement, backend c'est auto)
        if (source === 'api' && data.length > 0) {
          const entry: CacheEntry = {
            data,
            timestamp: Date.now(),
          }
          
          // En-mémoire
          MEMORY_CACHE.set(searchQuery, entry)
          
          // LocalStorage
          try {
            localStorage.setItem(getCacheKey(searchQuery), JSON.stringify(entry))
          } catch (e) {
            // Storage peut être plein, c'est OK
            console.warn('LocalStorage full:', e)
          }
        }

        setResults(data)
        setCacheSource(source)
        setDuration(Date.now() - startTime)
      } catch (err: any) {
        setError(err.message)
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [getFromMemoryCache, getFromLocalStorage, searchViaAPI, getCacheKey]
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
  // Vider localStorage
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      localStorage.removeItem(key)
    }
  })

  // Vider mémoire
  MEMORY_CACHE.clear()

  console.log('🧹 Frontend cache cleared')
}

/**
 * 📊 Afficher les stats du cache frontend
 */
export function getFrontendCacheStats() {
  const localStorageSize = Object.keys(localStorage)
    .filter(k => k.startsWith(CACHE_KEY_PREFIX))
    .reduce((sum, key) => sum + localStorage.getItem(key)!.length, 0)

  return {
    inMemory: MEMORY_CACHE.size,
    inLocalStorage: Object.keys(localStorage).filter(k => k.startsWith(CACHE_KEY_PREFIX)).length,
    estimatedSize: `${(localStorageSize / 1024).toFixed(2)}KB`,
  }
}
