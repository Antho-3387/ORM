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
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">My Decks</h1>
            <p className="text-gray-600">Manage your Magic deck collection</p>
          </div>
          <Link
            href="/decks/create"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            + Create Deck
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search decks..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Decks Grid */}
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : decks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No decks yet</p>
            <Link href="/decks/create" className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
              Create Your First Deck
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition h-full flex flex-col">
                  {/* Card Image Placeholder */}
                  <div className="h-32 bg-blue-50 flex items-center justify-center border-b border-gray-200">
                    <span className="text-3xl">🂡</span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{deck.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                      {deck.description || 'No description'}
                    </p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{deck.cards?.reduce((s, c) => s + c.quantity, 0) || 0} cards</span>
                      <span className="text-blue-600">View →</span>
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

