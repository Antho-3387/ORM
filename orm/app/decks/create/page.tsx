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

    const deck = {
      id: Date.now(),
      name: deckName,
      list: deckList,
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
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      <Link href="/">
        <button style={{ background: '#404050', marginBottom: '2rem' }}>
          Retour
        </button>
      </Link>

      <h1>Créer un Deck</h1>

      <form onSubmit={handleSave}>
        <div>
          <label style={{ display: 'block', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Nom du Deck
          </label>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Ex: Ma Deck Atraxa"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Decklist (Format: Quantité + Nom)
          </label>
          <p style={{ fontSize: '0.9rem', color: '#a0a0b0', marginBottom: '1rem' }}>
            Exemple: 1 Atraxa, Praetors' Voice
          </p>
          <textarea
            value={deckList}
            onChange={(e) => setDeckList(e.target.value)}
            placeholder="1 Atraxa, Praetors' Voice&#10;1 Sol Ring&#10;1 Counterspell&#10;..."
          />
        </div>

        <div>
          <button type="submit">
            {saved ? 'Sauvegardé!' : 'Sauvegarder le Deck'}
          </button>
          <Link href="/">
            <button type="button" style={{ background: '#404050', marginLeft: '0' }}>
              Annuler
            </button>
          </Link>
        </div>
      </form>

      <div style={{ 
        background: '#2a3a4e', 
        border: '1px solid #404050', 
        padding: '2rem', 
        borderRadius: '8px',
        marginTop: '3rem'
      }}>
        <h3>Format Commander</h3>
        <p>
          • 100 cartes total<br/>
          • 1 seule copie de chaque carte (sauf terrains de base)<br/>
          • 1 commander légendaire<br/>
          • Seulement les cartes légales en EDH
        </p>
      </div>
    </main>
  )
}
