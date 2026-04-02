'use client'

import Link from 'next/link'
import { CardImage } from '@/components/CardImage'
import { CardGrid } from '@/components/CardGrid'
import { StatsGrid } from '@/components/StatsBar'
import { TrendingSection } from '@/components/TrendingSection'

// Mock data - will be replaced with real data from API
const MOCK_CARDS = [
  {
    id: '1',
    name: 'Sol Ring',
    imageUrl: 'https://images.scryfall.io/cards/large/front/e/6/e6211e3e-8494-40ba-b149-eb89e618e1d2.jpg?1699395241',
    manaValue: 1,
    colors: 'C',
    type: 'Artifact',
    stats: { popularity: 89, synergies: 234, decks: 5421 },
  },
  {
    id: '2',
    name: 'Lightning Bolt',
    imageUrl: 'https://images.scryfall.io/cards/large/front/c/e/ce711943-c1a1-43a0-8b97-8a547503537f.jpg?1601077628',
    manaValue: 1,
    colors: 'R',
    type: 'Instant',
    stats: { popularity: 94, synergies: 187, decks: 3201 },
  },
  {
    id: '3',
    name: 'Counterspell',
    imageUrl: 'https://images.scryfall.io/cards/large/front/1/9/1920dae4-fb92-412f-b8f9-4eca114b06ec.jpg?1599769051',
    manaValue: 2,
    colors: 'U',
    type: 'Instant',
    stats: { popularity: 88, synergies: 156, decks: 2890 },
  },
  {
    id: '4',
    name: 'Demonic Tutor',
    imageUrl: 'https://images.scryfall.io/cards/large/front/3/b/3bdbc3c9-8a89-4f0a-961b-6ad563ce98c2.jpg?1599765488',
    manaValue: 2,
    colors: 'B',
    type: 'Instant',
    stats: { popularity: 92, synergies: 201, decks: 4156 },
  },
  {
    id: '5',
    name: 'Green Sun\'s Zenith',
    imageUrl: 'https://images.scryfall.io/cards/large/front/0/1/01794178-cf41-454c-ac37-1d8b3e638378.jpg?1580014961',
    manaValue: 2,
    colors: 'G',
    type: 'Instant',
    stats: { popularity: 85, synergies: 198, decks: 3845 },
  },
  {
    id: '6',
    name: 'Swords to Plowshares',
    imageUrl: 'https://images.scryfall.io/cards/large/front/b/e/be2b4177-e47c-4dde-9322-b9876749c6e6.jpg?1611967006',
    manaValue: 1,
    colors: 'W',
    type: 'Instant',
    stats: { popularity: 91, synergies: 167, decks: 2945 },
  },
]

const TRENDING_DECKS = [
  {
    id: '1',
    name: 'Atraxa Infect',
    commander: 'Atraxa, Praetors\' Voice',
    format: 'Commander',
    decks: 1234,
  },
  {
    id: '2',
    name: 'Prosper Rakdos',
    commander: 'Prosper, Tomb-Bound',
    format: 'Commander',
    decks: 987,
  },
  {
    id: '3',
    name: 'Muldrotha Control',
    commander: 'Muldrotha, the Graywolf',
    format: 'Commander',
    decks: 876,
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20 blur-3xl -z-10" />

          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-100 mb-6 leading-tight">
              Discover Your Next
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                {' '}MTG Deck
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Explore trending decks, powerful cards, and statistics to build your perfect Magic: The Gathering collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cards"
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/50"
              >
                Explore Cards
              </Link>
              <Link
                href="/decks"
                className="px-8 py-3 border border-purple-400 text-purple-300 hover:bg-purple-600/20 font-semibold rounded-lg transition"
              >
                Browse Decks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-900/50 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <StatsGrid
            stats={[
              { label: 'Total Cards', value: '28,000+', icon: '🎴' },
              { label: 'Active Decks', value: '45,000+', icon: '📦' },
              { label: 'Formats', value: '7', icon: '⚔️' },
              { label: 'Community', value: '50K+', icon: '👥' },
            ]}
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Trending Cards */}
          <TrendingSection
            title="🔥 Trending Cards"
            description="Most popular cards in competitive decks this week"
            href="/cards?sort=trending"
          >
            <CardGrid columns={5}>
              {MOCK_CARDS.map((card) => (
                <Link key={card.id} href={`/cards/${card.id}`}>
                  <CardImage {...card} />
                </Link>
              ))}
            </CardGrid>
          </TrendingSection>

          {/* Top Decks */}
          <TrendingSection
            title="🏆 Top Decks"
            description="Most popular Commander decks right now"
            href="/decks?sort=popular"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TRENDING_DECKS.map((deck) => (
                <Link key={deck.id} href={`/decks/${deck.id}`}>
                  <div className="p-5 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-purple-400 rounded-lg transition cursor-pointer group">
                    <h3 className="text-lg font-semibold text-slate-100 group-hover:text-purple-300 mb-2 truncate">
                      {deck.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">{deck.commander}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded-full">
                        {deck.format}
                      </span>
                      <span className="text-xs text-slate-400">{deck.decks} decks</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TrendingSection>

          {/* New Cards */}
          <TrendingSection
            title="✨ Latest Cards"
            description="Recently released and hotly anticipated Magic cards"
            href="/cards?sort=new"
          >
            <CardGrid columns={5}>
              {MOCK_CARDS.slice(0, 5).map((card) => (
                <Link key={card.id} href={`/cards/${card.id}`}>
                  <CardImage {...card} />
                </Link>
              ))}
            </CardGrid>
          </TrendingSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-slate-700">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Start Building Your Deck
          </h2>
          <p className="text-slate-400 mb-8">
            Join our community of Magic players and explore thousands of decks and strategies.
          </p>
          <Link
            href="/auth"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/50 inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </main>
  )
}

