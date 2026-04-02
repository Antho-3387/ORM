'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function CreateDeckPage() {
  const [deckName, setDeckName] = useState('')
  const [deckList, setDeckList] = useState('')
  const [saved, setSaved] = useState(false)
  const cardCount = deckList.split('\n').filter(l => /^\d+/.test(l.trim())).length

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!deckName.trim() || !deckList.trim()) {
      alert('Complétez le nom et la decklist')
      return
    }

    const lines = deckList.split('\n').filter(line => line.trim())
    const cards: { name: string; quantity: number }[] = []
    let totalCards = 0

    for (const line of lines) {
      const match = line.match(/^(\d+)\s+(.+)$/)
      if (match) {
        const [, qty, cardName] = match
        const quantity = parseInt(qty)
        cards.push({ name: cardName.trim(), quantity })
        totalCards += quantity
      }
    }

    const deck = {
      id: Date.now(),
      name: deckName,
      cards: cards,
      totalCards: totalCards,
      createdAt: new Date().toISOString()
    }

    localStorage.setItem(`deck_${deck.id}`, JSON.stringify(deck))
    
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setDeckName('')
      setDeckList('')
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900/20 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-12">
        <div className="max-w-3xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold mb-6 transition"
          >
            <span>←</span> Retour à l'accueil
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Créer un Nouveau Deck
          </h1>
          <p className="text-slate-300 text-lg">
            Collez votre decklist Commander au format standard
          </p>
        </div>
      </header>

      {/* Main Form */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 sm:p-12 shadow-2xl">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Deck Name Section */}
            <div className="space-y-3">
              <label htmlFor="deckName" className="block text-lg font-bold text-slate-100">
                📝 Nom du Deck
              </label>
              <input
                id="deckName"
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Ex: Ma Première Deck Atraxa"
                className="w-full px-5 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 text-lg focus:border-blue-500 focus:bg-slate-700 transition-all duration-300"
              />
            </div>

            {/* Decklist Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="deckList" className="block text-lg font-bold text-slate-100">
                  🎴 Decklist Commander
                </label>
                <span className="text-sm font-semibold text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full">
                  {cardCount} cartes détectées
                </span>
              </div>
              
              <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4 mb-3">
                <p className="text-sm text-slate-300 font-mono">
                  Format attendu:<br/>
                  <code className="text-blue-300">1 Atraxa, Praetors&apos; Voice</code><br/>
                  <code className="text-blue-300">2 Sol Ring</code><br/>
                  <code className="text-blue-300">3 Counterspell</code>
                </p>
              </div>

              <textarea
                id="deckList"
                value={deckList}
                onChange={(e) => setDeckList(e.target.value)}
                placeholder="Collez votre decklist ici..."
                rows={20}
                className="w-full px-5 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 font-mono text-sm focus:border-blue-500 focus:bg-slate-700 transition-all duration-300 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 active:scale-95"
              >
                {saved ? '✓ Deck Sauvegardé !' : '💾 Sauvegarder le Deck'}
              </button>
              <Link
                href="/"
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-lg rounded-xl transition-all duration-300 border-2 border-slate-600 hover:border-slate-500 text-center"
              >
                Annuler
              </Link>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-2 border-blue-700/50 rounded-xl">
            <p className="text-blue-200 text-base leading-relaxed">
              <strong className="text-blue-300">💡 Format Commander:</strong><br/>
              • 100 cartes total<br/>
              • 1 seule copie de chaque carte (sauf terrains de base)<br/>
              • 1 commander légendaire required<br/>
              • Seulement les cartes légales en EDH
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
