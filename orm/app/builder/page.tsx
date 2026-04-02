'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CardSearch, type ScryfallCard } from '@/components/CardSearch'

interface DeckCard {
  card: ScryfallCard
  quantity: number
}

export default function DeckBuilderPage() {
  const [deckName, setDeckName] = useState('')
  const [commander, setCommander] = useState<ScryfallCard | null>(null)
  const [deckCards, setDeckCards] = useState<DeckCard[]>([])
  const [sortBy, setSortBy] = useState<'type' | 'cmc' | 'name'>('cmc')

  const handleAddCard = (card: ScryfallCard) => {
    setDeckCards((prev) => {
      const existing = prev.find((dc) => dc.card.id === card.id)

      if (existing) {
        // Limit to 4 copies (or 1 for legends)
        const maxCopies = card.type_line?.includes('Legendary') ? 1 : 4
        if (existing.quantity < maxCopies) {
          return prev.map((dc) =>
            dc.card.id === card.id ? { ...dc, quantity: dc.quantity + 1 } : dc
          )
        }
        return prev
      }

      return [...prev, { card, quantity: 1 }]
    })
  }

  const handleRemoveCard = (cardId: string) => {
    setDeckCards((prev) => prev.filter((dc) => dc.card.id !== cardId))
  }

  const handleUpdateQuantity = (cardId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCard(cardId)
    } else {
      setDeckCards((prev) =>
        prev.map((dc) =>
          dc.card.id === cardId ? { ...dc, quantity } : dc
        )
      )
    }
  }

  const sortedCards = useMemo(() => {
    return [...deckCards].sort((a, b) => {
      if (sortBy === 'cmc') {
        return (a.card.cmc || 0) - (b.card.cmc || 0)
      } else if (sortBy === 'name') {
        return a.card.name.localeCompare(b.card.name)
      }
      return a.card.type_line.localeCompare(b.card.type_line)
    })
  }, [deckCards, sortBy])

  const totalCards = deckCards.reduce((sum, dc) => sum + dc.quantity, 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/30 sticky top-16 z-40 backdrop-blur bg-slate-900/50">
        <div className="container-clean py-4">
          <Link href="/" className="text-slate-400 hover:text-slate-200 text-sm font-medium transition">
            ← Back
          </Link>
        </div>
      </div>

      <div className="container-clean py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Search & Add Cards */}
          <div className="lg:col-span-2">
            <div className="glass rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Search Cards</h2>

              {/* Commander Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Commander
                </label>
                <div className="relative">
                  <CardSearch
                    onSelect={(card) => {
                      setCommander(card)
                      if (!deckName) {
                        setDeckName(card.name)
                      }
                    }}
                    placeholder="Search for commander..."
                  />
                  {commander && (
                    <div className="absolute -bottom-12 left-0 glass rounded-lg p-3 flex items-center gap-3 z-20">
                      <img
                        src={
                          commander.image_uris?.normal ||
                          commander.card_faces?.[0]?.image_uris?.normal ||
                          ''
                        }
                        alt={commander.name}
                        className="w-8 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{commander.name}</p>
                        <button
                          onClick={() => setCommander(null)}
                          className="text-xs text-slate-400 hover:text-red-400 transition"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Search */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Add Cards
                </label>
                <CardSearch
                  onSelect={handleAddCard}
                  placeholder="Search for cards..."
                />
              </div>
            </div>

            {/* Deck Preview */}
            {deckCards.length > 0 && (
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Deck Cards</h3>
                    <p className="text-sm text-slate-400">{totalCards} cards total</p>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'type' | 'cmc' | 'name')}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-white"
                  >
                    <option value="cmc">Sort by CMC</option>
                    <option value="name">Sort by Name</option>
                    <option value="type">Sort by Type</option>
                  </select>
                </div>

                <div className="divide-y divide-slate-700/30 max-h-96 overflow-y-auto">
                  {sortedCards.map(({ card, quantity }) => {
                    const image = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || ''

                    return (
                      <div
                        key={card.id}
                        className="py-3 flex items-center justify-between hover:bg-slate-800/30 px-3 -mx-3 transition group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {image && (
                            <img
                              src={image}
                              alt={card.name}
                              className="w-8 h-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {card.name}
                            </p>
                            <p className="text-xs text-slate-500">{card.type_line}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-4">
                          <span className="text-sm text-slate-400 min-w-[40px] text-right">
                            CMC: {card.cmc}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-slate-800/50 rounded px-2 py-1">
                            <button
                              onClick={() => handleUpdateQuantity(card.id, quantity - 1)}
                              className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-sm text-slate-300 hover:text-white transition"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-white">
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(card.id, quantity + 1)}
                              className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-sm text-slate-300 hover:text-white transition"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveCard(card.id)}
                            className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition text-xs opacity-0 group-hover:opacity-100"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right - Deck Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-6 sticky top-32">
              {/* Deck Info */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Deck Name
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Untitled Deck"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition text-sm"
                />
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <StatBox label="Total Cards" value={totalCards.toString()} color="purple" />
                <StatBox label="Commander" value={commander?.name || 'None'} color="blue" />
                <StatBox
                  label="Avg CMC"
                  value={
                    deckCards.length > 0
                      ? (
                          deckCards.reduce((sum, dc) => sum + dc.card.cmc * dc.quantity, 0) / totalCards
                        ).toFixed(2)
                      : '0'
                  }
                  color="pink"
                />
              </div>

              {/* Color Distribution */}
              {deckCards.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Colors
                  </p>
                  <div className="flex gap-2">
                    {['W', 'U', 'B', 'R', 'G', 'C'].map((color) => {
                      const count = deckCards.reduce((sum, dc) => {
                        if (color === 'C' && dc.card.color_identity?.length === 0) {
                          return sum + dc.quantity
                        } else if (dc.card.color_identity?.includes(color)) {
                          return sum + dc.quantity
                        }
                        return sum
                      }, 0)

                      const colorEmoji: Record<string, string> = {
                        'W': '⚪',
                        'U': '🔵',
                        'B': '⚫',
                        'R': '🔴',
                        'G': '🟢',
                        'C': '⚒️',
                      }

                      return (
                        <div
                          key={color}
                          className="flex-1 bg-slate-800/50 border border-slate-600/30 rounded p-2 text-center"
                        >
                          <p className="text-lg mb-1">{colorEmoji[color]}</p>
                          <p className="text-xs font-bold text-slate-200">{count}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
disabled={totalCards === 0}>
                  Save Deck
                </button>
                <button className="w-full py-2.5 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-lg transition-all">
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClass = {
    purple: 'bg-purple-500/10 border-purple-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    pink: 'bg-pink-500/10 border-pink-500/20',
  }[color]

  return (
    <div className={`${colorClass} border rounded-lg p-3`}>
      <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
      <p className="text-lg font-bold text-white truncate">{value}</p>
    </div>
  )
}
