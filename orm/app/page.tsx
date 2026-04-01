'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="w-full h-full">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-6 text-6xl md:text-8xl">🂡</div>
            <h1 className="text-5xl md:text-6xl font-bold text-cyan-400 mb-4">
              MTG Deck Collection
            </h1>
            <p className="text-xl text-gray-300 mb-3">
              Build, manage, and organize your Magic decks
            </p>
            <p className="text-base text-gray-500">
              Import decklists with official Scryfall artwork
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/decks" 
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded text-center"
            >
              🚀 Get Started
            </Link>
            <Link 
              href="/auth" 
              className="px-8 py-3 border-2 border-cyan-400 text-cyan-400 font-bold rounded hover:border-cyan-300 hover:text-cyan-300 transition text-center"
            >
              📝 Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gray-900 border border-cyan-400/30 rounded p-6 hover:border-cyan-400/70 transition">
              <div className="text-4xl mb-3">🎴</div>
              <h3 className="text-lg font-bold text-cyan-400 mb-2">Build Decks</h3>
              <p className="text-gray-400 text-sm">Create, edit and organize your Magic decks</p>
            </div>
            <div className="bg-gray-900 border border-cyan-400/30 rounded p-6 hover:border-cyan-400/70 transition">
              <div className="text-4xl mb-3">🖼️</div>
              <h3 className="text-lg font-bold text-cyan-400 mb-2">Card Images</h3>
              <p className="text-gray-400 text-sm">View all your cards with official Scryfall artwork</p>
            </div>
            <div className="bg-gray-900 border border-cyan-400/30 rounded p-6 hover:border-cyan-400/70 transition">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-bold text-cyan-400 mb-2">Import Lists</h3>
              <p className="text-gray-400 text-sm">Paste decklists and we will handle the rest</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

