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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            Create New Deck
          </h1>
          <p className="text-slate-400">Build your custom Magic deck or import a decklist</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 flex items-start gap-3">
            <span className="text-lg mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Deck Name */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Deck Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Red Burn, Blue Control"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your deck strategy, wins conditions, or any other notes..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition"
            />
          </div>

          {/* Decklist Import */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Import Decklist <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={decklistText}
              onChange={(e) => setDecklistText(e.target.value)}
              placeholder="Paste your decklist here (one card per line)&#10;&#10;Examples:&#10;4x Lightning Bolt&#10;4 Counterspell&#10;2 Island"
              rows={10}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm transition"
            />
            <div className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
              <p className="text-xs font-semibold text-slate-300 mb-2">Supported formats:</p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>✓ <code className="bg-slate-900 px-1.5 py-0.5 rounded">4x Lightning Bolt</code></li>
                <li>✓ <code className="bg-slate-900 px-1.5 py-0.5 rounded">4 Counterspell</code></li>
                <li>✓ <code className="bg-slate-900 px-1.5 py-0.5 rounded">Island</code> (defaults to 1x)</li>
              </ul>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={loading || !name}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/50 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Deck'
              )}
            </button>
            <Link
              href="/decks"
              className="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white font-semibold py-3 rounded-lg transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
