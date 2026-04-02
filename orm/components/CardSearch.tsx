'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export interface ScryfallCard {
  id: string
  name: string
  image_uris?: {
    normal: string
    large: string
  }
  card_faces?: Array<{
    name: string
    image_uris?: {
      normal: string
      large: string
    }
  }>
  mana_cost: string
  cmc: number
  type_line: string
  color_identity: string[]
}

interface CardSearchProps {
  onSelect: (card: ScryfallCard) => void
  placeholder?: string
}

// Simple debounce implementation
function createDebounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function CardSearch({ onSelect, placeholder = 'Search cards...' }: CardSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ScryfallCard[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const searchCards = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}&unique=cards&order=edhrec`
      )

      if (response.ok) {
        const data = await response.json()
        setResults(data.data?.slice(0, 10) || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (query) {
      setIsOpen(true)
      debounceTimeoutRef.current = setTimeout(() => {
        searchCards(query)
      }, 300)
    } else {
      setResults([])
      setIsOpen(false)
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
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
              card.image_uris?.normal ||
              card.card_faces?.[0]?.image_uris?.normal ||
              ''

            return (
              <button
                key={card.id}
                onClick={() => handleSelectCard(card)}
                className="w-full text-left px-4 py-3 hover:bg-slate-800/50 border-b border-slate-700/30 last:border-b-0 transition-colors flex gap-3"
              >
                {image && (
                  <img
                    src={image}
                    alt={card.name}
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

      {isOpen && query && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur border border-slate-700/50 rounded-lg p-4 text-center text-slate-400 text-sm">
          No cards found
        </div>
      )}
    </div>
  )
}
