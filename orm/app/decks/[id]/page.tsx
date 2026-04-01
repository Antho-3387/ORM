'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

interface Card {
  id: string
  name: string
  quantity: number
}

interface Deck {
  id: string
  name: string
  description?: string
  cards?: Array<{
    card: { id: string; name: string }
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
      <div className="min-h-screen bg-gray-900 p-8">
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
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/decks" className="text-purple-600 hover:text-purple-400 mb-6 inline-block">
          ← Back to decks
        </Link>

        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{deck.name}</h1>
          {deck.description && (
            <p className="text-gray-400 mb-4">{deck.description}</p>
          )}
          <div className="text-sm text-gray-500">
            Total cards: <span className="font-bold text-white">{totalCards}</span>
          </div>
        </div>

        {deck.cards && deck.cards.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-700">
                  <th className="px-6 py-3 text-left text-white font-bold">Card Name</th>
                  <th className="px-6 py-3 text-right text-white font-bold">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {deck.cards.map((dc, idx) => (
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="px-6 py-4 text-gray-300">{dc.card.name}</td>
                    <td className="px-6 py-4 text-right text-gray-300">{dc.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">This deck has no cards yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
