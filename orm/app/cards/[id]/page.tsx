'use client'

import Image from 'next/image'
import Link from 'next/link'
import { use } from 'react'

interface CardDetailsPageProps {
  params: Promise<{ id: string }>
}

// Mock data - will be replaced with real Scryfall data
const CARD_DETAILS: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Sol Ring',
    imageUrl: 'https://images.scryfall.io/cards/large/front/e/6/e6211e3e-8494-40ba-b149-eb89e618e1d2.jpg?1699395241',
    manaValue: 1,
    colors: '',
    type: 'Artifact',
    rarity: 'Uncommon',
    setCode: 'MIR',
    legalFormats: {
      Commander: true,
      Modern: false,
      Standard: false,
      Pioneer: false,
      Vintage: true,
    },
    stats: {
      popularity: 89,
      synergies: 234,
      decks: 5421,
      deckPercentage: 18.5,
    },
    description: 'Tap: Add CC to your mana pool.',
    text: 'Tap: Add {C}{C} to your mana pool.',
    power: null,
    toughness: null,
    synergiesTop: [
      { name: 'Dark Ritual', decks: 2341 },
      { name: 'Mana Crypt', decks: 2105 },
      { name: 'Mox Diamond', decks: 1876 },
      { name: 'Black Lotus', decks: 1654 },
      { name: 'Mana Vault', decks: 1432 },
    ],
  },
  '2': {
    id: '2',
    name: 'Lightning Bolt',
    imageUrl: 'https://images.scryfall.io/cards/large/front/c/e/ce711943-c1a1-43a0-8b97-8a547503537f.jpg?1601077628',
    manaValue: 1,
    colors: 'R',
    type: 'Instant',
    rarity: 'Common',
    setCode: 'A25',
    legalFormats: {
      Commander: true,
      Modern: true,
      Standard: false,
      Pioneer: true,
      Vintage: true,
    },
    stats: {
      popularity: 94,
      synergies: 187,
      decks: 3201,
      deckPercentage: 10.9,
    },
    description: 'Lightning Bolt deals 3 damage to any target.',
    text: 'Lightning Bolt deals 3 damage to any target.',
    power: null,
    toughness: null,
    synergiesTop: [
      { name: 'Chain Lightning', decks: 1867 },
      { name: 'Unholy Heat', decks: 1654 },
      { name: 'Murktide', decks: 1543 },
      { name: 'Fury', decks: 1432 },
      { name: 'Subtlety', decks: 1298 },
    ],
  },
}

export default function CardDetailsPage({ params }: CardDetailsPageProps) {
  const { id } = use(params)
  const card = CARD_DETAILS[id] || CARD_DETAILS['1']

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/cards" className="text-purple-400 hover:text-purple-300 transition">
            ← Back to Cards
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Image & Description */}
          <div className="lg:col-span-1">
            {/* Card Image */}
            <div className="relative w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-600 mb-6 shadow-lg">
              <div className="relative w-full h-96">
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Card Info */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 space-y-4">
              <div>
                <p className="text-xs uppercase text-slate-400 mb-1">Mana Value</p>
                <p className="text-2xl font-bold text-slate-100">{card.manaValue}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-400 mb-1">Rarity</p>
                <p className="text-slate-100">{card.rarity}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-400 mb-1">Set</p>
                <p className="text-slate-100">{card.setCode}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-400 mb-2">Legal Formats</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(card.legalFormats).map(([format, legal]) => (
                    <span
                      key={format}
                      className={`text-xs px-2 py-1 rounded ${
                        legal
                          ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                          : 'bg-red-600/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card Details & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-2">
                {card.name}
              </h1>
              <p className="text-slate-400">{card.type}</p>
            </div>

            {/* Card Text */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
              <h3 className="text-sm uppercase font-semibold text-slate-300 mb-3">
                Card Text
              </h3>
              <p className="text-slate-200 text-base leading-relaxed">
                {card.text}
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-5">
                <p className="text-slate-400 text-sm mb-2">Popularity</p>
                <p className="text-3xl font-bold text-purple-300">{card.stats.popularity}%</p>
                <p className="text-xs text-slate-500 mt-1">In {card.stats.decks.toLocaleString()} decks</p>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-5">
                <p className="text-slate-400 text-sm mb-2">Synergies</p>
                <p className="text-3xl font-bold text-blue-300">{card.stats.synergies}</p>
                <p className="text-xs text-slate-500 mt-1">Synergetic cards found</p>
              </div>

              <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-5">
                <p className="text-slate-400 text-sm mb-2">Format Rate</p>
                <p className="text-3xl font-bold text-green-300">
                  {card.stats.deckPercentage}%
                </p>
                <p className="text-xs text-slate-500 mt-1">Of all decks</p>
              </div>
            </div>

            {/* Top Synergies */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">
                🔗 Top Synergies
              </h3>
              <div className="space-y-3">
                {card.synergiesTop.map((synergy: any, idx: number) => (
                  <Link
                    key={idx}
                    href={`/cards?search=${synergy.name}`}
                    className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition group"
                  >
                    <span className="text-slate-200 group-hover:text-purple-300 transition">
                      {synergy.name}
                    </span>
                    <span className="text-xs text-slate-400">{synergy.decks} decks</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Similar Cards CTA */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Find Similar Cards
              </h3>
              <p className="text-slate-400 mb-4">
                Discover more cards that work well with {card.name}
              </p>
              <Link
                href={`/cards?search=${card.name}`}
                className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}