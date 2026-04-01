'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

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

export default function DeckDetailPage() {
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const deckId = params?.id as string

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    if (!deckId) return

    fetch(`/api/decks/${deckId}`, {
      headers: {
        'x-user-id': user?.id || '',
      },
    })
      .then(res => res.json())
      .then(data => setDeck(data))
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false))
  }, [deckId, isAuthenticated, user?.id, router])

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading deck...</p>
      </div>
    )
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-red-400 mb-4">Deck not found</p>
          <Link href="/decks" className="text-purple-600 hover:text-purple-400">
            ← Back to decks
          </Link>
        </div>
      </div>
    )
  }

  const totalCards = deck.cards?.reduce((sum, dc) => sum + dc.quantity, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/decks" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-semibold">
          ← Back to Decks
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{deck.name}</h1>
          {deck.description && (
            <p className="text-gray-600 mb-4">{deck.description}</p>
          )}
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-600">Total Cards:</span>
              <strong className="text-gray-900 ml-2">{totalCards}</strong>
            </div>
            <div>
              <span className="text-gray-600">Unique Cards:</span>
              <strong className="text-gray-900 ml-2">{deck.cards?.length || 0}</strong>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {deck.cards && deck.cards.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cards ({totalCards})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {deck.cards.map((dc, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
                  {/* Card Image */}
                  {dc.card.imageUrl ? (
                    <div className="relative overflow-hidden bg-gray-100 h-64">
                      <img
                        src={dc.card.imageUrl}
                        alt={dc.card.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow">
                        x{dc.quantity}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 h-64 flex flex-col items-center justify-center">
                      <div className="text-5xl mb-2">🂡</div>
                      <p className="text-sm font-bold text-gray-900">{dc.card.name}</p>
                      <p className="text-xs text-gray-600">x{dc.quantity}</p>
                    </div>
                  )}

                  {/* Card Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900 truncate mb-1">{dc.card.name}</h3>
                    <p className="text-xs text-gray-600">{dc.card.type || 'Unknown Type'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">🎴</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Cards</h3>
            <p className="text-gray-600 mb-6">This deck has no cards yet</p>
            <Link href="/decks" className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
              Back to Decks
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
