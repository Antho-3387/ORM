'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-blue-600">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Magic Decks</h1>
        <p className="text-xl text-gray-100 mb-8">Manage your Magic: The Gathering deck collection</p>
        <Link 
          href="/decks" 
          className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
        >
          View Your Decks
        </Link>
      </div>
    </div>
  )
}
