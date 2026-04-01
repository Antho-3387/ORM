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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Decks</h1>
            <p className="text-gray-600">Manage your Magic deck collection</p>
          </div>
          <Link
            href="/decks/create"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            + Create Deck
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-4">
          <input
            type="text"
            placeholder="Search decks..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Decks Grid */}
        {loading ? (
          <p className="text-gray-600">Loading decks...</p>
        ) : decks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">🎴</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Decks Yet</h3>
            <p className="text-gray-600 mb-6">Create your first deck to get started</p>
            <Link
              href="/decks/create"
              className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Create First Deck
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition h-full flex flex-col">
                  {/* Card preview or placeholder */}
                  <div className="h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-b border-gray-200">
                    <div className="text-5xl">🂡</div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{deck.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                      {deck.description || 'No description'}
                    </p>

                    {/* Stats */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">
                        <strong>{deck.cards?.reduce((s, c) => s + c.quantity, 0) || 0}</strong> cards
                      </span>
                      <span className="text-blue-600 hover:text-blue-700 font-semibold text-sm">View →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

