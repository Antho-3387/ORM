'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function CreateDeckPage() {
  const [deckName, setDeckName] = useState('')
  const [commander, setCommander] = useState('')
  const [description, setDescription] = useState('')
  const [format, setFormat] = useState('Commander')
  const [cards, setCards] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setDeckName('')
      setCommander('')
      setDescription('')
      setFormat('Commander')
      setCards('')
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="container-clean py-6">
          <Link href="/decks" className="text-indigo-600 text-sm font-medium hover:text-indigo-700 mb-4 block">
            ← Back to Decks
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Deck</h1>
          <p className="text-gray-500 text-sm mt-1">Build your Magic deck from scratch</p>
        </div>
      </header>

      {/* Content */}
      <div className="container-clean py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Deck Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Deck Name *
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="e.g., Atraxa Infect"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              {/* Commander */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Commander *
                </label>
                <input
                  type="text"
                  value={commander}
                  onChange={(e) => setCommander(e.target.value)}
                  placeholder="e.g., Atraxa, Praetors' Voice"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Format *
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                >
                  <option>Commander</option>
                  <option>Modern</option>
                  <option>Standard</option>
                  <option>Pioneer</option>
                  <option>Legacy</option>
                  <option>Vintage</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your deck strategy and key cards..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              {/* Cards */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Decklist (one card per line)
                </label>
                <textarea
                  value={cards}
                  onChange={(e) => setCards(e.target.value)}
                  placeholder="1 Sol Ring
1 Counterspell
8 Swamp
8 Island
..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">Format: [quantity] [card name]</p>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                >
                  {submitted ? '✓ Deck Created!' : 'Create Deck'}
                </button>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">💡 Tip:</span> You can edit your deck anytime after creation. Start with the basics and refine your strategy!
              </p>
            </div>
          </div>

          {/* Quick Template */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Templates</h2>
            <div className="grid grid-cols-2 gap-4">
              {['Commander', 'Modern', 'Standard'].map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => {
                    setFormat(tmpl)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition text-left"
                >
                  <p className="font-semibold text-gray-900">{tmpl} Deck</p>
                  <p className="text-sm text-gray-500">Start with {tmpl} format</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
