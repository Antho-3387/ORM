'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Card {
  id: string
  name: string
  type_line: string
  mana_value?: number
  rarity?: string
}

interface PageData {
  data: Card[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
  query: string | null
}

// Skeleton loader component
const CardSkeleton = () => (
  <div style={{
    width: '150px',
    height: '200px',
    background: '#2a2a3e',
    borderRadius: '4px',
    border: '1px solid #404050',
    animation: 'pulse 2s infinite',
    margin: '0.5rem'
  }} />
)

// Card component
const CardItem = ({ card }: { card: Card }) => (
  <div style={{
    width: '150px',
    padding: '0.5rem',
    textAlign: 'center',
    color: '#e0e0e0'
  }}>
    <div style={{
      background: '#2a2a3e',
      borderRadius: '4px',
      border: '1px solid #404050',
      padding: '0.75rem',
      minHeight: '180px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600' }}>
          {card.name}
        </h4>
        <p style={{ margin: '0.25rem 0', fontSize: '0.7rem', color: '#b0b0c0' }}>
          {card.type_line}
        </p>
      </div>
      <div style={{ fontSize: '0.7rem', color: '#808090' }}>
        {card.mana_value !== undefined && <span>CMC: {card.mana_value}</span>}
        {card.rarity && <span> • {card.rarity}</span>}
      </div>
    </div>
  </div>
)

export default function CardsPageVirtual() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'mana' | 'rarity'>('name')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [visibleStart, setVisibleStart] = useState(0)
  const pageSize = 50

  const containerRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Fetch cards function
  const fetchCards = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (loading) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(pageSize),
        sort: sortBy,
        ...(searchQuery && { q: searchQuery })
      })

      const response = await fetch(`/api/cards/paginated?${params}`)
      const data: PageData = await response.json()

      setCards(reset ? data.data : prev => [...prev, ...data.data])
      setHasMore(data.hasMore)
      setTotal(data.total)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, pageSize, sortBy, searchQuery])

  // Initial load
  useEffect(() => {
    fetchCards(0, true)
  }, [])

  // Search/sort handler
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCards([])
    setPage(0)
    setHasMore(true)
    setVisibleStart(0)
  }

  const handleSort = (newSort: 'name' | 'mana' | 'rarity') => {
    setSortBy(newSort)
    setCards([])
    setPage(0)
    setVisibleStart(0)
  }

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchCards(page + 1)
        }
      },
      { rootMargin: '500px' }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [page, hasMore, loading, fetchCards])

  // Handle scroll for virtualization
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop
    const itemsPerRow = 6
    const itemHeight = 240
    const rowHeight = itemHeight
    
    const visibleRowCount = Math.ceil((e.currentTarget.clientHeight) / rowHeight)
    const startRow = Math.floor(scrollTop / rowHeight)
    const startIndex = startRow * itemsPerRow
    
    setVisibleStart(Math.max(0, startIndex - itemsPerRow))
  }

  // Simple virtualization: only render visible cards + buffer
  const itemsPerRow = 6
  const itemsToRender = 24 // Show ~4 rows visible + buffers
  const visibleCards = cards.slice(visibleStart, visibleStart + itemsToRender)
  const emptySlots = Math.max(0, itemsToRender - visibleCards.length)

  return (
    <main style={{ minHeight: 'calc(100vh - 60px)', background: '#1a1a2e', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
            Magic Cards Explorer
          </h1>
          <p style={{ color: '#b0b0c0' }}>
            {loading ? 'Loading...' : `${cards.length} of ${total} cards`}
          </p>
        </div>

        {/* Filters */}
        <div style={{
          background: '#2a2a3e',
          border: '1px solid #404050',
          borderRadius: '6px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', color: '#e0e0e0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or type..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#1a1a2e',
                border: '1px solid #404050',
                borderRadius: '4px',
                color: '#e0e0e0',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Sort */}
          <div>
            <label style={{ display: 'block', color: '#e0e0e0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as 'name' | 'mana' | 'rarity')}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#1a1a2e',
                border: '1px solid #404050',
                borderRadius: '4px',
                color: '#e0e0e0',
                fontSize: '1rem'
              }}
            >
              <option value="name">Name</option>
              <option value="mana">Mana Cost</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>
        </div>

        {/* Cards Grid with Simple Virtualization */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '1rem',
            background: '#2a2a3e',
            borderRadius: '6px',
            maxHeight: '600px',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {visibleCards.length > 0 ? (
            visibleCards.map(card => (
              <CardItem key={card.id} card={card} />
            ))
          ) : (
            Array.from({ length: 12 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          )}

          {/* Render empty slots to maintain scroll position */}
          {emptySlots > 0 && Array.from({ length: Math.min(emptySlots, 6) }).map((_, i) => (
            <div key={`empty-${i}`} style={{ width: '150px', height: '200px' }} />
          ))}
        </div>

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} style={{ padding: '2rem', textAlign: 'center' }}>
          {loading && (
            <p style={{ color: '#b0b0c0' }}>Loading more cards...</p>
          )}
          {!hasMore && cards.length > 0 && (
            <p style={{ color: '#b0b0c0' }}>All {total} cards loaded!</p>
          )}
        </div>

        {/* Global styles for animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.9; }
          }
        `}</style>
      </div>
    </main>
  )
}
