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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              My Decks
            </h1>
            <p className="text-slate-400">Manage and organize your Magic decks</p>
          </div>
          <Link 
            href="/decks/create" 
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/50 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105"
          >
            + Create Deck
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-slate-400">Loading your decks...</p>
            </div>
          </div>
        ) : decks.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20 rounded-lg p-8 md:p-12 text-center backdrop-blur">
            <div className="text-5xl mb-4">🎴</div>
            <p className="text-slate-300 mb-6 text-lg">No decks yet. Create your first deck to get started!</p>
            <Link
              href="/decks/create"
              className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
            >
              Build Your First Deck
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(deck => {
              const cardImages = deck.cards?.slice(0, 4).map(c => c.card.imageUrl).filter(Boolean) || []
              return (
                <Link key={deck.id} href={`/decks/${deck.id}`}>
                  <div className="group bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/20 rounded-lg overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:scale-105 h-full cursor-pointer">
                    {/* Card Image Preview */}
                    <div className="relative h-40 sm:h-44 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
                      {cardImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 p-2 h-full">
                          {cardImages.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Card ${idx + 1}`}
                              className="w-full h-full object-cover rounded opacity-80 group-hover:opacity-100 transition"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-4xl">🂡</span>
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-5">
                      <h2 className="text-lg md:text-xl font-bold text-white mb-2 truncate group-hover:text-purple-300 transition">
                        {deck.name}
                      </h2>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2 h-10">
                        {deck.description || 'No description added yet'}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                        <span className="text-sm font-semibold text-purple-400">
                          {deck.cards?.length || 0} cards
                        </span>
                        <span className="text-xs text-slate-500 group-hover:text-slate-300 transition">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

