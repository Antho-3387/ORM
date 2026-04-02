'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ImportDeckPage() {
  const [deckName, setDeckName] = useState('')
  const [deckList, setDeckList] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setDeckName('')
      setDeckList('')
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-300 bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-blue-600 font-bold text-lg hover:text-blue-700">
            ← Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Coller une Decklist</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom du Deck
              </label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Ex: Mon deck Azorius Control"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Decklist (Format: Quantité + Nom de la carte)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Format: 1 Atraxa, Praetors&apos; Voice
              </p>
              <textarea
                value={deckList}
                onChange={(e) => setDeckList(e.target.value)}
                placeholder="1 Atraxa, Praetors' Voice&#10;1 Sol Ring&#10;1 Counterspell"
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {submitted ? '✓ Decklist importée !' : 'Importer la Decklist'}
              </button>
              <Link
                href="/"
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </Link>
            </div>
          </form>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Vous pouvez copier une decklist depuis Scryfall et la coller ici.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
