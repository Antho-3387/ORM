'use client'

import { useState, useEffect, useMemo } from 'react'
import { searchCards } from '@/lib/scryfall'

interface Card {
  id: string
  name: string
  image_uris?: {
    normal: string
  }
  type_line: string
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    searchQuery: '',
  })

  // Charger les cartes au montage
  useEffect(() => {
    const loadCards = async () => {
      setLoading(true)
      try {
        // Récupère les cartes légendaires (populaires en Commander)
        const results = await searchCards('t:legendary')
        setCards(results.slice(0, 50)) // Limite à 50 cartes pour la performance
      } catch (error) {
        console.error('Failed to load cards:', error)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [])

  // Filtrer par recherche
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (
        filters.searchQuery &&
        !card.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [cards, filters])

  return (
    <main style={{ minHeight: 'calc(100vh - 60px)', background: '#1a1a2e', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
            Magic Cards
          </h1>
          <p style={{ color: '#b0b0c0', fontSize: '1rem' }}>
            {loading ? 'Chargement des cartes...' : `${filteredCards.length} cartes trouvées`}
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Rechercher une carte..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#e0e0e0', fontSize: '1.1rem' }}>
              Chargement des cartes depuis Scryfall...
            </p>
          </div>
        ) : filteredCards.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1.5rem',
            justifyItems: 'center'
          }}>
            {filteredCards.map((card) => (
              <div key={card.id} style={{ textAlign: 'center' }}>
                {card.image_uris?.normal ? (
                  <img 
                    src={card.image_uris.normal} 
                    alt={card.name}
                    style={{
                      width: '120px',
                      height: 'auto',
                      borderRadius: '6px',
                      border: '1px solid #404050',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ) : (
                  <div
                    style={{
                      width: '120px',
                      height: '168px',
                      background: '#2a2a3e',
                      borderRadius: '6px',
                      border: '1px solid #404050',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#808090',
                      fontSize: '0.8rem',
                    }}
                  >
                    No Image
                  </div>
                )}
                <p style={{ fontSize: '0.9rem', color: '#e0e0e0', marginTop: '0.5rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {card.name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '1.5rem', color: '#e0e0e0', marginBottom: '1rem' }}>
              Aucune carte trouvée
            </h2>
            <p style={{ color: '#b0b0c0' }}>
              Essaie une autre recherche.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
