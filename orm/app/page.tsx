'use client'

import Link from 'next/link'
import { useState } from 'react'

// Mock decks data
const MOCK_DECKS = [
  {
    id: '1',
    name: 'Atraxa Infect',
    commander: 'Atraxa, Praetors\' Voice',
    description: 'Competitive infect strategy with proliferate effects',
    colors: ['W', 'U', 'B', 'G'],
    cards: 99,
    format: 'Commander',
    popularity: 892,
  },
  {
    id: '2',
    name: 'Prosper Rakdos',
    commander: 'Prosper, Tomb-Bound',
    description: 'Fast paced treasure generation and sacrifice strategy',
    colors: ['R', 'B'],
    cards: 99,
    format: 'Commander',
    popularity: 756,
  },
  {
    id: '3',
    name: 'Muldrotha Control',
    commander: 'Muldrotha, the Graywolf',
    description: 'Recursive control with continuous card advantage',
    colors: ['U', 'B', 'G'],
    cards: 99,
    format: 'Commander',
    popularity: 634,
  },
  {
    id: '4',
    name: 'Narset Spellslinger',
    commander: 'Narset, Enlightened Master',
    description: 'Extra turns and combat phases through spell slinging',
    colors: ['U', 'W', 'R'],
    cards: 99,
    format: 'Commander',
    popularity: 521,
  },
  {
    id: '5',
    name: 'Yuriko Ninja',
    commander: 'Yuriko, the Tiger\'s Shadow',
    description: 'Evasive ninja tempo with ninjutsu mechanics',
    colors: ['U', 'B'],
    cards: 99,
    format: 'Commander',
    popularity: 445,
  },
  {
    id: '6',
    name: 'Kess Consulting',
    commander: 'Kess, Dissident Mage',
    description: 'Spell-heavy control list with card velocity',
    colors: ['U', 'B', 'R'],
    cards: 99,
    format: 'Commander',
    popularity: 389,
  },
]

const colorSymbols: Record<string, string> = {
  'W': '⚪',
  'U': '🔵',
  'B': '⚫',
  'R': '🔴',
  'G': '🟢',
  'C': '⚒️',
}

export default function HomePage() {
  const [selectedFormat, setSelectedFormat] = useState('all')

  const filteredDecks = selectedFormat === 'all' 
    ? MOCK_DECKS 
    : MOCK_DECKS.filter(d => d.format === selectedFormat)

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="container-clean py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🃏 MTG Decks</h1>
              <p className="text-gray-500 text-sm mt-1">Explore and build Magic decks</p>
            </div>
            <Link
              href="/decks/create"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              + Create Deck
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container-clean py-12">
        {/* Filter Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Formats</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedFormat('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedFormat === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Formats
            </button>
            <button
              onClick={() => setSelectedFormat('Commander')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedFormat === 'Commander'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Commander
            </button>
            <button
              onClick={() => setSelectedFormat('Modern')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedFormat === 'Modern'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Modern
            </button>
          </div>
        </div>

        {/* Decks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 transition cursor-pointer h-full flex flex-col">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{deck.name}</h3>
                  <p className="text-sm text-gray-600">{deck.commander}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-2">
                  {deck.description}
                </p>

                {/* Colors */}
                <div className="mb-4 flex gap-2">
                  {deck.colors.map((color) => (
                    <span key={color} className="text-xl">
                      {colorSymbols[color] || color}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium">CARDS</p>
                    <p className="text-lg font-bold text-gray-900">{deck.cards}</p>
                  </div>
                  <div className="text-center border-l border-r border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">FORMAT</p>
                    <p className="text-sm font-bold text-gray-900">{deck.format}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium">VIEWS</p>
                    <p className="text-lg font-bold text-gray-900">{deck.popularity}</p>
                  </div>
                </div>

                {/* Action */}
                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                  View Deck →
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredDecks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No decks found in this format</p>
          </div>
        )}
      </div>
    </main>
  )
}

