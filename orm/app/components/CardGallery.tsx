'use client'

import React, { useState, useEffect } from 'react'
import { parseDecklist, fetchAllCardImages, CardInfo } from '@/lib/deck-parser'

interface CardGalleryProps {
  deckList: string
}

export function CardGallery({ deckList }: CardGalleryProps) {
  const [cards, setCards] = useState<CardInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('gallery')

  useEffect(() => {
    loadCards()
  }, [deckList])

  const loadCards = async () => {
    try {
      setLoading(true)
      const parsed = parseDecklist(deckList)
      const withImages = await fetchAllCardImages(parsed)
      setCards(withImages)
    } catch (error) {
      console.error('Error loading cards:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#a0a0b0' }}>
        Chargement des images des cartes...
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>
          Cartes ({cards.length})
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          gap: '1rem'
        }}>
          {cards.map((card, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              {card.imageUrl ? (
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
                      transition: 'transform 0.2s',
                    }}
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'
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
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1rem'
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
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  padding: '1rem'
                }}>
                  Image non trouvée
                </div>
              )}
              <p style={{ fontSize: '0.9rem', color: '#a0a0b0', marginBottom: '0.25rem', wordWrap: 'break-word' }}>
                {card.name}
              </p>
              {card.quantity > 1 && (
                <p style={{ fontSize: '0.8rem', color: '#3b82f6' }}>
                  ×{card.quantity}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#0f3460', borderRadius: '8px', padding: '1.5rem' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: '#e0e0e0'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #404050' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#3b82f6' }}>Quantité</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#3b82f6' }}>Carte</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #404050' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '600', color: '#ff6b6b' }}>
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
