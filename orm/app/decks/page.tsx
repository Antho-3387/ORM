'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Deck {
  id: string
  name: string
  description?: string
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch decks from API
    fetch('/api/decks')
      .then(res => res.json())
      .then(data => {
        setDecks(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error('Error fetching decks:', err)
        setDecks([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">My Decks</h1>
          <Link 
            href="/" 
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            ← Home
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading decks...</p>
        ) : decks.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No decks yet. Create your first deck to get started!</p>
            <button className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition">
              Create Deck
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(deck => (
              <div key={deck.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition cursor-pointer">
                <h2 className="text-xl font-bold text-white mb-2">{deck.name}</h2>
                <p className="text-gray-400">{deck.description || 'No description'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
