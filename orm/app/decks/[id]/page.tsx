'use client'

import Link from 'next/link'
import { use } from 'react'
import { CardImage } from '@/components/CardImage'
import { CardGrid } from '@/components/CardGrid'
import { StatsGrid } from '@/components/StatsBar'

interface DeckDetailsPageProps {
  params: Promise<{ id: string }>
}

// Mock deck details
const DECK_DETAILS: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Atraxa Infect',
    commander: 'Atraxa, Praetors\' Voice',
    description: 'A competitive infect strategy deck.',
    format: 'Commander',
    author: 'ProPlayer_123',
    likes: 342,
    views: 12453,
    
    stats: {
      totalCards: 99,
      landCount: 32,
      avgManaValue: 3.2,
      colors: 'WUBG',
    },

    manaDistribution: [
      { mana: 0, count: 2 },
      { mana: 1, count: 12 },
      { mana: 2, count: 18 },
      { mana: 3, count: 15 },
      { mana: 4, count: 12 },
      { mana: 5, count: 8 },
      { mana: 6, count: 5 },
      { mana: 7, count: 3 },
      { mana: 8, count: 2 },
      { mana: 9, count: 1 },
    ],

    colorDistribution: {
      W: 15,
      U: 14,
      B: 0,
      R: 0,
      G: 18,
      C: 2,
    },

    cards: [
      { name: 'Atraxa, Praetors\' Voice', quantity: 1, imageUrl: 'https://images.scryfall.io/cards/large/front/4/8/483c1fd8-37b4-43ac-9f60-979319ba33a8.jpg?1599768957' },
      { name: 'Sol Ring', quantity: 1, imageUrl: 'https://images.scryfall.io/cards/large/front/e/6/e6211e3e-8494-40ba-b149-eb89e618e1d2.jpg?1699395241' },
      { name: 'Counterspell', quantity: 1, imageUrl: 'https://images.scryfall.io/cards/large/front/1/9/1920dae4-fb92-412f-b8f9-4eca114b06ec.jpg?1599769051' },
      { name: 'Swords to Plowshares', quantity: 1, imageUrl: 'https://images.scryfall.io/cards/large/front/b/e/be2b4177-e47c-4dde-9322-b9876749c6e6.jpg?1611967006' },
      { name: 'Green Sun\'s Zenith', quantity: 1, imageUrl: 'https://images.scryfall.io/cards/large/front/0/1/01794178-cf41-454c-ac37-1d8b3e638378.jpg?1580014961' },
    ],

    synergies: [
      { name: 'Doubling Season', count: 234 },
      { name: 'Proliferate', count: 187 },
      { name: 'Counterspell', count: 156 },
      { name: 'Parallel Lives', count: 145 },
      { name: 'Rings of Brighthearth', count: 123 },
    ],

    tags: ['Competitive', 'Infect', 'Control', 'Proliferate'],
  },
}

export default function DeckDetailsPage({ params }: DeckDetailsPageProps) {
  const { id } = use(params)
  const deck = DECK_DETAILS[id] || DECK_DETAILS['1']

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/decks" className="text-purple-400 hover:text-purple-300 transition">
            ← Back to Decks
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-2">
            {deck.name}
          </h1>
          <p className="text-lg text-slate-400 mb-4">
            Commander: <span className="text-purple-300 font-semibold">{deck.commander}</span>
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {deck.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-slate-400">{deck.description}</p>
        </div>

        {/* Stats */}
        <StatsGrid
          stats={[
            { label: 'Total Cards', value: deck.stats.totalCards, icon: '🎴' },
            { label: 'Land Count', value: deck.stats.landCount, icon: '🏜️' },
            { label: 'Avg Mana Value', value: deck.stats.avgManaValue, icon: '💎' },
            { label: 'Views', value: `${deck.views.toLocaleString()}`, icon: '👁️' },
          ]}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Deck List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-slate-100 mb-6">Deck List</h2>
              
              {/* Featured Cards Grid */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Featured Cards</h3>
                <CardGrid columns={5}>
                  {deck.cards.map((card, idx) => (
                    <CardImage
                      key={idx}
                      id={`${idx}`}
                      name={card.name}
                      imageUrl={card.imageUrl}
                    />
                  ))}
                </CardGrid>
              </div>

              {/* Mana Curve */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Mana Curve</h3>
                <div className="flex items-end gap-1 h-48 bg-slate-800 p-4 rounded-lg">
                  {deck.manaDistribution.map((dist, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all hover:from-purple-600 hover:to-purple-500 group relative"
                      style={{
                        height: `${(dist.count / 20) * 100}%`,
                        minHeight: '4px',
                      }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 px-2 py-1 rounded text-xs text-slate-100 whitespace-nowrap">
                        {dist.mana}: {dist.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Distribution */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Color Distribution</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-400 mb-1">White</p>
                    <p className="text-2xl font-bold text-yellow-300">{deck.colorDistribution.W}</p>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-400 mb-1">Blue</p>
                    <p className="text-2xl font-bold text-blue-300">{deck.colorDistribution.U}</p>
                  </div>
                  <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-400 mb-1">Green</p>
                    <p className="text-2xl font-bold text-green-300">{deck.colorDistribution.G}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Deck Info */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Deck Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase text-slate-400 mb-1">Format</p>
                  <p className="text-slate-100">{deck.format}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 mb-1">Author</p>
                  <p className="text-slate-100">{deck.author}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 mb-1">Likes</p>
                  <p className="text-slate-100">❤️ {deck.likes}</p>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium">
                ❤️ Like Deck
              </button>
            </div>

            {/* Top Synergies */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">🔗 Top Synergies</h3>
              <div className="space-y-2">
                {deck.synergies.map((synergy, idx) => (
                  <Link
                    key={idx}
                    href={`/cards?search=${synergy.name}`}
                    className="flex items-center justify-between p-2 bg-slate-800 hover:bg-slate-700 rounded transition group"
                  >
                    <span className="text-xs text-slate-300 group-hover:text-purple-300">
                      {synergy.name}
                    </span>
                    <span className="text-xs text-slate-500">{synergy.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-medium text-sm">
                📥 Download Deck
              </button>
              <button className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-medium text-sm">
                🔗 Share Deck
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Cards</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {deck.cards.map((dc, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                  {dc.card.imageUrl ? (
                    <div className="relative aspect-video bg-gray-100">
                      <img
                        src={dc.card.imageUrl}
                        alt={dc.card.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                        ×{dc.quantity}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center">
                      <span className="text-2xl mb-1">🂡</span>
                      <span className="text-xs font-bold text-gray-900">×{dc.quantity}</span>
                    </div>
                  )}
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{dc.card.name}</h4>
                    <p className="text-xs text-gray-600 truncate">{dc.card.type || 'Unknown'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No cards in this deck</p>
          </div>
        )}
      </div>
    </div>
  )
}
