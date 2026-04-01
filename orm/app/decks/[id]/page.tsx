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
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Back */}
        <Link href="/decks" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mb-8 text-sm font-medium">
          ← Back to Decks
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{deck.name}</h1>
          {deck.description && (
            <p className="text-gray-600 mb-4">{deck.description}</p>
          )}
          <div className="flex gap-6 text-sm text-gray-600">
            <span>Total Cards: <strong className="text-gray-900">{totalCards}</strong></span>
            <span>Unique: <strong className="text-gray-900">{deck.cards?.length || 0}</strong></span>
          </div>
        </div>

        {/* Cards Grid */}
        {deck.cards && deck.cards.length > 0 ? (
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
