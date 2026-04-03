'use client'

import Link from 'next/link'
import React from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function Home() {
  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1>Commander Decks</h1>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem', color: '#b0b0c0' }}>
        Créez, gérez et sauvegardez vos decks Commander Magic: The Gathering. 
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        <Link href="/decks/create">
          <button>
            Créer un Deck
          </button>
        </Link>
        <Link href="/decks">
          <button style={{ background: '#404050' }}>
            Mes Decks
          </button>
        </Link>
      </div>

      {/* Section Mes Decks */}
      <div style={{ 
        background: '#2a3a4e', 
        border: '1px solid #404050', 
        padding: '2rem', 
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2>Mes Decks Récents</h2>
        <DecksPreview />
      </div>

      <div style={{ 
        background: '#2a3a4e', 
        border: '1px solid #404050', 
        padding: '2rem', 
        borderRadius: '8px'
      }}>
        <h2>Commencer</h2>
        <p>
          Cliquez sur le bouton "Créer un Deck" pour démarrer. 
          Vous pouvez ensuite coller votre decklist au format Commander 
          et la sauvegarder.
        </p>
      </div>
    </main>
  )
}

function DecksPreview() {
  const [decks, setDecks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const { user } = useAuth()

  React.useEffect(() => {
    if (user) {
      loadDecks()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadDecks = async () => {
    try {
      setLoading(true)
      setError('')

      // Récupérer les 3 derniers decks de l'utilisateur
      const { data, error: dbError } = await supabase
        .from('Deck')
        .select('id,name,list,userId,createdAt')
        .eq('userId', user?.id)
        .order('createdAt', { ascending: false })
        .limit(3)

      if (dbError) {
        console.error('Error loading decks:', dbError)
        setError('Erreur lors du chargement des decks')
        return
      }

      setDecks(data || [])
    } catch (err: any) {
      console.error('Error:', err)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const countCards = (list: string) => {
    if (!list) return 0
    return list.split('\n').filter(line => line.trim() && /^\d+\s+/.test(line.trim())).length
  }

  if (loading) {
    return (
      <p style={{ color: '#a0a0b0' }}>
        Chargement...
      </p>
    )
  }

  if (!user) {
    return (
      <p style={{ color: '#a0a0b0' }}>
        Connectez-vous pour voir vos decks!{' '}
        <Link href="/auth" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
          Se connecter
        </Link>
      </p>
    )
  }

  if (error) {
    return (
      <p style={{ color: '#ff6b6b' }}>
        {error}
      </p>
    )
  }

  if (decks.length === 0) {
    return (
      <p style={{ color: '#a0a0b0' }}>
        Aucun deck sauvegardé. Créez votre premier deck pour commencer!
      </p>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {decks.map((deck) => (
        <div
          key={deck.id}
          style={{
            background: '#1a1a2e',
            border: '1px solid #404050',
            borderRadius: '6px',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.25rem' }}>
              {deck.name}
            </h3>
            <p style={{ color: '#a0a0b0', fontSize: '0.9rem' }}>
              {countCards(deck.list)} cartes
            </p>
          </div>
          <Link href={`/decks/${deck.id}`}>
            <button style={{ background: '#3b82f6' }}>Voir</button>
          </Link>
        </div>
      ))}
    </div>
  )
}
