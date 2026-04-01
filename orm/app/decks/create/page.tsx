'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function CreateDeckPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [decklistText, setDecklistText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400 mb-4">You need to be logged in to create a deck</p>
          <Link href="/auth" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
            Login
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          name,
          description,
          decklistText: decklistText || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create deck')
      }

      router.push('/decks')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Create New Deck</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Deck Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Red Burn, Blue Control"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your deck strategy..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Import Decklist (Optional)
            </label>
            <textarea
              value={decklistText}
              onChange={(e) => setDecklistText(e.target.value)}
              placeholder="Paste your decklist here (one card per line, e.g., '4x Lightning Bolt' or '4 Lightning Bolt')"
              rows={8}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-gray-400 text-sm mt-2">
              Format: "4x Card Name" or "4 Card Name" or just "Card Name"
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !name}
              className="flex-1 bg-purple-600 text-white font-bold py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Deck'}
            </button>
            <Link
              href="/decks"
              className="flex-1 bg-gray-700 text-white font-bold py-2 rounded hover:bg-gray-600 transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
