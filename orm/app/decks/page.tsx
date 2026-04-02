'use client'

import Link from 'next/link'
import { StatsGrid } from '@/components/StatsBar'

// Mock decks data
const MOCK_DECKS = [
  {
    id: '1',
    name: 'Atraxa Infect',
    commander: 'Atraxa, Praetors\' Voice',
    description: 'A competitive infect strategy deck.',
    format: 'Commander',
    decks: 1234,
    manaVal: 4.2,
    colors: 'WUBG',
  },
  {
    id: '2',
    name: 'Prosper Rakdos',
    commander: 'Prosper, Tomb-Bound',
    description: 'Fast paced treasure generation.',
    format: 'Commander',
    decks: 987,
    manaVal: 3.8,
    colors: 'RB',
  },
  {
    id: '3',
    name: 'Muldrotha Control',
    commander: 'Muldrotha, the Graywolf',
    description: 'Recursive control with card advantage.',
    format: 'Commander',
    decks: 876,
    manaVal: 5.1,
    colors: 'UBG',
  },
  {
    id: '4',
    name: 'Narset Spellslinger',
    commander: 'Narset, Enlightened Master',
    description: 'Casting extra turns and combat phases.',
    format: 'Commander',
    decks: 745,
    manaVal: 4.5,
    colors: 'UWR',
  },
  {
    id: '5',
    name: 'Yuriko Turns',
    commander: 'Yuriko, the Tiger\'s Shadow',
    description: 'Evasive ninja tempo deck.',
    format: 'Commander',
    decks: 654,
    manaVal: 3.2,
    colors: 'UB',
  },
  {
    id: '6',
    name: 'Kess Consulting',
    commander: 'Kess, Dissident Mage',
    description: 'Spell-heavy control list.',
    format: 'Commander',
    decks: 532,
    manaVal: 4.8,
    colors: 'UBR',
  },
]

const getColorBg = (colors: string) => {
  if (colors === 'WUBG') return 'from-yellow-500 to-blue-500'
  if (colors === 'RB') return 'from-red-500 to-gray-800'
  if (colors === 'UBG') return 'from-blue-500 to-green-600'
  if (colors === 'UWR') return 'from-blue-500 to-red-500'
  if (colors === 'UB') return 'from-blue-500 to-gray-800'
  if (colors === 'UBR') return 'from-blue-500 to-red-500'
  return 'from-purple-500 to-blue-500'
}

export default function DecksPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            Popular Decks
          </h1>
          <p className="text-lg text-slate-400 mb-8">
            Explore the most popular Magic decks built by our community
          </p>

          {/* Stats */}
          <StatsGrid
            stats={[
              { label: 'Total Decks', value: '45K+', icon: '📦' },
              { label: 'Avg Cards', value: '99.2', icon: '🎴' },
              { label: 'Popular Format', value: 'Commander', icon: '⚔️' },
              { label: 'Top Synergies', value: '234', icon: '🔗' },
            ]}
          />
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg transition text-sm font-medium">
            All Formats
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-sm font-medium">
            Commander
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-sm font-medium">
            Modern
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-sm font-medium">
            Pioneer
          </button>
        </div>

        {/* Decks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_DECKS.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`}>
              <div className="h-full bg-slate-900 border border-slate-700 hover:border-purple-400 rounded-lg overflow-hidden transition-all hover:shadow-xl hover:shadow-purple-500/20 group">
                {/* Color Header */}
                <div className={`h-2 bg-gradient-to-r ${getColorBg(deck.colors)}`} />

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-purple-300 transition mb-1">
                    {deck.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">Commander: {deck.commander}</p>

                  {/* Description */}
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {deck.description}
                  </p>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-800 rounded p-2 text-center">
                      <p className="text-xs text-slate-400">Decks</p>
                      <p className="text-sm font-semibold text-slate-100">{deck.decks}</p>
                    </div>
                    <div className="bg-slate-800 rounded p-2 text-center">
                      <p className="text-xs text-slate-400">Format</p>
                      <p className="text-sm font-semibold text-slate-100">{deck.format}</p>
                    </div>
                    <div className="bg-slate-800 rounded p-2 text-center">
                      <p className="text-xs text-slate-400">Avg CMC</p>
                      <p className="text-sm font-semibold text-slate-100">{deck.manaVal}</p>
                    </div>
                  </div>

                  {/* View Button */}
                  <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium text-sm">
                    View Deck →
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-medium">
            Load More Decks
          </button>
        </div>
      </div>
    </main>
  )
}

