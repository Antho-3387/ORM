/**
 * 📖 EXEMPLE COMPLET D'INTÉGRATION
 * 
 * Ce fichier montre comment utiliser le système de cache dans une application réelle
 */

// ================================================================
// 1️⃣ PAGE REACT : Afficher la recherche avec cache
// ================================================================

// app/cards/page.tsx
'use client'

import React from 'react'
import { CardSearchCached } from '@/components/CardSearchCached'

export default function CardsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🃏 Recherche de Cartes Magic
          </h1>
          <p className="text-gray-400">
            Avec cache intelligent multi-niveaux
          </p>
        </div>

        <CardSearchCached />
      </div>
    </main>
  )
}

// ================================================================
// 2️⃣ COMPOSANT AVANCÉ : Avec stats en temps réel
// ================================================================

// components/CardSearchAdvanced.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useCardSearch, getFrontendCacheStats } from '@/lib/useCardCache'

interface CacheStats {
  totalCachedCards: number
  inMemoryCache: number
  mostPopular: Array<{ name: string; searchCount: number }>
  dbSize: string
}

export function CardSearchAdvanced() {
  const { query, setQuery, results, loading, cacheSource, duration } = useCardSearch()
  const [backendStats, setBackendStats] = useState<CacheStats | null>(null)

  // Charger les stats du backend
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/cards/search-cached?stats=true')
        const data = await response.json()
        setBackendStats(data.cache)
      } catch (error) {
        console.error('Failed to fetch cache stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Rafraîchir toutes les 30s

    return () => clearInterval(interval)
  }, [])

  const frontendStats = getFrontendCacheStats()

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* RECHERCHE */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">🔍 Recherche</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher une carte..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {loading && <p className="text-blue-600">⏳ Recherche...</p>}

        {/* Badge cache */}
        {cacheSource && (
          <div className="mb-4 p-3 bg-gray-100 rounded flex justify-between">
            <span className="font-semibold">
              {cacheSource === 'memory' && '🚀 EN-MÉMOIRE'}
              {cacheSource === 'localstorage' && '💾 LOCALSTORAGE'}
              {cacheSource === 'api' && '🔽 API'}
            </span>
            <span className="text-gray-600">{duration}ms</span>
          </div>
        )}

        {/* Résultats */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {results.slice(0, 6).map((card: any) => (
              <div key={card.id} className="border rounded p-3">
                <h3 className="font-bold">{card.name}</h3>
                {card.imageUrl && (
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-32 object-cover rounded mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STATS FRONTEND */}
      <div className="grid grid-cols-2 gap-6">
        {/* Frontend Stats */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold mb-4">💻 Cache Frontend</h3>

          <div className="space-y-2">
            <p className="text-sm">
              <strong>En-mémoire:</strong> {frontendStats.inMemory} entrées
            </p>
            <p className="text-sm">
              <strong>LocalStorage:</strong> {frontendStats.inLocalStorage} entrées
            </p>
            <p className="text-sm">
              <strong>Taille estimée:</strong> {frontendStats.estimatedSize}
            </p>
          </div>
        </div>

        {/* Backend Stats */}
        {backendStats && (
          <div className="bg-green-50 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">🗄️ Cache Backend</h3>

            <div className="space-y-2">
              <p className="text-sm">
                <strong>Total en BD:</strong> {backendStats.totalCachedCards} cartes
              </p>
              <p className="text-sm">
                <strong>Taille approx:</strong> {backendStats.dbSize}
              </p>
              <p className="text-sm">
                <strong>Cartes populaires:</strong>
              </p>
              <ul className="text-xs ml-4 mt-1">
                {backendStats.mostPopular.slice(0, 3).map((card) => (
                  <li key={card.name}>
                    • {card.name} ({card.searchCount}x)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ================================================================
// 3️⃣ HOOK PERSONNALISÉ : Avec retry et fallback
// ================================================================

// lib/useCardSearchWithRetry.ts
import { useCardSearch } from './useCardCache'
import { useCallback, useState } from 'react'

export function useCardSearchWithRetry() {
  const base = useCardSearch()
  const [retryCount, setRetryCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const searchWithRetry = useCallback(
    async (query: string, maxRetries = 3) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          setRetryCount(attempt)
          await base.search(query)
          setError(null)
          return
        } catch (err: any) {
          if (attempt === maxRetries - 1) {
            setError(err.message)
          } else {
            // Attendre avant de réessayer (backoff exponentiel)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
          }
        }
      }
    },
    [base]
  )

  return {
    ...base,
    searchWithRetry,
    retryCount,
    error,
  }
}

// ================================================================
// 4️⃣ SERVICE WORKER : Sync en arrière-plan (optionnel)
// ================================================================

// public/service-worker.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cache') {
    event.waitUntil(
      fetch('/api/cards/search-cached?stats=true')
        .then(r => r.json())
        .then(data => {
          console.log('📊 Service Worker: Cache synced', data.cache)
          // Envoyer une notification à l'app
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'CACHE_UPDATED',
                data: data.cache,
              })
            })
          })
        })
    )
  }
})

// ================================================================
// 5️⃣ ADMIN PANEL : Gérer le cache
// ================================================================

// components/AdminCachePanel.tsx
'use client'

import React, { useState } from 'react'

export function AdminCachePanel() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cards/search-cached?stats=true')
      const data = await response.json()
      setStats(data.cache)
    } catch (error) {
      setMessage('❌ Erreur: ' + String(error))
    } finally {
      setLoading(false)
    }
  }

  const cleanup = async () => {
    const adminKey = prompt('Clé admin?')
    if (!adminKey) return

    setLoading(true)
    try {
      const response = await fetch('/api/cards/search-cached/cleanup?days=30', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`✅ ${data.message}`)
        await loadStats()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">🛠️ Admin Cache</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={loadStats}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          📊 Charger Stats
        </button>

        <button
          onClick={cleanup}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          🧹 Nettoyer
        </button>
      </div>

      {message && <p className="mb-4 p-3 bg-white rounded">{message}</p>}

      {stats && (
        <div className="bg-white p-4 rounded">
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

// ================================================================
// 6️⃣ CONFIG : Variables d'environnement
// ================================================================

// .env.local
# Cache Configuration
NEXT_PUBLIC_CACHE_ENABLED=true
CACHE_TTL_MEMORY=1800000  # 30 minutes en ms
CACHE_TTL_LOCALSTORAGE=86400000  # 24 heures en ms
CACHE_ADMIN_KEY=super_secret_key_at_least_32_characters_long

# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# API
SCRYFALL_API_BASE=https://api.scryfall.com
