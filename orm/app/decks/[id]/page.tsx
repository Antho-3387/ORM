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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-slate-400">Loading deck...</p>
        </div>
      </div>
    )
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/decks" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition mb-8">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Decks
          </Link>
          <p className="text-red-400 text-lg">Deck not found</p>
        </div>
      </div>
    )
  }

  const totalCards = deck.cards?.reduce((sum, dc) => sum + dc.quantity, 0) || 0
  const uniqueCards = deck.cards?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 w-full">
      <div className="w-full mx-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/decks" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition mb-8">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Decks
        </Link>

        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20 rounded-lg p-6 md:p-8 mb-8 backdrop-blur">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                {deck.name}
              </h1>
              {deck.description && (
                <p className="text-slate-300 text-base md:text-lg mb-4">
                  {deck.description}
                </p>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Total Cards</div>
                <div className="text-2xl font-bold text-purple-400">{totalCards}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Unique Cards</div>
                <div className="text-2xl font-bold text-purple-400">{uniqueCards}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {deck.cards && deck.cards.length > 0 ? (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Cards ({totalCards})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {deck.cards.map((dc, idx) => (
                <div
                  key={idx}
                  className="group bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:scale-105"
                >
                  {/* Card Image */}
                  {dc.card.imageUrl ? (
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                      <img
                        src={dc.card.imageUrl}
                        alt={dc.card.name}
                        className="w-full h-auto aspect-video object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Quantity Badge */}
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        ×{dc.quantity}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 aspect-video flex flex-col items-center justify-center p-4 text-center">
                      <div className="text-3xl mb-2">🂡</div>
                      <p className="font-semibold text-white text-sm truncate mb-2">{dc.card.name}</p>
                      <p className="text-xs text-purple-400 font-bold">×{dc.quantity}</p>
                    </div>
                  )}

                  {/* Card Info */}
                  <div className="p-3 md:p-4 bg-slate-900/70">
                    <h3 className="text-sm md:text-base font-bold text-white truncate mb-1 group-hover:text-purple-300 transition">
                      {dc.card.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      {dc.card.type || 'Unknown Type'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-6 text-center">
              <p className="text-slate-300">
                Deck contains <span className="font-bold text-purple-400">{totalCards}</span> total cards across <span className="font-bold text-purple-400">{uniqueCards}</span> unique types
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20 rounded-lg p-12 text-center backdrop-blur">
            <div className="text-5xl mb-4">🎴</div>
            <p className="text-slate-300 text-lg mb-2">This deck has no cards yet</p>
            <p className="text-slate-500 mb-6">Add some cards to get started!</p>
            <Link
              href="/decks"
              className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
            >
              Back to Decks
            </Link>
          </div>
        )}        </div>      </div>
    </div>
  )
}
