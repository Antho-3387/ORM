'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

interface Deck {
  id: string
  name: string
  description?: string
  userId: string
  user?: { email: string; name: string }
  createdAt: string
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'mine'>('all')
  const { user } = useAuth()

  useEffect(() => {
    loadDecks()
  }, [user, filter])

  const loadDecks = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('Deck')
        .select(`
          id,
          name,
          description,
          userId,
          createdAt,
          user:User(email, name)
        `)

      if (filter === 'mine' && user) {
        // Use user.id directly - Supabase handles UUID comparison
        query = query.eq('userId', user.id)
      }

      const { data, error } = await query.order('createdAt', { ascending: false })

      if (error) {
        console.error('Error loading decks:', error)
        return
      }

      setDecks(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (deckId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce deck ?')) return

    try {
      const { error } = await supabase.from('Deck').delete().eq('id', deckId)
      if (error) throw error
      setDecks(decks.filter(d => d.id !== deckId))
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <main style={{ minHeight: 'calc(100vh - 60px)', background: '#1a1a2e', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ffffff' }}>Decks</h1>
          {user && (
            <Link href="/decks/create" style={{
              padding: '0.75rem 1.5rem',
              background: '#00d4ff',
              color: '#000',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
            }}>
              + Créer un deck
            </Link>
          )}
        </div>

        {user && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.75rem 1.5rem',
                background: filter === 'all' ? '#00d4ff' : '#404050',
                color: filter === 'all' ? '#000' : '#e0e0e0',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Tous les decks
            </button>
            <button
              onClick={() => setFilter('mine')}
              style={{
                padding: '0.75rem 1.5rem',
                background: filter === 'mine' ? '#00d4ff' : '#404050',
                color: filter === 'mine' ? '#000' : '#e0e0e0',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Mes decks
            </button>
          </div>
        )}

        {!user && (
          <div style={{
            background: '#16213e',
            border: '1px solid #404050',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}>
            <p style={{ color: '#a0a0a0', marginBottom: '1rem' }}>
              Connectez-vous pour créer et modifier vos décks
            </p>
            <Link href="/auth" style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#00d4ff',
              color: '#000',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
            }}>
              Se connecter
            </Link>
          </div>
        )}

        {loading ? (
          <div style={{ color: '#a0a0a0', textAlign: 'center', padding: '2rem' }}>
            Chargement...
          </div>
        ) : decks.length === 0 ? (
          <div style={{
            background: '#16213e',
            border: '1px solid #404050',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            color: '#a0a0a0',
          }}>
            {filter === 'mine' ? 'Vous n\'avez pas encore créé de deck' : 'Aucun deck n\'a été créé pour le moment'}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {decks.map(deck => (
              <div
                key={deck.id}
                style={{
                  background: '#16213e',
                  border: '1px solid #404050',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.5rem' }}>
                  {deck.name}
                </h2>
                <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  par {deck.user?.name || deck.user?.email || 'Utilisateur inconnu'}
                </p>
                {deck.description && (
                  <p style={{ color: '#c0c0c0', marginBottom: '1rem', lineHeight: '1.5', flex: 1 }}>
                    {deck.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                  <Link href={`/decks/${deck.id}`} style={{
                    flex:1,
                    textAlign: 'center',
                    padding: '0.5rem 1rem',
                    background: '#00d4ff',
                    color: '#000',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}>
                    Voir
                  </Link>
                  {user?.id === deck.userId && (
                    <>
                      <Link href={`/decks/${deck.id}/edit`} style={{
                        padding: '0.5rem 1rem',
                        background: '#404050',
                        color: '#e0e0e0',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                      }}>
                        Éditer
                      </Link>
                      <button
                        onClick={() => handleDelete(deck.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#ff6b6b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDeckId, setExpandedDeckId] = useState<number | null>(null)
  const [cardImages, setCardImages] = useState<Map<string, string | null>>(new Map())
  const loadedDecksRef = useRef<Set<number>>(new Set())

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

  // Charger les images du deck quand on l'ouvre (lazy loading avec IntersectionObserver)
  useEffect(() => {
    if (expandedDeckId === null) return

    let observer: IntersectionObserver | null = null

    // Petit délai pour que le DOM soit bien rendu
    const timeoutId = setTimeout(() => {
      // S'assurer que les placeholders existent
      const placeholders = document.querySelectorAll('[data-card-placeholder]')
      if (placeholders.length === 0) return

      // Créer l'observer
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const cardName = entry.target.getAttribute('data-card-name')
              if (cardName && !cardImages.has(cardName)) {
                loadSingleCard(cardName)
              }
            }
          })
        },
        { rootMargin: '50px' }
      )

      // Observer les placeholders
      placeholders.forEach(el => observer!.observe(el))
    }, 100)

    // Cleanup: arrêter l'observer et le timeout
    return () => {
      clearTimeout(timeoutId)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [expandedDeckId, cardImages])

  const loadSingleCard = async (cardName: string) => {
    if (cardImages.has(cardName)) return

    try {
      const response = await fetch('/api/cards/image?name=' + encodeURIComponent(cardName))
      if (response.ok) {
        const data = await response.json()
        if (data.imageUrl) {
          setCardImages(prev => new Map(prev).set(cardName, data.imageUrl))
        } else {
          setCardImages(prev => new Map(prev).set(cardName, null))
        }
      }
    } catch (error) {
      console.error(`Error loading ${cardName}:`, error)
      setCardImages(prev => new Map(prev).set(cardName, null))
    }
  }

  const handleExpandDeck = (deckId: number) => {
    if (expandedDeckId === deckId) {
      setExpandedDeckId(null)
    } else {
      setExpandedDeckId(deckId)
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
                                  data-card-placeholder
                                  data-card-name={card.name}
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
