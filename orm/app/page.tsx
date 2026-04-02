'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PremiumNavbar } from '@/components/PremiumNavbar'

interface ScryfallCard {
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

interface Deck {
  id: string
  name: string
  commander: string
  cardCount: number
  cards: Array<{
    id: string
    image?: string
  }>
}

export default function HomePage() {
  const [popularCards, setPopularCards] = useState<ScryfallCard[]>([])
  const [trendingDecks, setTrendingDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch popular Magic cards
  const fetchPopularCards = async () => {
    try {
      const response = await fetch('https://api.scryfall.com/cards/search?q=is:iconic&order=edhrec&unique=cards')
      if (response.ok) {
        const data = await response.json()
        setPopularCards(data.data?.slice(0, 6) || [])
      }
    } catch (error) {
      console.error('Error fetching popular cards:', error)
    }
  }

  // Fetch trending decks (simulated with popular commanders)
  const fetchTrendingDecks = async () => {
    try {
      const commanders = ['Cpt. Jhoira', 'Atraxa', 'The First Sliver', 'Ur-Dragon', 'Omnath']
      const deckPromises = commanders.map(async (commander) => {
        const response = await fetch(
          `https://api.scryfall.com/cards/search?q=%21"${commander}"&unique=cards`
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
          }
        }
        return null
      })

      const decks = (await Promise.all(deckPromises)).filter(Boolean) as Deck[]
      setTrendingDecks(decks)
    } catch (error) {
      console.error('Error fetching decks:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchPopularCards(), fetchTrendingDecks()])
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
      <PremiumNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Gradient Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        </div>

        <div className="container-clean">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                ✨ Build Your Perfect Deck
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Master the Multiverse
            </h1>

            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto">
              Explore, build, and optimize Magic: The Gathering decks with real-time card search, visual deck building, and powerful analytics.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/builder"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              >
                Start Building
              </Link>
              <Link
                href="/decks"
                className="px-8 py-3 border-2 border-slate-600 hover:border-purple-500 text-white font-bold rounded-lg transition-all hover:bg-purple-500/10"
              >
                Explore Decks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Decks Section */}
      <section className="py-20">
        <div className="container-clean">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Trending Decks</h2>
            <p className="text-slate-400">Popular deck archetypes in the community</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 glass rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingDecks.map((deck) => (
                <Link
                  key={deck.id}
                  href={`/decks/${deck.id}`}
                  className="group glass rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20"
                >
                  {/* Deck Card Images */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="grid grid-cols-3 gap-0.5 p-2">
                      {deck.cards.map((card, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-[2/3] rounded overflow-hidden group/card"
                        >
                          {card.image ? (
                            <img
                              src={card.image}
                              alt="Deck card"
                              className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deck Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition">
                      {deck.name}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">
                        <span className="font-semibold text-slate-300">Commander:</span> {deck.commander}
                      </p>
                      <p className="text-sm text-slate-400">
                        <span className="font-semibold text-slate-300">Cards:</span> {deck.cardCount}
                      </p>
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Cards Gallery */}
      <section className="py-20">
        <div className="container-clean">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Popular Cards</h2>
            <p className="text-slate-400">Most iconic Magic cards</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[2/3] glass rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularCards.map((card) => {
                const image = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || ''

                return (
                  <a
                    key={card.id}
                    href={`https://scryfall.com/card/${card.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-lg overflow-hidden aspect-[2/3] hover:scale-105 transition-transform duration-300"
                  >
                    {image && (
                      <img
                        src={image}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Hover Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-sm font-bold text-white">{card.name}</p>
                      <p className="text-xs text-slate-300">{card.type_line}</p>
                    </div>

                    {/* Glow Effect */}
                    {true && (
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-opacity" />
                    )}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-slate-700/30">
        <div className="container-clean">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Why Choose ORM?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Live Search',
                description: 'Search Scryfall powered by millions of Magic cards with real-time results',
              },
              {
                icon: '🎨',
                title: 'Visual Builder',
                description: 'Build decks with real card images and see your deck come to life instantly',
              },
              {
                icon: '📊',
                title: 'Analytics',
                description: 'Analyze mana curves, color distribution, and deck statistics at a glance',
              },
            ].map((feature, idx) => (
              <div key={idx} className="glass rounded-xl p-6 hover:border-purple-500/30 transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-clean">
          <div className="glass rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Build Your Deck?</h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Start building your ultimate Magic deck today with our powerful deck builder and Scryfall integration.
            </p>

            <Link
              href="/builder"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            >
              Start Building Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/30 py-12">
        <div className="container-clean">
          <div className="text-center text-slate-400">
            <p className="mb-2">ORM - Magic: The Gathering Deck Builder</p>
            <p className="text-xs">
              Magic: The Gathering is © Wizards of the Coast. Card data from{' '}
              <a href="https://scryfall.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                Scryfall
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

