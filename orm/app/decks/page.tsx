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
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">My Decks</h1>
          <Link 
            href="/decks/create" 
            className="bg-purple-600 text-white px-6 py-2 rounded font-bold hover:bg-purple-700 transition"
          >
            + New Deck
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading decks...</p>
        ) : decks.length === 0 ? (
          <div className="bg-gray-800 rounded p-8 text-center">
            <p className="text-gray-400 mb-4">No decks yet. Create your first deck!</p>
            <Link
              href="/decks/create"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded font-bold hover:bg-purple-700 transition"
            >
              Create Deck
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(deck => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <div className="bg-gray-800 rounded p-6 hover:bg-gray-700 transition cursor-pointer h-full">
                  <h2 className="text-xl font-bold text-white mb-2">{deck.name}</h2>
                  <p className="text-gray-400 mb-4">{deck.description || 'No description'}</p>
                  <div className="text-sm text-gray-500">
                    {deck.cards?.length || 0} cards
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

