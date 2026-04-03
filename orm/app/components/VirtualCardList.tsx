'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { CardInfo } from '@/lib/deck-parser'
import { Loader2 } from 'lucide-react'

/**
 * CONCEPT: VIRTUALISATION
 * 
 * Problème: Afficher 1000 cartes dans le DOM = lag immédiat
 * 
 * Solution: 
 * - Rendre SEULEMENT les cartes visibles à l'écran (env 10-15)
 * - Garder une "fenêtre" virtuelle qui se déplace lors du scroll
 * - Les cartes en dehors sont temporairement supprimées du DOM
 * 
 * Avantage: Lisse comme du beurre même avec 10,000 cartes!
 */

interface VirtualCardListProps {
  cards: CardInfo[]
  loading?: boolean
  onProgressUpdate?: (loaded: number) => void
}

// Composante MÉMORISÉE pour une seule ligne du tableau
// React.memo = ne re-render que si les props changent (pas le parent)
const CardRow = React.memo(({ card }: { card: CardInfo }) => (
  <tr style={{ borderBottom: '1px solid #404050' }}>
    <td style={{ padding: '0.75rem', fontWeight: '600', color: '#ff6b6b', width: '60px' }}>
      {card.quantity}
    </td>
    <td style={{ padding: '0.75rem' }}>
      {card.name}
    </td>
  </tr>
))
CardRow.displayName = 'CardRow'

export function VirtualCardList({ cards, loading, onProgressUpdate }: VirtualCardListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery')

  // ============================================================
  // OPTIMISATION RENDU: VirtualizerProvider - seulement re-rend les cartes visibles
  // ============================================================
  
  // Initialiser le virtualizer pour le mode liste
  const rowVirtualizer = useVirtualizer({
    count: cards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 61, []), // Hauteur estimée de chaque ligne
    overscan: 10, // Pré-charger 10 lignes avant/après la fenêtre (smooth scroll)
  })

  // ============================================================
  // OPTIMISATION RENDU: Calcul des cartes avec images
  // useMemo = ne recalcule que si cards change
  // ============================================================
  
  const cardsWithImages = useMemo(
    () => cards.filter(c => c.imageUrl).length,
    [cards]
  )

  // ============================================================
  // OPTIMISATION RENDU: Callback mémorisé pour la copie
  // useCallback = fonction stable qui ne se crée pas à chaque render
  // Évite les re-renders du child component
  // ============================================================
  
  const handleCopyDecklist = useCallback(async () => {
    const decklistText = cards
      .map(c => `${c.quantity} ${c.name}`)
      .join('\n')
    
    try {
      await navigator.clipboard.writeText(decklistText)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [cards])

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#a0a0b0' }}>
        {loading ? 'Chargement des cartes...' : 'Aucune carte trouvée'}
      </div>
    )
  }

  return (
    <div>
      {/* HEADER avec info et buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>
          Cartes ({cards.length}) {loading && `- Chargement ${cardsWithImages}/${cards.length}`}
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleCopyDecklist}
            style={{
              padding: '0.5rem 1rem',
              background: '#404050',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}
          >
            Copier
          </button>

          <button
            onClick={() => setViewMode('gallery')}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'gallery' ? '#3b82f6' : '#404050',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Galerie
          </button>

          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'list' ? '#3b82f6' : '#404050',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Liste
          </button>
        </div>
      </div>

      {/* ============================================================
          MODE GALERIE - Images
          ============================================================ */}
      {viewMode === 'gallery' && (
        <GalleryView cards={cards} loading={loading} />
      )}

      {/* ============================================================
          MODE LISTE VIRTUALISÉE - Tableau ultra-optimisé
          
          KEY CONCEPT:
          - Au lieu de rendre <Card /> pour chaque carte (lag)
          - On rend seulement celles visibles dans le "viewport"
          - Le virtualizer gère le scroll automatiquement
          ============================================================ */}
      {viewMode === 'list' && (
        <div
          ref={parentRef}
          style={{
            background: '#0f3460',
            borderRadius: '8px',
            height: '600px', // Fenêtre fixe = virtualisation possible
            overflow: 'auto',
            border: '1px solid #404050',
          }}
        >
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: '#e0e0e0',
          }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid #404050',
                  position: 'sticky',
                  top: 0,
                  background: '#0f3460',
                  zIndex: 10,
                }}
              >
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#3b82f6', fontWeight: '600' }}>
                  Qty
                </th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#3b82f6', fontWeight: '600' }}>
                  Carte
                </th>
              </tr>
            </thead>
            <tbody style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}>
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const card = cards[virtualItem.index]
                return (
                  <tr
                    key={virtualItem.key}
                    style={{
                      transform: `translateY(${virtualItem.start}px)`,
                      position: 'absolute',
                      width: '100%',
                      borderBottom: '1px solid #404050',
                    }}
                  >
                    <td style={{ padding: '0.75rem', fontWeight: '600', color: '#ff6b6b', width: '60px' }}>
                      {card.quantity}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {card.name}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Total */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#0f3460', borderRadius: '8px', color: '#a0a0b0', fontSize: '0.9rem' }}>
        <p>Total: <strong style={{ color: '#3b82f6' }}>{cards.reduce((sum, c) => sum + c.quantity, 0)}</strong> cartes</p>
      </div>
    </div>
  )
}

/**
 * Vue Galerie avec Lazy Loading d'images
 * 
 * CONCEPT: LAZY LOADING
 * - Ne charger les images que quand elles deviennent visibles
 * - Utilise IntersectionObserver API du navigateur
 */
function GalleryView({ cards, loading }: { cards: CardInfo[]; loading?: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {cards.map((card, idx) => (
        <LazyCardImage key={`${card.name}-${idx}`} card={card} />
      ))}
    </div>
  )
}

/**
 * Vue d'une carte avec Lazy Loading via API
 * 
 * CORRECTION CORS:
 * - Ne charge plus les images côté client (CORS bloqué par Scryfall)
 * - Appelle /api/cards/image?name=CardName au lieu de Scryfall direct
 * - Cette API route appelle Scryfall côté SERVEUR (pas de CORS!)
 * 
 * IntersectionObserver = API native du navigateur
 * Détecte quand l'élément devient visible = charge l'image
 */
function LazyCardImage({ card }: { card: CardInfo }) {
  const [isVisible, setIsVisible] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Créer un observateur pour détecter quand l'élément est visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Une fois visible, arrêter l'observation
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '50px' } // Charger 50px avant d'être visible (smooth UX)
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  // Charger l'image quand elle devient visible
  useEffect(() => {
    if (!isVisible) return

    const loadImage = async () => {
      try {
        const response = await fetch(`/api/cards/image?name=${encodeURIComponent(card.name)}`)
        const data = await response.json()
        
        if (data.imageUrl) {
          setImageUrl(data.imageUrl)
        } else {
          setImageError(true)
        }
      } catch (error) {
        console.error(`Error loading image for ${card.name}:`, error)
        setImageError(true)
      }
    }

    loadImage()
  }, [isVisible, card.name])

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
      }}
    >
      {/* Skeleton Loader: affiche une animation pendant le chargement */}
      {!isVisible || !imageUrl ? (
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #1a3a52 0%, #0f3460 50%, #1a3a52 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
        }} />
      ) : imageError ? (
        <div style={{ color: '#a0a0b0', textAlign: 'center', padding: '1rem' }}>
          📷 Non trouvée
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={card.name}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Quantité badge */}
      {card.quantity > 1 && imageUrl && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: '#ff6b6b',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '700',
          }}
        >
          x{card.quantity}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 200% 50%; }
          50% { background-position: -200% 50%; }
        }
      `}</style>
    </div>
  )
}
