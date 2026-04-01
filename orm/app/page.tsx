'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <section className="px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              MTG Deck Manager
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create, organize, and manage your Magic: The Gathering decks with ease
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/decks"
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                View My Decks
              </Link>
              <Link
                href="/auth"
                className="px-8 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Create Deck */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
                <div className="text-4xl mb-4">🎴</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Deck</h3>
                <p className="text-gray-600 mb-4">Start building a new deck from scratch or import a decklist</p>
                <Link href="/decks/create" className="inline-block text-blue-600 hover:text-blue-700 font-semibold">
                  Create Now →
                </Link>
              </div>

              {/* Search Cards */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Search Cards</h3>
                <p className="text-gray-600 mb-4">Find cards from Scryfall database with official artwork</p>
                <Link href="/decks" className="inline-block text-blue-600 hover:text-blue-700 font-semibold">
                  Browse Cards →
                </Link>
              </div>

              {/* Manage Decks */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Decks</h3>
                <p className="text-gray-600 mb-4">Edit, organize, and share your deck collection</p>
                <Link href="/decks" className="inline-block text-blue-600 hover:text-blue-700 font-semibold">
                  My Collection →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

