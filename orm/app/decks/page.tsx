'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Deck {
  id: number
  name: string
  list: string
  createdAt: string
}

interface CardLine {
  quantity: number
  name: string
  imageUrl?: string
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDeckId, setExpandedDeckId] = useState<number | null>(null)
  const [cardImages, setCardImages] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    const loadDecks = () => {
      try {
        const allItems = { ...localStorage }
        const savedDecks: Deck[] = []

        for (const key in allItems) {
          if (key.startsWith('deck_')) {
            const deckData = JSON.parse(allItems[key])
            savedDecks.push(deckData)
          }
        }

        savedDecks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setDecks(savedDecks)
      } catch (error) {
        console.error('Error loading decks:', error)
        setDecks([])
      } finally {
        setLoading(false)
      }
    }

    loadDecks()
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce deck?')) {
      localStorage.removeItem(`deck_${id}`)
      setDecks(decks.filter(d => d.id !== id))
    }
  }

  const countCards = (list: string) => {
    return list.split('\n').filter(line => line.trim() && /^\d+\s+/.test(line.trim())).length
  }

  const parseDecklist = (list: string): CardLine[] => {
    return list
      .split('\n')
      .filter(line => line.trim() && /^\d+\s+/.test(line.trim()))
      .map(line => {
        const match = line.match(/^(\d+)\s+(.+)$/)
        if (match) {
          return {
            quantity: parseInt(match[1]),
            name: match[2].trim()
          }
        }
        return { quantity: 0, name: '' }
      })
      .filter(card => card.name)
  }

  const fetchCardImage = async (cardName: string): Promise<string | undefined> => {
    // Vérifier le cache
    if (cardImages.has(cardName)) {
      return cardImages.get(cardName)
    }

    try {
      // Appeler la route API backend au lieu de Scryfall directement
      const response = await fetch(
        `/api/cards/image?name=${encodeURIComponent(cardName)}`
      )

      if (response.ok) {
        const data = await response.json()
        const imageUrl = data.imageUrl
        if (imageUrl) {
          setCardImages(prev => new Map(prev).set(cardName, imageUrl))
          return imageUrl
        }
      }
    } catch (error) {
      console.error(`Error fetching image for ${cardName}:`, error)
    }

    return undefined
  }

  const handleExpandDeck = async (deckId: number) => {
    if (expandedDeckId === deckId) {
      setExpandedDeckId(null)
    } else {
      setExpandedDeckId(deckId)
      // Charger les images des cartes
      const deck = decks.find(d => d.id === deckId)
      if (deck) {
        const cards = parseDecklist(deck.list)
        for (const card of cards) {
          if (!cardImages.has(card.name)) {
            await fetchCardImage(card.name)
          }
        }
      }
    }
  }

  return (
    <main style={{ minHeight: 'calc(100vh - 60px)', background: '#1a1a2e', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/">
            <button style={{ background: '#404050', marginBottom: '1rem' }}>
              Retour
            </button>
          </Link>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
            Mes Decks
          </h1>
          <p style={{ color: '#b0b0c0', fontSize: '1rem' }}>
            {decks.length === 0 ? 'Aucun deck sauvegardé' : `${decks.length} deck${decks.length > 1 ? 's' : ''} sauvegardé${decks.length > 1 ? 's' : ''}`}
          </p>
        </div>

        <Link href="/decks/create">
          <button style={{ marginBottom: '2rem' }}>
            Créer un nouveau Deck
          </button>
        </Link>

        {loading ? (
          <p style={{ color: '#e0e0e0' }}>Chargement...</p>
        ) : decks.length > 0 ? (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {decks.map((deck) => {
              const cards = parseDecklist(deck.list)
              const isExpanded = expandedDeckId === deck.id

              return (
                <div
                  key={deck.id}
                  style={{
                    background: '#2a2a3e',
                    border: '1px solid #404050',
                    borderRadius: '8px',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.5rem' }}>
                        {deck.name}
                      </h2>
                      <p style={{ color: '#b0b0c0', fontSize: '0.9rem' }}>
                        {countCards(deck.list)} cartes · Créé le {new Date(deck.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(deck.id)}
                      style={{
                        background: '#8b0000',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#a00000'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#8b0000'}
                    >
                      Supprimer
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: isExpanded ? '1.5rem' : '0' }}>
                    <button
                      onClick={() => handleExpandDeck(deck.id)}
                      style={{
                        background: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        flex: 1
                      }}
                    >
                      {isExpanded ? 'Masquer les cartes' : 'Afficher les cartes'}
                    </button>
                    <button
                      onClick={() => {
                        const text = deck.list
                        navigator.clipboard.writeText(text)
                        alert('Decklist copiée!')
                      }}
                      style={{
                        background: '#404050',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        flex: 1
                      }}
                    >
                      Copier
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={{
                      background: '#1a1a2e',
                      border: '1px solid #404050',
                      borderRadius: '6px',
                      padding: '1.5rem'
                    }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>
                        Cartes ({cards.length})
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '1rem'
                      }}>
                        {cards.map((card, idx) => {
                          const imageUrl = cardImages.get(card.name)
                          return (
                            <div key={`${card.name}-${idx}`} style={{ textAlign: 'center' }}>
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={card.name}
                                  style={{
                                    width: '100px',
                                    height: 'auto',
                                    borderRadius: '4px',
                                    border: '1px solid #404050',
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '100px',
                                    height: '140px',
                                    background: '#2a2a3e',
                                    borderRadius: '4px',
                                    border: '1px solid #404050',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#808090',
                                    fontSize: '0.75rem',
                                    textAlign: 'center',
                                    padding: '0.5rem'
                                  }}
                                >
                                  Chargement...
                                </div>
                              )}
                              <p style={{ fontSize: '0.8rem', color: '#e0e0e0', marginTop: '0.5rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {card.quantity}x {card.name}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{
            background: '#2a2a3e',
            border: '1px solid #404050',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '1.3rem', color: '#e0e0e0', marginBottom: '1rem' }}>
              Pas de decks sauvegardés
            </h2>
            <p style={{ color: '#b0b0c0', marginBottom: '1.5rem' }}>
              Créez votre premier deck pour commencer!
            </p>
            <Link href="/decks/create">
              <button>Créer un Deck</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
