'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface Card {
  id: string
  name: string
  type?: string
  imageUrl?: string
  quantity: number
}

interface Deck {
  id: string
  name: string
  description?: string
  cards?: Array<{
    card: { id: string; name: string; type?: string; imageUrl?: string }
    quantity: number
  }>
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    // Fetch decks from API
    fetch('/api/decks', {
      headers: {
        'x-user-id': user?.id || '',
      },
    })
      .then(res => res.json())
      .then(data => {
        setDecks(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error('Error fetching decks:', err)
        setDecks([])
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, user?.id, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950 w-full">
      <div className="w-full mx-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-cyan-400 mb-4">🔍 Rechercher</h1>
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Nom du deck"
                className="flex-1 bg-gray-900 border border-cyan-400/50 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
              />
              <button className="bg-cyan-500 hover:bg-cyan-600 text-black px-6 py-2 rounded font-bold">
                Réinitialiser
              </button>
              <Link
                href="/decks/create"
                className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded font-bold"
              >
                Ajouter Deck
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border-l-4 border-cyan-400 p-4">
              <div className="text-3xl font-bold text-cyan-400">{decks.length}</div>
              <div className="text-gray-400 text-sm">Decks Totals</div>
            </div>
            <div className="bg-gray-900 border-l-4 border-cyan-400 p-4">
              <div className="text-3xl font-bold text-cyan-400">{decks.reduce((sum, d) => sum + (d.cards?.reduce((s, c) => s + c.quantity, 0) || 0), 0)}</div>
              <div className="text-gray-400 text-sm">Cartes totals</div>
            </div>
            <div className="bg-gray-900 border-l-4 border-cyan-400 p-4">
              <div className="text-3xl font-bold text-cyan-400">55.0</div>
              <div className="text-gray-400 text-sm">Avg cartes/deck</div>
            </div>
            <div className="bg-gray-900 border-l-4 border-cyan-400 p-4">
              <div className="text-3xl font-bold text-cyan-400">0m</div>
              <div className="text-gray-400 text-sm">Dernière MAJ</div>
            </div>
          </div>

          {/* Decks List */}
          {loading ? (
            <p className="text-gray-400">Loading decks...</p>
          ) : decks.length === 0 ? (
            <div className="bg-gray-900 border border-cyan-400/30 rounded p-8 text-center">
              <p className="text-gray-400 mb-4">No decks yet. Create your first deck!</p>
              <Link href="/decks/create" className="inline-block bg-cyan-500 hover:bg-cyan-600 text-black px-6 py-2 rounded font-bold">
                Create Deck
              </Link>
            </div>
          ) : (
            <div className="bg-gray-900 border border-cyan-400/30 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-4 flex justify-between items-center">
                <h2 className="text-white font-bold text-lg">✨ Vos Decks</h2>
                <span className="bg-cyan-400 text-black px-3 py-1 rounded-full text-sm font-bold">{decks.length} decks</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {decks.map((deck) => (
                  <Link key={deck.id} href={`/decks/${deck.id}`}>
                    <div className="bg-gray-800 border border-cyan-400/30 rounded-lg p-4 hover:border-cyan-400/70 transition cursor-pointer h-full">
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-purple-600/50 text-cyan-300 px-2 py-1 rounded text-xs font-bold">DECKTYPE</div>
                      </div>
                      <h3 className="text-cyan-400 font-bold text-lg mb-2">{deck.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{deck.description || 'Sans description'}</p>
                      <div className="mb-3">
                        <span className="inline-block bg-red-600/30 text-red-400 px-2 py-1 rounded text-xs font-bold">
                          {deck.cards?.reduce((s, c) => s + c.quantity, 0) || 0} cartes
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm mb-4">Commandant: --</div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-bold">
                          ✏️ Éditer
                        </button>
                        <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-bold">
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

