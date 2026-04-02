'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PremiumNavbar } from '@/components/PremiumNavbar'

interface Deck {
  id: string
  name: string
  commander: string
  cardCount: number
  cards: Array<{
    id: string
    image?: string
  }>
  format?: string
  popularity?: number
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name'>('popular')

  const fetchDecks = async () => {
    try {
      // Fetch some popular commanders and create deck objects
      const commanders = [
        'Cpt. Jhoira',
        'Atraxa',
        'The First Sliver',
        'Ur-Dragon',
        'Omnath',
        'Rhystic Study',
        'Narset',
        'Sisay',
        'Korvold',
        'Tergrid',
        'Malcolm',
        'Esper Sentinel',
      ]

      const deckPromises = commanders.map(async (commander, idx) => {
        try {
          const response = await fetch(
            `https://api.scryfall.com/cards/search?q=%21"${commander}"&unique=cards&order=edhrec`
          )

          if (response.ok) {
            const data = await response.json()
            const cards = data.data?.slice(0, 3) || []
            return {
              id: Math.random().toString(),
              name: `${commander} Deck`,
              commander: commander,
              cardCount: Math.floor(Math.random() * 40) + 60,
              cards: cards.map((card: any) => ({
                id: card.id,
                image: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal,
              })),
              format: 'Commander',
              popularity: Math.floor(Math.random() * 100),
            }
          }
        } catch (error) {
          console.error(`Error fetching deck for ${commander}:`, error)
        }
        return null
      })

      const decksList = (await Promise.all(deckPromises)).filter(Boolean) as Deck[]

      // Sort by popularity
      decksList.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      setDecks(decksList)
    } catch (error) {
      console.error('Error fetching decks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDecks()
  }, [])

  const filteredDecks = decks
    .filter((deck) =>
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.commander.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.popularity || 0) - (a.popularity || 0)
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <PremiumNavbar />

      {/* Header */}
      <div className="border-b border-slate-700/30 sticky top-16 z-40 backdrop-blur bg-slate-900/50">
        <div className="container-clean py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Browse Decks</h1>
          <p className="text-slate-400">Explore popular Commander decks and strategies</p>
        </div>
      </div>

      <div className="container-clean py-12">
        {/* Search & Filter Bar */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search decks or commanders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800/80 transition-all"
              />
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popular' | 'recent' | 'name')}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Most Recent</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Decks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No decks found</h3>
            <p className="text-slate-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck) => (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                className="group glass rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20"
              >
                {/* Deck Card Images - 3-Column Grid */}
                <div className="relative w-full bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="aspect-[3/2] grid grid-cols-3 gap-0.5 p-2">
                    {deck.cards.length > 0 ? (
                      deck.cards.map((card, idx) => (
                        <div
                          key={idx}
                          className="relative rounded overflow-hidden bg-slate-700"
                        >
                          {card.image ? (
                            <img
                              src={card.image}
                              alt="Deck card"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                              <span className="text-2xl">🃏</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 flex items-center justify-center">
                        <span className="text-4xl">🎴</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deck Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition line-clamp-1">
                        {deck.name}
                      </h3>
                      <p className="text-sm text-purple-300 font-semibold">{deck.commander}</p>
                    </div>
                    {deck.popularity && (
                      <div className="flex items-center gap-1 ml-2">
                        <span className="text-lg">⭐</span>
                        <span className="text-xs text-slate-300 font-semibold">{deck.popularity}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Cards:</span>
                      <span className="font-semibold text-white">{deck.cardCount}</span>
                    </div>
                    {deck.format && (
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-xs font-semibold text-purple-300">
                          {deck.format}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View Button */}
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600/50 to-blue-600/50 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg text-sm font-semibold transition-all">
                    View Details
                  </button>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
              </Link>
            ))}
          </div>
        )}

        {/* Empty State with CTA */}
        {!loading && decks.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">
              {filteredDecks.length} of {decks.length} decks shown
            </p>
            <p className="text-slate-500 text-sm">
              Want to create your own deck?{' '}
              <Link href="/builder" className="text-purple-400 hover:text-purple-300">
                Start building now
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

