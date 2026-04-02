'use client'

import { useState, useEffect } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    searchQuery: '',
  })

  // Charger des cartes aléatoires au montage
  useEffect(() => {
    const loadRandomCards = async () => {
      setLoading(true)
      try {
        // Charge différentes collections de cartes aléatoires
        const queries = [
          'c:w',
          'c:u', 
          'c:b',
          'c:r',
          'c:g',
          't:creature',
          't:instant',
          't:sorcery'
        ]
        const randomQuery = queries[Math.floor(Math.random() * queries.length)]
        const results = await searchCards(randomQuery)
        setCards(results.slice(0, 30)) // 30 cartes aléatoires
      } catch (error) {
        console.error('Failed to load cards:', error)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    loadRandomCards()
  }, [])

  // Rechercher quand le searchQuery change
  useEffect(() => {
    if (!filters.searchQuery.trim()) {
      // Si la barre est vide, ne rien faire (garder les 30 cartes initiales)
      return
    }

    const searchCardsApi = async () => {
      setLoading(true)
      try {
        const results = await searchCards(filters.searchQuery)
        
        // Trier les résultats: d'abord les noms qui commencent par la recherche, puis les autres
        const query = filters.searchQuery.toLowerCase()
        const sorted = results.sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(query)
          const bStarts = b.name.toLowerCase().startsWith(query)
          if (aStarts && !bStarts) return -1
          if (!aStarts && bStarts) return 1
          // Si les deux commencent ou ne commencent pas, trier par ordre alphabétique
          return a.name.localeCompare(b.name)
        })
        
        setCards(sorted.slice(0, 30))
      } catch (error) {
        console.error('Failed to search cards:', error)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    // Délai de 300ms pour ne pas faire une requête à chaque lettre
    const timer = setTimeout(searchCardsApi, 300)
    return () => clearTimeout(timer)
  }, [filters.searchQuery])

  return (
    <main style={{ minHeight: 'calc(100vh - 60px)', background: '#1a1a2e', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
            Magic Cards
          </h1>
          <p style={{ color: '#b0b0c0', fontSize: '1rem' }}>
            {loading ? 'Recherche en cours...' : `${cards.length} cartes trouvées`}
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
              Recherche en cours...
            </p>
          </div>
        ) : cards.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1.5rem',
            justifyItems: 'center'
          }}>
            {cards.map((card) => (
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
