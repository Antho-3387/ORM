'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function CreateDeckPage() {
  const [deckName, setDeckName] = useState('')
  const [deckDescription, setDeckDescription] = useState('')
  const [deckList, setDeckList] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Vous devez être connecté pour créer un deck')
      return
    }

    if (!deckName.trim()) {
      setError('Entrez le nom du deck')
      return
    }

    if (!deckList.trim()) {
      setError('Entrez la decklist')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Créer les données du deck
      const deckData = {
        name: deckName.trim(),
        description: deckDescription.trim() || null,
        list: deckList.trim(),
        userId: user.id,
      }

      // Insérer le deck via Supabase
      const { data: insertedData, error: insertError } = await supabase
        .from('Deck')
        .insert([deckData])
        .select()
        .maybeSingle()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error(insertError.message || 'Erreur lors de la sauvegarde')
      }

      if (!insertedData) {
        throw new Error('Impossible de créer le deck')
      }

      console.log('Deck créé:', insertedData)
      setSaved(true)
      
      setTimeout(() => {
        setSaved(false)
        setDeckName('')
        setDeckDescription('')
        setDeckList('')
        router.push('/decks')
      }, 1500)
    } catch (err: any) {
      console.error('Erreur création deck:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      <Link href="/decks">
        <button style={{ background: '#404050', marginBottom: '2rem' }}>
          Retour
        </button>
      </Link>

      <h1>Créer un Deck</h1>

      {!user && (
        <div style={{
          background: '#ff6b6b',
          color: '#fff',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '2rem'
        }}>
          Vous devez être connecté pour créer un deck.{' '}
          <Link href="/auth" style={{ color: '#fff', textDecoration: 'underline' }}>
            Connectez-vous
          </Link>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div>
          <label style={{ display: 'block', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Nom du Deck
          </label>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Ex: Ma Deck Atraxa"
            disabled={loading}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Description (optionnel)
          </label>
          <input
            type="text"
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
            placeholder="Stratégie du deck..."
            disabled={loading}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Decklist (Format: Quantité + Nom)
          </label>
          <p style={{ fontSize: '0.9rem', color: '#a0a0b0', marginBottom: '1rem' }}>
            Exemple: 1 Atraxa, Praetors' Voice
          </p>
          <textarea
            value={deckList}
            onChange={(e) => setDeckList(e.target.value)}
            placeholder="1 Atraxa, Praetors' Voice&#10;1 Sol Ring&#10;1 Counterspell&#10;..."
            disabled={loading}
          />
        </div>

        {error && (
          <div style={{
            background: '#ff6b6b',
            color: '#fff',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        <div>
          <button type="submit" disabled={loading || !user}>
            {loading ? 'Sauvegarde en cours...' : saved ? 'Sauvegardé!' : 'Sauvegarder le Deck'}
          </button>
          <Link href="/decks">
            <button type="button" style={{ background: '#404050', marginLeft: '0' }} disabled={loading}>
              Annuler
            </button>
          </Link>
        </div>
      </form>

      <div style={{ 
        background: '#2a3a4e', 
        border: '1px solid #404050', 
        padding: '2rem', 
        borderRadius: '8px',
        marginTop: '3rem'
      }}>
        <h3>Format Commander</h3>
        <p>
          • 100 cartes total<br/>
          • 1 seule copie de chaque carte (sauf terrains de base)<br/>
          • 1 commander légendaire<br/>
          • Seulement les cartes légales en EDH
        </p>
      </div>
    </main>
  )
}
