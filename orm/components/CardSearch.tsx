'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { getCardImageUrl } from '@/lib/card-image'

export interface ScryfallCard {
  id: string
  name: string
  image_uris?: {
    small?: string
    normal: string
    large: string
  }
  card_faces?: Array<{
    name: string
    image_uris?: {
      small?: string
      normal: string
      large: string
    }
  }>
  mana_cost?: string
  cmc: number
  type_line: string
  color_identity: string[]
  colors?: string[]
  scryfall_uri?: string
}

interface CardSearchProps {
  onSelect: (card: ScryfallCard) => void
  placeholder?: string
}

export function CardSearch({ onSelect, placeholder = 'Search cards...' }: CardSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ScryfallCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const searchCards = useCallback(async (searchQuery: string, signal: AbortSignal) => {
    if (!searchQuery.trim()) {
      setResults([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/scryfall/search?q=${encodeURIComponent(searchQuery)}`,
        { signal }
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de rechercher les cartes.')
      }

      setResults(data.data?.slice(0, 10) || [])
    } catch (error) {
      if (signal.aborted) return
      console.error('Search error:', error)
      setResults([])
      setError(error instanceof Error ? error.message : 'La recherche a échoué.')
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (query) {
      setIsOpen(true)
      const controller = new AbortController()
      const timer = setTimeout(() => {
        void searchCards(query, controller.signal)
      }, 300)

      return () => {
        clearTimeout(timer)
        controller.abort()
      }
    } else {
      setResults([])
      setIsOpen(false)
      setLoading(false)
    }
  }, [query, searchCards])

  const handleSelectCard = (card: ScryfallCard) => {
    onSelect(card)
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800/80 transition-all focus:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur border border-slate-700/50 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.map((card) => {
            const image =
              getCardImageUrl(card, 'small') ||
              getCardImageUrl(card, 'normal') ||
              ''

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelectCard(card)}
                className="w-full text-left px-4 py-3 hover:bg-slate-800/50 border-b border-slate-700/30 last:border-b-0 transition-colors flex gap-3"
              >
                {image && (
                  <Image
                    src={image}
                    alt={card.name}
                    width={48}
                    height={64}
                    unoptimized
                    className="w-12 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {card.name}
                  </p>
                  <p className="text-xs text-slate-400">{card.type_line}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {isOpen && error && !loading && (
        <div role="alert" className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur border border-red-500/30 rounded-lg p-4 text-center text-red-200 text-sm z-50">
          {error}
        </div>
      )}

      {isOpen && query && results.length === 0 && !loading && !error && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur border border-slate-700/50 rounded-lg p-4 text-center text-slate-400 text-sm">
          Aucune carte trouvée
        </div>
      )}
    </div>
  )
}
