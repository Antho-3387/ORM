'use client'

import Link from 'next/link'
import { use } from 'react'
import { useState } from 'react'

interface DeckDetailsPageProps {
  params: Promise<{ id: string }>
}

// Mock deck details
const DECK_DETAILS: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Atraxa Infect',
    commander: 'Atraxa, Praetors\' Voice',
    description: 'A competitive infect strategy deck with proliferate effects for overwhelming board advantage.',
    format: 'Commander',
    author: 'ProPlayer_123',
    likes: 342,
    views: 12453,
    
    cards: [
      { name: 'Atraxa, Praetors\' Voice', type: 'Creature', quantity: 1, cmc: 4 },
      { name: 'Sol Ring', type: 'Artifact', quantity: 1, cmc: 1 },
      { name: 'Counterspell', type: 'Instant', quantity: 1, cmc: 2 },
      { name: 'Swords to Plowshares', type: 'Instant', quantity: 1, cmc: 1 },
      { name: 'Green Sun\'s Zenith', type: 'Instant', quantity: 1, cmc: 2 },
      { name: 'Doubling Season', type: 'Enchantment', quantity: 1, cmc: 5 },
      { name: 'Proliferate', type: 'Sorcery', quantity: 1, cmc: 3 },
      { name: 'Parallel Lives', type: 'Enchantment', quantity: 1, cmc: 4 },
      { name: 'Rings of Brighthearth', type: 'Artifact', quantity: 1, cmc: 3 },
      { name: 'Swamp', type: 'Land', quantity: 8, cmc: 0 },
      { name: 'Forest', type: 'Land', quantity: 8, cmc: 0 },
      { name: 'Island', type: 'Land', quantity: 8, cmc: 0 },
      { name: 'Plains', type: 'Land', quantity: 8, cmc: 0 },
    ],

    tags: ['Competitive', 'Infect', 'Control', 'Proliferate'],
  },
  '2': {
    id: '2',
    name: 'Prosper Rakdos',
    commander: 'Prosper, Tomb-Bound',
    description: 'Fast paced treasure generation and sacrifice strategy.',
    format: 'Commander',
    author: 'TreasureHunter',
    likes: 278,
    views: 9832,
    cards: [
      { name: 'Prosper, Tomb-Bound', type: 'Creature', quantity: 1, cmc: 3 },
      { name: 'Sol Ring', type: 'Artifact', quantity: 1, cmc: 1 },
      { name: 'Treasure Map', type: 'Artifact', quantity: 1, cmc: 3 },
      { name: 'Dockside Extortionist', type: 'Creature', quantity: 1, cmc: 2 },
    ],
    tags: ['Treasure', 'Sacrifice', 'Fast Paced'],
  },
}

const typeIcons: Record<string, string> = {
  'Creature': '👹',
  'Instant': '⚡',
  'Sorcery': '📜',
  'Enchantment': '✨',
  'Artifact': '⚙️',
  'Land': '🏜️',
  'Planeswalker': '👤',
  'default': '🃏',
}

export default function DeckDetailsPage({ params }: DeckDetailsPageProps) {
  const { id } = use(params)
  const deck = DECK_DETAILS[id] || DECK_DETAILS['1']
  const [sortBy, setSortBy] = useState('type')

  const sortedCards = [...deck.cards].sort((a, b) => {
    if (sortBy === 'cmc') return a.cmc - b.cmc
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return a.type.localeCompare(b.type)
  })

  const totalCards = deck.cards.reduce((sum: number, card: any) => sum + card.quantity, 0)

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="container-clean py-6">
          <Link href="/decks" className="text-indigo-600 text-sm font-medium hover:text-indigo-700 mb-4 block">
            ← Back to Decks
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{deck.name}</h1>
              <p className="text-gray-600 mb-3">Commander: <span className="font-semibold">{deck.commander}</span></p>
              <p className="text-gray-600 text-sm max-w-2xl">{deck.description}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <Link
                href={`/decks/${id}/edit`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition whitespace-nowrap"
              >
                Edit Deck
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container-clean py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Deck List */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Deck List</h2>
                  <p className="text-sm text-gray-500 mt-1">{totalCards} cards total</p>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="type">Sort by Type</option>
                  <option value="cmc">Sort by Mana Cost</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>

              {/* Cards Table */}
              <div className="divide-y divide-gray-200">
                {sortedCards.map((card, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between hover:bg-gray-50 px-3 -mx-3">
                    <div className="flex items-center gap-3 flex-grow">
                      <span className="text-2xl">{typeIcons[card.type] || typeIcons.default}</span>
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-900">{card.name}</p>
                        <p className="text-xs text-gray-500">{card.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">CMC</p>
                        <p className="font-bold text-gray-900">{card.cmc}</p>
                      </div>
                      <div className="text-right min-w-[40px]">
                        <p className="text-sm text-gray-500">Qty</p>
                        <p className="font-bold text-gray-900 text-lg">{card.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Deck Stats</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">TOTAL CARDS</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCards}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">FORMAT</p>
                  <p className="font-bold text-gray-900">{deck.format}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">AUTHOR</p>
                  <p className="font-bold text-gray-900">{deck.author}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {deck.tags && deck.tags.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {deck.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition text-sm">
                👁️ {deck.views} views
              </button>
              <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition text-sm">
                ❤️ {deck.likes} likes
              </button>
              <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition text-sm">
                📋 Copy Deck
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
