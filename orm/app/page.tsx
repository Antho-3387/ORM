'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { MagicCard } from '@/components/MagicCard'

// Popular decks data
const POPULAR_DECKS = [
  {
    id: '1',
    name: 'Atraxa Infect',
    commander: 'Atraxa, Praetors\' Voice',
    image: 'https://images.scryfall.io/cards/large/front/4/8/483c1fd8-37b4-43ac-9f60-979319ba33a8.jpg?1599768957',
  },
  {
    id: '2',
    name: 'Yuriko Turns',
    commander: 'Yuriko, the Tiger\'s Shadow',
    image: 'https://images.scryfall.io/cards/large/front/3/2/323daa1b-e8bc-4f85-9f49-ab1c85c0b451.jpg?1599706203',
  },
  {
    id: '3',
    name: 'Prosper Rakdos',
    commander: 'Prosper, Tomb-Bound',
    image: 'https://images.scryfall.io/cards/large/front/d/7/d7b40c3c-6b61-47b0-b044-b1f45e75eae5.jpg?1582605400',
  },
  {
    id: '4',
    name: 'Muldrotha Control',
    commander: 'Muldrotha, the Graywolf',
    image: 'https://images.scryfall.io/cards/large/front/c/6/c654737d-34ac-42ff-ae27-3a3bbb930fc1.jpg?1591204580',
  },
]

// Popular cards sample
const POPULAR_CARDS = [
  {
    id: 'sol-ring',
    name: 'Sol Ring',
    image: 'https://images.scryfall.io/cards/large/front/e/6/e6211e3e-8494-40ba-b149-eb89e618e1d2.jpg?1699395241',
    manaValue: 1,
    colors: ['C'],
  },
  {
    id: 'counterspell',
    name: 'Counterspell',
    image: 'https://images.scryfall.io/cards/large/front/1/9/1920dae4-fb92-412f-b8f9-4eca114b06ec.jpg?1599769051',
    manaValue: 2,
    colors: ['U'],
  },
  {
    id: 'lightning-bolt',
    name: 'Lightning Bolt',
    image: 'https://images.scryfall.io/cards/large/front/c/e/ce711943-c1a1-43a0-8b97-8a547503537f.jpg?1601077628',
    manaValue: 1,
    colors: ['R'],
  },
  {
    id: 'swords-to-plowshares',
    name: 'Swords to Plowshares',
    image: 'https://images.scryfall.io/cards/large/front/b/e/be2b4177-e47c-4dde-9322-b9876749c6e6.jpg?1611967006',
    manaValue: 1,
    colors: ['W'],
  },
  {
    id: 'demonic-tutor',
    name: 'Demonic Tutor',
    image: 'https://images.scryfall.io/cards/large/front/3/b/3bdbc3c9-8a89-4f0a-961b-6ad563ce98c2.jpg?1599765488',
    manaValue: 2,
    colors: ['B'],
  },
  {
    id: 'green-sun-zenith',
    name: 'Green Sun\'s Zenith',
    image: 'https://images.scryfall.io/cards/large/front/0/1/01794178-cf41-454c-ac37-1d8b3e638378.jpg?1580014961',
    manaValue: 2,
    colors: ['G'],
  },
]

export default function HomePage() {
  const [hoveredDeck, setHoveredDeck] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Gradient Orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        </div>

        <div className="container-clean relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Master the Meta
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Discover powerful Magic decks, search millions of cards, and build your next championship-winning strategy.
            </p>
            <div className="flex gap-4">
              <Link
                href="/builder"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
              >
                Start Building
              </Link>
              <Link
                href="/decks"
                className="px-8 py-3 border border-slate-600 hover:border-purple-400/50 text-slate-300 hover:text-purple-300 font-semibold rounded-lg transition-all hover:bg-purple-500/10"
              >
                Browse Decks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Decks */}
      <section className="py-20 border-t border-slate-700/30">
        <div className="container-clean">
          <h2 className="text-3xl font-bold mb-12">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Popular Decks
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_DECKS.map((deck) => (
              <Link key={deck.id} href={`/deck/${deck.id}`}>
                <div
                  className="group relative overflow-hidden rounded-lg glass glass-hover cursor-pointer"
                  onMouseEnter={() => setHoveredDeck(deck.id)}
                  onMouseLeave={() => setHoveredDeck(null)}
                >
                  {/* Deck Image */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={deck.image}
                      alt={deck.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  </div>

                  {/* Deck Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1">{deck.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{deck.commander}</p>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                      }}
                      className="w-full py-2 bg-purple-600/50 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all border border-purple-500/30"
                    >
                      View Deck
                    </button>
                  </div>

                  {/* Glow on Hover */}
                  {hoveredDeck === deck.id && (
                    <div className="absolute inset-0 rounded-lg shadow-[inset_0_0_30px_rgba(168,85,247,0.2)]" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cards */}
      <section className="py-20 border-t border-slate-700/30">
        <div className="container-clean">
          <h2 className="text-3xl font-bold mb-12">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Staple Cards
            </span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_CARDS.map((card) => (
              <MagicCard
                key={card.id}
                id={card.id}
                name={card.name}
                imageUrl={card.image}
                manaValue={card.manaValue}
                colors={card.colors}
                href={`/card/${card.id}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-700/30">
        <div className="container-clean">
          <div className="glass rounded-2xl p-12 text-center relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 text-white">Ready to build?</h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Use our powerful deck builder to search millions of cards and create your perfect deck in minutes.
              </p>
              <Link
                href="/builder"
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
              >
                Start Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

