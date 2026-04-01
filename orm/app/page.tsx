'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center w-full">
      <div className="w-full max-w-5xl mx-auto text-center px-4 py-8">
        <div className="mb-8">
          <div className="inline-block mb-6">
            <span className="text-6xl md:text-8xl">🂡</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Magic <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Decks</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            Build, share, and manage your Magic: The Gathering deck collection
          </p>
          <p className="text-sm md:text-base text-slate-400 mb-8 max-w-md mx-auto">
            Import decklists, visualize your cards with official artwork, and organize all your decks in one place
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            href="/decks" 
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 text-center"
          >
            Get Started
          </Link>
          <Link 
            href="/auth" 
            className="px-8 py-4 border-2 border-purple-500 text-purple-300 font-bold rounded-lg hover:bg-purple-500/10 transition-all text-center"
          >
            Sign In
          </Link>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/70 transition">
            <div className="text-3xl mb-3">🎴</div>
            <h3 className="text-lg font-bold text-white mb-2">Build Decks</h3>
            <p className="text-slate-400 text-sm">Create and organize your Magic decks with an intuitive interface</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/70 transition">
            <div className="text-3xl mb-3">🖼️</div>
            <h3 className="text-lg font-bold text-white mb-2">Card Images</h3>
            <p className="text-slate-400 text-sm">See all your cards with official artwork from Scryfall</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/70 transition">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-bold text-white mb-2">Import Lists</h3>
            <p className="text-slate-400 text-sm">Paste decklists directly and we'll handle the rest</p>
          </div>
        </div>
      </div>
    </div>
  )
}

