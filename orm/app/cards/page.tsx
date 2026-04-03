'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Search } from 'lucide-react'

/**
 * PAGE: /cards
 * 
 * Galerie globale avec INFINITE SCROLL + VIRTUALISATION
 * 
 * CONCEPTS:
 * 1. INFINITE SCROLL: Charger automatiquement quand user scroll en bas
 * 2. VIRTUALISATION: Même avec 5000 cartes chargées, afficher que ~20
 * 3. RECHERCHE DEBOUNCED: Attendre 300ms avant de chercher
 * 4. LAZY LOADING: Images seulement quand visibles
 */

interface Card {
  id: string
  name: string
  imageUrl?: string
  type: string
  manaValue?: number
  colors?: string[]
}

interface ApiResponse {
  success: boolean
  data: Card[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  query: string
  cached: boolean
}

export default function CardsGalleryPage() {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  // Recherche
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Cartes et pagination
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Virtualisation
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: cards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 280, []), // Hauteur estimée d'une carte
    overscan: 20, // Pré-charger 20 cartes
  })

  // ============================================================
  // ÉTAPE 1: DEBOUNCE de la recherche
  // 
  // Quand l'user tape, on attend 300ms avant de chercher
  // Évite 100 requêtes pour "atraxa"
  // ============================================================
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setCurrentPage(1)
      setCards([])
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // ============================================================
  // ÉTAPE 2: Charger les cartes de la page actuelle
  // ============================================================
  
  const loadCards = useCallback(async (page: number, query: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '50', // 50 cartes par page
        ...(query && { q: query }),
      })

      const response = await fetch(`/api/cards/search?${params}`)
      const data: any = await response.json()

      // Vérifier si la réponse est valide et a les champs requis
      if (!data || typeof data !== 'object') {
        setError('Réponse invalide du serveur')
        return
      }

      if (!data.success) {
        setError(data.error || 'Erreur lors de la recherche')
        return
      }

      // S'assurer que les données existent et que pagination est présente
      const cardsData = Array.isArray(data.data) ? data.data : []
      const paginationData = data.pagination || { page, limit: 50, total: 0, pages: 0 }

      // ============================================================
      // INFINITE SCROLL: Ajouter les cartes (pas remplacer)
      // ============================================================
      
      if (page === 1) {
        // Première page: remplacer
        setCards(cardsData)
      } else {
        // Pages suivantes: ajouter à la fin
        setCards(prev => [...prev, ...cardsData])
      }

      setCurrentPage(page)
      setTotalPages(paginationData.pages || 0)
      setHasMore(page < (paginationData.pages || 0))
    } catch (err) {
      console.error('Error loading cards:', err)
      setError('Erreur réseau')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ============================================================
  // ÉTAPE 3: Charger quand la recherche change
  // ============================================================
  
  useEffect(() => {
    loadCards(1, debouncedQuery)
  }, [debouncedQuery, loadCards])

  // ============================================================
  // ÉTAPE 4: INFINITE SCROLL - Détecter le bas du scroll
  // 
  // Chaque fois que le virtualizer change, on vérifie si on est en bas
  // Si oui, charger la page suivante
  // ============================================================
  
  useEffect(() => {
    const [lastItem] = virtualizer.getVirtualItems().slice(-1) || []

    if (!lastItem) return

    // Vérifier si on a scrollé jusqu'au dernier item
    // et s'il y a encore des pages à charger
    if (lastItem.index >= cards.length - 1 && hasMore && !isLoading) {
      loadCards(currentPage + 1, debouncedQuery)
    }
  }, [
    virtualizer.getVirtualItems(),
    cards.length,
    hasMore,
    isLoading,
    currentPage,
    debouncedQuery,
    loadCards,
  ])

  // ============================================================
  // RENDU
  // ============================================================

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <main style={{ minHeight: '100vh', background: '#1a1a2e', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* HEADER */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          🃏 Galerie Cartes Magic
        </h1>

        {/* SEARCH BAR */}
        <div style={{
          marginBottom: '2rem',
          background: '#16213e',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #404050',
        }}>
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
              placeholder='Chercher des cartes (ex: "atraxa", "blue", "creature")...'
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
          <p style={{
            color: '#a0a0b0',
            fontSize: '0.85rem',
            marginTop: '0.5rem',
          }}>
            💡 Syntaxe Scryfall:  "!Nom exact"  |  "color:u"  |  "type:creature"
          </p>
        </div>

        {/* STATS */}
        {cards.length > 0 && (
          <div style={{
            marginBottom: '1.5rem',
            color: '#a0a0b0',
            fontSize: '0.9rem',
          }}>
            Affichage: <strong style={{ color: '#3b82f6' }}>{cards.length}</strong> cartes
            {totalPages > 1 && ` (page ${currentPage}/${totalPages})`}
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div style={{
            background: '#ff6b6b',
            color: '#fff',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        {/* VIRTUALIZED GALLERY */}
        {cards.length > 0 ? (
          <div
            ref={parentRef}
            style={{
              height: 'calc(100vh - 400px)',
              overflow: 'auto',
              border: '1px solid #404050',
              borderRadius: '12px',
              background: '#16213e',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem',
                padding: '1rem',
                height: `${totalSize}px`,
                position: 'relative',
              }}
            >
              {virtualItems.map((virtualItem) => {
                const card = cards[virtualItem.index]
                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 'calc(100% / 6 - 0.8rem)', // 6 colonnes
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <CardTile card={card} />
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#a0a0b0',
            background: '#16213e',
            borderRadius: '12px',
            border: '1px solid #404050',
          }}>
            {isLoading ? (
              <>
                <p style={{ fontSize: '1.2rem' }}>Chargement...</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '1.2rem' }}>🔍 Aucune carte trouvée</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Essaie une autre recherche
                </p>
              </>
            )}
          </div>
        )}

        {/* LOADING INDICATOR - Infinite Scroll */}
        {isLoading && cards.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#a0a0b0',
          }}>
            <p>Chargement des prochaines cartes...</p>
          </div>
        )}
      </div>
    </main>
  )
}

/**
 * Composante: UNE CARTE dans la galerie
 * 
 * Avec lazy loading d'image
 */
function CardTile({ card }: { card: Card }) {
  const [imageError, setImageError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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
        transition: 'transform 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLDivElement).style.transform = 'scale(1.05)'
        ;(e.target as HTMLDivElement).style.borderColor = '#3b82f6'
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLDivElement).style.transform = 'scale(1)'
        ;(e.target as HTMLDivElement).style.borderColor = '#404050'
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
        <div style={{
          color: '#a0a0b0',
          textAlign: 'center',
          padding: '1rem',
          fontSize: '0.75rem',
        }}>
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

      {/* NOM CARTE AU HOVER */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          padding: '0.75rem',
          color: '#ffffff',
          fontSize: '0.75rem',
          fontWeight: '600',
          maxHeight: '60px',
          overflow: 'hidden',
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
