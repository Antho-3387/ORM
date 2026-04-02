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

      // Normalize user field from array to object
      const normalizedData = (data || []).map((deck: any) => ({
        ...deck,
        user: Array.isArray(deck.user) ? deck.user[0] : deck.user
      }))

      setDecks(normalizedData as Deck[])
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

