'use client'

import Link from 'next/link'
import { use, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { DeckCardLoader } from '@/app/components/DeckCardLoader'

interface Deck {
  id: string
  name: string
  list: string
  userId: string
  user?: { email: string; name: string }
  createdAt: string
}

interface DeckDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function DeckDetailsPage({ params }: DeckDetailsPageProps) {
  const { id } = use(params)
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadDeck()
  }, [id])

  const loadDeck = async () => {
    try {
      setLoading(true)
      const { data, error: dbError } = await supabase
        .from('Deck')
        .select('id,name,list,userId,createdAt,user:User(email,name)')
        .eq('id', id)
        .single()

      if (dbError) {
        setError('Deck non trouvé')
        return
      }

      // Normalize user
      const normalizedDeck = {
        ...data,
        user: Array.isArray(data.user) ? data.user[0] : data.user
      }

      setDeck(normalizedDeck as Deck)
    } catch (err) {
      console.error('Error loading deck:', err)
      setError('Erreur lors du chargement du deck')
    } finally {
      setLoading(false)
    }
  }

  const countCards = (list: string) => {
    return list.split('\n').filter(line => line.trim() && /^\d+\s+/.test(line.trim())).length
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#1a1a2e', padding: '2rem' }}>
        <div style={{ textAlign: 'center', color: '#a0a0a0' }}>Chargement...</div>
      </main>
    )
  }

  if (error || !deck) {
    return (
      <main style={{ minHeight: '100vh', background: '#1a1a2e', padding: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/decks">
            <button style={{ background: '#404050', marginBottom: '2rem' }}>← Retour aux decks</button>
          </Link>
          <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '2rem' }}>
            {error || 'Deck non trouvé'}
          </div>
        </div>
      </main>
    )
  }

  const cardCount = countCards(deck.list)
  const isOwner = user?.id === deck.userId

  return (
    <main style={{ minHeight: '100vh', background: '#1a1a2e', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Link href="/decks">
          <button style={{ background: '#404050', marginBottom: '2rem' }}>← Retour aux decks</button>
        </Link>

        <div style={{ background: '#16213e', border: '1px solid #404050', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
            {deck.name}
          </h1>
          <p style={{ color: '#a0a0a0', marginBottom: '1rem' }}>
            Créé par {deck.user?.name || deck.user?.email || 'Utilisateur inconnu'}<br/>
            {new Date(deck.createdAt).toLocaleDateString('fr-FR')}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{ background: '#0f3460', padding: '1rem', borderRadius: '6px' }}>
              <p style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>Total de cartes</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#00d4ff' }}>{cardCount}</p>
            </div>
          </div>

          {isOwner && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <Link href={`/decks/${deck.id}/edit`} style={{
                padding: '0.75rem 1.5rem',
                background: '#00d4ff',
                color: '#000',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
              }}>
                Éditer
              </Link>
            </div>
          )}
        </div>

        {/* Card Gallery - Virtualisé et optimisé */}
        <div style={{ background: '#16213e', border: '1px solid #404050', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
          <DeckCardLoader deckList={deck.list} />
        </div>
      </div>
    </main>
  )
}
