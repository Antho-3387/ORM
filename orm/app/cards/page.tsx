'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Search } from 'lucide-react'

/**
 * PAGE: /cards - GALERIE OPTIMISÉE
 * 
 * ✅ APPROCHE:
 * 1. Une seule requête: chargement COMPLET de toutes les cartes au mount
 * 2. Dedupliquées par ID (zéro doublon)
 * 3. Virtualisation du rendu: max 20-30 cartes dans le DOM
 * 4. Filtrage côté CLIENT (pas API)
 * 5. Lazy loading images seulement
 *
 * Résultat: ~1000+ cartes → parfaitement fluide ✨
 */

interface Card {
  id: string
  name: string
  imageUrl?: string
  type: string
  manaValue?: number
  colors?: string[]
}

export default function CardsGalleryPage() {
  // STATE: Données
  const [allCards, setAllCards] = useState<Card[]>([]) // TOUTES les cartes
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // STATE: Recherche
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // ============================================================
  // ÉTAPE 1: Charger TOUTES les cartes au MOUNT (une seule fois)
  // ============================================================
  useEffect(() => {
    const loadAllCards = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/cards/all')
        const data = await response.json()

        if (!data.success || !Array.isArray(data.data)) {
          setError('Erreur lors du chargement des cartes')
          return
        }

        console.log(`Loaded ${data.data.length} unique cards`)
        setAllCards(data.data)
      } catch (err) {
        console.error('Error loading cards:', err)
        setError('Erreur réseau - impossible de charger les cartes')
      } finally {
        setIsLoading(false)
      }
    }

    loadAllCards()
  }, []) // Dépendance vide = une seule exécution au mount

  // ============================================================
  // ÉTAPE 2: Debouncer la recherche (attendre 300ms)
  // ============================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // ============================================================
  // ÉTAPE 3: Filtrer les cartes LOCALEMENT (pas API)
  // Utiliser useMemo pour éviter les recalculs
  // ============================================================
  const filteredCards = useMemo(() => {
    if (!debouncedQuery.trim()) return allCards

    const q = debouncedQuery.toLowerCase()
    return allCards.filter(
      (card) =>
        card.name.toLowerCase().includes(q) ||
        card.type.toLowerCase().includes(q) ||
        (card.colors && card.colors.some(c => c.toLowerCase().includes(q)))
    )
  }, [allCards, debouncedQuery])

  // ============================================================
  // ÉTAPE 4: Virtualisation - Max ~20-30 cartes dans le DOM
  // ============================================================
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: filteredCards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 280, []), // Hauteur estimée
    overscan: 10, // Pré-charger 10 cartes avant/après viewport
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <main style={{ minHeight: '100vh', background: '#1a1a2e', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* HEADER */}
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          🃏 Galerie Cartes Magic
        </h1>

        {/* STATS */}
        <p
          style={{
            textAlign: 'center',
            color: '#a0a0b0',
            fontSize: '0.9rem',
            marginBottom: '2rem',
          }}
        >
          {isLoading ? (
            'Chargement des cartes...'
          ) : (
            <>
              <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                {filteredCards.length}
              </span>
              {' cartes '}
              {debouncedQuery && `trouvées | ${allCards.length} au total`}
            </>
          )}
        </p>

        {/* SEARCH BAR */}
        <div
          style={{
            marginBottom: '2rem',
            background: '#16213e',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #404050',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#a0a0b0',
              }}
            />
            <input
              type="text"
              placeholder="Chercher (nom, type, couleur...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                background: '#0f3460',
                border: '1px solid #404050',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <p
            style={{
              color: '#a0a0b0',
              fontSize: '0.85rem',
              marginTop: '0.5rem',
            }}
          >
            💡 Ex: "atraxa", "blue", "creature"
          </p>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div
            style={{
              background: '#ff6b6b',
              color: '#fff',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#a0a0b0',
              background: '#16213e',
              borderRadius: '12px',
              border: '1px solid #404050',
            }}
          >
            <p style={{ fontSize: '1.2rem' }}>Chargement des cartes...</p>
          </div>
        )}

        {/* GALLERY VIRTUALIZED */}
        {!isLoading && allCards.length > 0 && (
          <>
            <div
              ref={parentRef}
              style={{
                height: 'calc(100vh - 450px)',
                overflow: 'auto',
                border: '1px solid #404050',
                borderRadius: '12px',
                background: '#16213e',
                position: 'relative',
              }}
            >
              {/* Virtualizer container */}
              <div
                style={{
                  height: `${totalSize}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {/* Grid display */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '1rem',
                    padding: '1rem',
                  }}
                >
                  {virtualItems.map((virtualItem) => {
                    const card = filteredCards[virtualItem.index]
                    return (
                      <div
                        key={card.id} // ✅ CLEF UNIQUE PAR CARTE
                        style={{
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <CardTile card={card} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Empty search result */}
            {filteredCards.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#a0a0b0',
                  marginTop: '1rem',
                }}
              >
                <p>🔍 Aucune carte trouvée pour "{searchQuery}"</p>
              </div>
            )}
          </>
        )}

        {/* No cards at all */}
        {!isLoading && allCards.length === 0 && !error && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#a0a0b0',
              background: '#16213e',
              borderRadius: '12px',
              border: '1px solid #404050',
            }}
          >
            <p style={{ fontSize: '1.2rem' }}>❌ Aucune carte disponible</p>
          </div>
        )}
      </div>
    </main>
  )
}

/**
 * Composant: UNE CARTE
 * - Lazy load image
 * - Hover effect
 */
function CardTile({ card }: { card: Card }) {
  const [isVisible, setIsVisible] = useState(false)
  const [imageError, setImageError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Lazy load image quand la carte devient visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        aspectRatio: '2/3',
        background: '#0f3460',
        borderRadius: '8px',
        border: '1px solid #404050',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'scale(1.05)'
        el.style.borderColor = '#3b82f6'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'scale(1)'
        el.style.borderColor = '#404050'
      }}
    >
      {!isVisible || !card.imageUrl ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #1a3a52 0%, #0f3460 50%, #1a3a52 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
          }}
        />
      ) : imageError ? (
        <div
          style={{
            color: '#a0a0b0',
            textAlign: 'center',
            padding: '1rem',
            fontSize: '0.75rem',
          }}
        >
          📷 Non trouvée
        </div>
      ) : (
        <img
          src={card.imageUrl}
          alt={card.name}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Card name overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          padding: '0.5rem',
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: '600',
          maxHeight: '50%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {card.name}
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 200% 50%; }
          50% { background-position: -200% 50%; }
        }
      `}</style>
    </div>
  )
}
