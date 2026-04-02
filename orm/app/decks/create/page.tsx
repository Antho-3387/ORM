'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function CreateDeckPage() {
  const [deckName, setDeckName] = useState('')
  const [deckList, setDeckList] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!deckName.trim() || !deckList.trim()) {
      alert('Complétez le nom et la decklist')
      return
    }

    // Parse la decklist
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

    // Sauvegarder (simulé)
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 sticky top-0 z-40 bg-slate-900/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-bold mb-2 inline-block transition">
              ← Retour
            </Link>
            <h1 className="text-3xl font-bold text-white">Créer un Deck</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Nom du Deck */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-3">
                Nom du Deck *
              </label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Ex: Ma Première Deck"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Decklist */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-3">
                Decklist (Format: Quantité + Nom) *
              </label>
              <p className="text-xs text-slate-400 mb-3 bg-slate-700/50 px-3 py-2 rounded border border-slate-600">
                📝 Collez votre decklist ici. Format: <code className="text-blue-400">1 Atraxa, Praetors&apos; Voice</code>
              </p>
              <textarea
                value={deckList}
                onChange={(e) => setDeckList(e.target.value)}
                placeholder="1 Atraxa, Praetors' Voice&#10;1 Sol Ring&#10;1 Counterspell&#10;..."
                rows={18}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
              <p className="text-xs text-slate-400 mt-2">
                Cartes détectées: {deckList.split('\n').filter(l => /^\d+/.test(l.trim())).length}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/50"
              >
                {saved ? '✓ Deck Sauvegardé !' : '💾 Sauvegarder le Deck'}
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg transition border border-slate-600"
              >
                Annuler
              </Link>
            </div>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-900/30 border border-blue-700/30 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 <strong>Format Commander:</strong> 100 cartes total, 1 seule copie de chaque carte (sauf terrains de base), 1 commander légendaire
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
