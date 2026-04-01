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
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/decks" className="text-purple-600 hover:text-purple-400 mb-6 inline-block">
          ← Back to decks
        </Link>

        <div className="bg-gray-800 rounded p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{deck.name}</h1>
          {deck.description && (
            <p className="text-gray-400 mb-4">{deck.description}</p>
          )}
          <div className="text-sm text-gray-500">
            Total cards: <span className="font-bold text-white">{totalCards}</span>
          </div>
        </div>

        {deck.cards && deck.cards.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {deck.cards.map((dc, idx) => (
              <div key={idx} className="bg-gray-800 rounded overflow-hidden hover:shadow-lg transition">
                {dc.card.imageUrl ? (
                  <div className="relative pb-full bg-gray-700">
                    <img
                      src={dc.card.imageUrl}
                      alt={dc.card.name}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                    <div className="absolute top-0 right-0 bg-purple-600 text-white px-2 py-1 text-sm font-bold rounded-bl">
                      {dc.quantity}x
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700 aspect-video flex flex-col items-center justify-center p-4">
                    <div className="text-gray-400 text-center">
                      <p className="font-bold text-sm mb-1">{dc.card.name}</p>
                      <p className="text-xs">×{dc.quantity}</p>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <h3 className="text-sm font-bold text-white truncate mb-1">{dc.card.name}</h3>
                  <p className="text-xs text-gray-400">{dc.card.type || 'Unknown'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded p-8 text-center">
            <p className="text-gray-400 mb-4">This deck has no cards yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
