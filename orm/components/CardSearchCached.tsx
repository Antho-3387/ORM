'use client'

import React, { useState } from 'react'
import { useCardSearch, clearFrontendCache, getFrontendCacheStats } from '@/lib/useCardCache'

interface CachedCard {
  id: string
  name: string
  imageUrl?: string
  scryfallId: string
  searchCount?: number
  cachedAt?: string
}

/**
 * 🎯 COMPOSANT D'EXEMPLE : Recherche de cartes avec cache
 * 
 * Démontre :
 * - Recherche intelligente multi-niveau
 * - Affichage du source du cache
 * - Temps de réponse
 * - Stats du cache
 */
export function CardSearchCached() {
  const { query, setQuery, results, loading, error, cacheSource, duration, clearMemoryCache } = 
    useCardSearch()
  const [forceRefresh, setForceRefresh] = useState(false)
  const [stats, setStats] = useState(getFrontendCacheStats())

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery)
  }

  const handleClearCache = () => {
    clearFrontendCache()
    setStats(getFrontendCacheStats())
  }

  // Badge du source du cache
  const getSourceBadge = () => {
    const badges = {
      memory: {
        bg: '🚀 EN-MÉMOIRE',
        color: 'bg-green-100 text-green-800',
      },
      api: {
        bg: '🔽 API',
        color: 'bg-yellow-100 text-yellow-800',
      },
    }

    const badge = badges[cacheSource as keyof typeof badges]
    return badge ? (
      <span className={`px-2 py-1 rounded text-xs font-bold ${badge.color}`}>
        {badge.bg}
      </span>
    ) : null
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">🔍 Recherche de Cartes (avec Cache)</h1>

      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Chercher une carte... ex: Black Lotus"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Contrôles */}
      <div className="flex gap-2 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={forceRefresh}
            onChange={(e) => setForceRefresh(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Forcer actualisation</span>
        </label>

        <button
          onClick={handleClearCache}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          🧹 Vider le cache
        </button>
      </div>

      {/* Info du cache */}
      {cacheSource && (
        <div className="mb-4 p-3 bg-gray-100 rounded flex justify-between items-center">
          <div className="flex gap-2">
            {getSourceBadge()}
            <span className="text-sm text-gray-700">
              ⏱️ {duration}ms
            </span>
          </div>
          <div className="text-xs text-gray-600">
            💾 Mém: {stats.inMemory}
          </div>
        </div>
      )}

      {/* État de chargement */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
          <p className="mt-2 text-gray-600">Recherche en cours...</p>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      {/* Résultats */}
      {results.length > 0 && !loading && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Résultats ({results.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((card: CachedCard) => (
              <CardItem key={card.id} card={card} cacheSource={cacheSource} />
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-8 text-gray-600">
          Aucune carte trouvée pour "{query}"
        </div>
      )}

      {/* Documentation */}
      <CacheExplanation />
    </div>
  )
}

/**
 * 📊 Composant carte
 */
function CardItem({ 
  card, 
  cacheSource 
}: { 
  card: CachedCard
  cacheSource: string | null
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt={card.name}
          className="w-full h-48 object-cover rounded mb-2"
        />
      )}
      <h3 className="font-bold text-sm">{card.name}</h3>
      <p className="text-xs text-gray-600">ID: {card.scryfallId}</p>
      {card.searchCount && (
        <p className="text-xs text-gray-500 mt-1">
          Recherchée {card.searchCount} fois
        </p>
      )}
    </div>
  )
}

/**
 * 📚 Documentation du système
 */
function CacheExplanation() {
  return (
    <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm">
      <h3 className="font-bold mb-2">📚 Comment fonctionne le cache?</h3>
      <ul className="space-y-2 text-gray-700">
        <li>
          <strong>🚀 EN-MÉMOIRE (&lt;1ms):</strong> Cache JavaScript pendant la session. Ultra-rapide.
        </li>
        <li>
          <strong> API (&lt;50ms):</strong> Appel backend, vérification BDD Supabase.
        </li>
        <li>
          <strong>📊 BACKEND:</strong> Si pas trouvée en DB → appel Scryfall → sauvegarde auto.
        </li>
      </ul>
      <p className="mt-3 text-xs text-gray-600 italic">
        ⚡ Chaque nouvelle recherche enrichit la base de données. Plus vous cherchez, plus c'est rapide!
      </p>
    </div>
  )
}
