'use client'

import { useState, useMemo } from 'react'

// Mock data - will be replaced with real Scryfall API
const ALL_CARDS = [
  {
    id: '1',
    name: 'Sol Ring',
    imageUrl: 'https://images.scryfall.io/cards/large/front/e/6/e6211e3e-8494-40ba-b149-eb89e618e1d2.jpg?1699395241',
    manaValue: 1,
    colors: '',
    type: 'Artifact',
    stats: { popularity: 89, synergies: 234, decks: 5421 },
  },
  {
    id: '2',
    name: 'Lightning Bolt',
    imageUrl: 'https://images.scryfall.io/cards/large/front/c/e/ce711943-c1a1-43a0-8b97-8a547503537f.jpg?1601077628',
    manaValue: 1,
    colors: 'R',
    type: 'Instant',
    stats: { popularity: 94, synergies: 187, decks: 3201 },
  },
  {
    id: '3',
    name: 'Counterspell',
    imageUrl: 'https://images.scryfall.io/cards/large/front/1/9/1920dae4-fb92-412f-b8f9-4eca114b06ec.jpg?1599769051',
    manaValue: 2,
    colors: 'U',
    type: 'Instant',
    stats: { popularity: 88, synergies: 156, decks: 2890 },
  },
  {
    id: '4',
    name: 'Demonic Tutor',
    imageUrl: 'https://images.scryfall.io/cards/large/front/3/b/3bdbc3c9-8a89-4f0a-961b-6ad563ce98c2.jpg?1599765488',
    manaValue: 2,
    colors: 'B',
    type: 'Instant',
    stats: { popularity: 92, synergies: 201, decks: 4156 },
  },
  {
    id: '5',
    name: 'Green Sun\'s Zenith',
    imageUrl: 'https://images.scryfall.io/cards/large/front/0/1/01794178-cf41-454c-ac37-1d8b3e638378.jpg?1580014961',
    manaValue: 2,
    colors: 'G',
    type: 'Instant',
    stats: { popularity: 85, synergies: 198, decks: 3845 },
  },
  {
    id: '6',
    name: 'Swords to Plowshares',
    imageUrl: 'https://images.scryfall.io/cards/large/front/b/e/be2b4177-e47c-4dde-9322-b9876749c6e6.jpg?1611967006',
    manaValue: 1,
    colors: 'W',
    type: 'Instant',
    stats: { popularity: 91, synergies: 167, decks: 2945 },
  },
  {
    id: '7',
    name: 'Tundra',
    imageUrl: 'https://images.scryfall.io/cards/large/front/0/b/0b8437f7-85cb-4e6f-9db2-d2fbc91b88fc.jpg?1597377154',
    manaValue: 0,
    colors: 'WU',
    type: 'Land',
    stats: { popularity: 75, synergies: 145, decks: 2123 },
  },
  {
    id: '8',
    name: 'Channel',
    imageUrl: 'https://images.scryfall.io/cards/large/front/c/e/ce54c7ab-e1f9-4ff3-b3e6-8f21213b4724.jpg?1562584502',
    manaValue: 1,
    colors: 'G',
    type: 'Instant',
    stats: { popularity: 62, synergies: 98, decks: 1456 },
  },
  {
    id: '9',
    name: 'Dark Ritual',
    imageUrl: 'https://images.scryfall.io/cards/large/front/1/d/1d79e5a6-de8c-4c3d-82b3-aceb9d08cb74.jpg?1599765439',
    manaValue: 1,
    colors: 'B',
    type: 'Instant',
    stats: { popularity: 87, synergies: 212, decks: 3967 },
  },
  {
    id: '10',
    name: 'Braids, Cabal Minion',
    imageUrl: 'https://images.scryfall.io/cards/large/front/2/7/27691efa-052d-4afe-b112-fcafaf2e1c82.jpg?1626100340',
    manaValue: 3,
    colors: 'B',
    type: 'Creature',
    stats: { popularity: 71, synergies: 156, decks: 2234 },
  },
]

export default function CardsPage() {
  const [filters, setFilters] = useState({
    searchQuery: '',
  })

  // Filter and search cards
  const filteredCards = useMemo(() => {
    return ALL_CARDS.filter((card) => {
      // Search query
      if (
        filters.searchQuery &&
        !card.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [filters])

  return (
    <main style={{ minHeight: 'calc(100vh - 60px)', background: '#1a1a2e', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
            Magic Cards
          </h1>
          <p style={{ color: '#b0b0c0', fontSize: '1rem' }}>
            Showing {filteredCards.length} cards {filters.searchQuery && `matching "${filters.searchQuery}"`}
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search cards..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        {/* Results */}
        {filteredCards.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1.5rem',
            justifyItems: 'center'
          }}>
            {filteredCards.map((card) => (
              <div key={card.id} style={{ textAlign: 'center' }}>
                <img 
                  src={card.imageUrl} 
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
                <p style={{ fontSize: '0.9rem', color: '#e0e0e0', marginTop: '0.5rem' }}>
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
              No cards found
            </h2>
            <p style={{ color: '#b0b0c0' }}>
              Try adjusting your search query.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}