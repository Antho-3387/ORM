'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="mb-6 text-6xl md:text-8xl">🂡</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Magic Decks
          </h1>
          <p className="text-xl text-gray-400 mb-3">
            Build, share, and manage your Magic: The Gathering deck collection
          </p>
          <p className="text-base text-gray-500 mb-8">
            Import decklists, visualize your cards with official artwork
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link 
            href="/decks" 
            className="px-8 py-3 bg-purple-600 text-white font-bold rounded hover:bg-purple-700 transition text-center"
          >
            Get Started
          </Link>
          <Link 
            href="/auth" 
            className="px-8 py-3 border-2 border-purple-600 text-purple-400 font-bold rounded hover:bg-purple-600/10 transition text-center"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded p-6">
            <div className="text-3xl mb-3">🎴</div>
            <h3 className="text-lg font-bold text-white mb-2">Build Decks</h3>
            <p className="text-gray-400 text-sm">Create and organize your Magic decks</p>
          </div>
          <div className="bg-gray-800 rounded p-6">
            <div className="text-3xl mb-3">🖼️</div>
            <h3 className="text-lg font-bold text-white mb-2">Card Images</h3>
            <p className="text-gray-400 text-sm">See all your cards with official artwork</p>
          </div>
          <div className="bg-gray-800 rounded p-6">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-bold text-white mb-2">Import Lists</h3>
            <p className="text-gray-400 text-sm">Paste decklists directly</p>
          </div>
        </div>
      </div>
    </div>
  )
}

