'use client'

import React, { useState, useEffect } from 'react'
import { parseDecklist, fetchAllCardImages, CardInfo } from '@/lib/deck-parser'

interface CardGalleryProps {
  deckList: string
}

export function CardGallery({ deckList }: CardGalleryProps) {
  const [cards, setCards] = useState<CardInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadedCount, setLoadedCount] = useState(0)
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('gallery')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true)
        setLoadedCount(0)
        
        // Parser seulement
        const parsed = parseDecklist(deckList)
        if (parsed.length === 0) {
          setCards([])
          setLoading(false)
          return
        }

        // Afficher d'abord les cartes sans images
        setCards(parsed)

        // Charger les images progressivement
        const withImages = await fetchAllCardImages(parsed, (count) => {
          setLoadedCount(count)
        })
        setCards(withImages)
        setLoadedCount(withImages.filter(c => c.imageUrl).length)
      } catch (error) {
        console.error('Error loading cards:', error)
        setLoadedCount(0)
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [deckList])

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#a0a0b0' }}>
        {loading ? 'Chargement des cartes...' : 'Aucune carte trouvée'}
      </div>
    )
  }

  const cardsWithImages = cards.filter(c => c.imageUrl).length

  const handleCopyDecklist = async () => {
    try {
      await navigator.clipboard.writeText(deckList)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>
          Cartes ({cards.length}) {loading && `- Chargement ${cardsWithImages}/${cards.length}`}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleCopyDecklist}
            style={{
              padding: '0.5rem 1rem',
              background: copied ? '#51cf66' : '#404050',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}
          >
            {copied ? '✓ Copié!' : 'Copier'}
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
              fontSize: '0.9rem'
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
              fontSize: '0.9rem'
            }}
          >
            Liste
          </button>
        </div>
      </div>

      {viewMode === 'gallery' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1.5rem'
        }}>
          {cards.map((card, idx) => (
            <CardImage key={idx} card={card} />
          ))}
        </div>
      ) : (
        <div style={{ background: '#0f3460', borderRadius: '8px', padding: '1.5rem', overflow: 'auto', maxHeight: '600px' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: '#e0e0e0'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #404050', position: 'sticky', top: 0, background: '#0f3460' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#3b82f6', fontWeight: '600' }}>Qty</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#3b82f6', fontWeight: '600' }}>Carte</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #404050' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '600', color: '#ff6b6b', width: '60px' }}>
                    {card.quantity}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {card.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#0f3460', borderRadius: '8px', color: '#a0a0b0', fontSize: '0.9rem' }}>
        <p>Total: <strong style={{ color: '#3b82f6' }}>{cards.reduce((sum, c) => sum + c.quantity, 0)}</strong> cartes</p>
      </div>
    </div>
  )
}

function CardImage({ card }: { card: CardInfo }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div style={{ textAlign: 'center' }}>
      {card.imageUrl && !imageError ? (
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          <img
            src={card.imageUrl}
            alt={card.name}
            style={{
              width: '100%',
              height: '250px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '2px solid #404050',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onError={() => setImageError(true)}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'
              ;(e.currentTarget as HTMLImageElement).style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)'
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'
              ;(e.currentTarget as HTMLImageElement).style.boxShadow = 'none'
            }}
          />
          {card.quantity > 1 && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: '#ff6b6b',
              color: '#fff',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
            }}>
              {card.quantity}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          width: '100%',
          height: '250px',
          background: '#0f3460',
          borderRadius: '8px',
          border: '2px solid #404050',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a0a0b0',
          fontSize: '0.75rem',
          textAlign: 'center',
          padding: '1rem'
        }}>
          📷 Non trouvée
        </div>
      )}
      <p style={{ fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '0.25rem', marginTop: '0.5rem', wordWrap: 'break-word', minHeight: '2.4em' }}>
        {card.name}
      </p>
      {card.quantity > 1 && (
        <p style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '600' }}>
          ×{card.quantity}
        </p>
      )}
    </div>
  )
}
