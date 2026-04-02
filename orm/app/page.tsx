import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1>Commander Decks</h1>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem', color: '#b0b0c0' }}>
        Créez, gérez et sauvegardez vos decks Commander Magic: The Gathering. 
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        <Link href="/decks/create">
          <button>
            Créer un Deck
          </button>
        </Link>
        <Link href="/decks">
          <button style={{ background: '#404050' }}>
            Mes Decks
          </button>
        </Link>
      </div>

      {/* Section Mes Decks */}
      <div style={{ 
        background: '#2a3a4e', 
        border: '1px solid #404050', 
        padding: '2rem', 
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2>Mes Decks Récents</h2>
        <DecksPreview />
      </div>

      <div style={{ 
        background: '#2a3a4e', 
        border: '1px solid #404050', 
        padding: '2rem', 
        borderRadius: '8px'
      }}>
        <h2>Commencer</h2>
        <p>
          Cliquez sur le bouton "Créer un Deck" pour démarrer. 
          Vous pouvez ensuite coller votre decklist au format Commander 
          et la sauvegarder localement.
        </p>
      </div>
    </main>
  )
}

function DecksPreview() {
  const [decks, setDecks] = React.useState<any[]>([])

  React.useEffect(() => {
    const loadDecks = () => {
      try {
        const allItems = { ...localStorage }
        const savedDecks: any[] = []

        for (const key in allItems) {
          if (key.startsWith('deck_')) {
            const deckData = JSON.parse(allItems[key])
            savedDecks.push(deckData)
          }
        }

        savedDecks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setDecks(savedDecks.slice(0, 3))
      } catch (error) {
        console.error('Error loading decks:', error)
        setDecks([])
      }
    }

    loadDecks()
  }, [])

  const countCards = (list: string) => {
    return list.split('\n').filter(line => line.trim() && /^\d+\s+/.test(line.trim())).length
  }

  if (decks.length === 0) {
    return (
      <p style={{ color: '#a0a0b0' }}>
        Aucun deck sauvegardé. Créez votre premier deck pour commencer!
      </p>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {decks.map((deck) => (
        <div
          key={deck.id}
          style={{
            background: '#1a1a2e',
            border: '1px solid #404050',
            borderRadius: '6px',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.25rem' }}>
              {deck.name}
            </h3>
            <p style={{ color: '#a0a0b0', fontSize: '0.9rem' }}>
              {countCards(deck.list)} cartes
            </p>
          </div>
          <Link href="/decks">
            <button style={{ background: '#3b82f6' }}>Voir</button>
          </Link>
        </div>
      ))}
    </div>
  )
}

import React from 'react'
