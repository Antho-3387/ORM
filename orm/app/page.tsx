'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Commander Decks
        </h1>
        <p className="text-slate-300 text-lg mb-12 max-w-2xl mx-auto">
          Créez et gérez vos decks Magic: The Gathering au format Commander
        </p>
        
        <Link
          href="/decks/create"
          className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/50"
        >
          + Créer un Deck
        </Link>
      </div>
    </main>
  )
}
