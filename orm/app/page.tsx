'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            MTG Deck Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create, organize, and manage your Magic decks
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/decks"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              View My Decks
            </Link>
            <Link
              href="/auth"
              className="px-6 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition">
            <div className="text-3xl mb-3">🎴</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Create Decks</h3>
            <p className="text-gray-600 text-sm">
              Build decks from scratch or import decklists
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Search Cards</h3>
            <p className="text-gray-600 text-sm">
              Find cards with official Scryfall artwork
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition">
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage</h3>
            <p className="text-gray-600 text-sm">
              Edit, organize, and customize your decks
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

