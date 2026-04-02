'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900/20 to-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="text-6xl mb-4">🎴</div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Commander Decks
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-4">
            Créez et gérez vos decks Magic: The Gathering au format Commander
          </p>
          <p className="text-base text-slate-400">
            Collez votre decklist et sauvegardez-la instantanément
          </p>
        </div>

        <div className="mt-12">
          <Link
            href="/decks/create"
            className="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xl rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 active:scale-95 hover:scale-105"
          >
            + Créer un Deck
          </Link>
        </div>

        <div className="mt-16 p-8 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl">
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-slate-200">Qu'est-ce que Commander?</strong><br/>
            <br/>
            Format populaire de Magic: The Gathering avec des decks de 100 cartes uniques 
            (sauf terrains de base) dirigés par une carte légendaire. 
            Un format fun, social et créatif.
          </p>
        </div>
      </div>
    </main>
  )
}
