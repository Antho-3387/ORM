'use client'

import Link from 'next/link'
import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface Deck {
  id: string
  name: string
  list: string
  userId: string
  description?: string
  createdAt: string
}

interface DeckEditPageProps {
  params: Promise<{ id: string }>
}

export default function DeckEditPage({ params }: DeckEditPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()

  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [list, setList] = useState('')

  useEffect(() => {
    loadDeck()
  }, [id])

  const loadDeck = async () => {
    try {
      setLoading(true)
      const { data, error: dbError } = await supabase
        .from('Deck')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (dbError || !data) {
        setError('Deck non trouvé')
        return
      }

      // Vérifier que l'utilisateur est le propriétaire
      if (data.userId !== user?.id) {
        setError('Vous ne pouvez pas éditer ce deck')
        return
      }

      setDeck(data as Deck)
      setName(data.name)
      setDescription(data.description || '')
      setList(data.list || '')
    } catch (err) {
      console.error('Error loading deck:', err)
      setError('Erreur lors du chargement du deck')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Le nom du deck est requis')
      return
    }

    if (!list.trim()) {
      setError('La decklist est requise')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: dbError } = await supabase
        .from('Deck')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          list: list.trim(),
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)

      if (dbError) {
        setError('Erreur lors de la sauvegarde: ' + dbError.message)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/decks/${id}`)
      }, 1500)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#1a1a2e', padding: '2rem' }}>
        <div style={{ textAlign: 'center', color: '#a0a0a0' }}>
          Chargement...
        </div>
      </main>
    )
  }

  if (error && !deck) {
    return (
      <main style={{ minHeight: '100vh', background: '#1a1a2e', padding: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/decks">
            <button style={{ background: '#404050', marginBottom: '2rem' }}>
              ← Retour aux decks
            </button>
          </Link>
          <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '2rem' }}>
            {error}
          </div>
        </div>
      </main>
    )
  }

  if (!deck) {
    return (
      <main style={{ minHeight: '100vh', background: '#1a1a2e', padding: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/decks">
            <button style={{ background: '#404050', marginBottom: '2rem' }}>
              ← Retour aux decks
            </button>
          </Link>
          <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '2rem' }}>
            Deck non trouvé
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#1a1a2e', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href={`/decks/${id}`}>
          <button style={{ background: '#404050', marginBottom: '2rem' }}>
            ← Retour au deck
          </button>
        </Link>

        <div style={{
          background: '#16213e',
          border: '1px solid #404050',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#ffffff', marginBottom: '2rem' }}>
            Éditer "{deck.name}"
          </h1>

          {error && (
            <div style={{
              background: '#ff6b6b',
              color: '#fff',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#51cf66',
              color: '#fff',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              ✓ Deck sauvegardé! Redirection en cours...
            </div>
          )}

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#ffffff'
              }}>
                Nom du Deck
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du deck"
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '1px solid #404050',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#ffffff'
              }}>
                Description (optionnel)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Stratégie du deck..."
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '1px solid #404050',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#ffffff'
              }}>
                Decklist
              </label>
              <p style={{ fontSize: '0.9rem', color: '#a0a0b0', marginBottom: '0.5rem' }}>
                Format: Quantité + Nom (ex: "1 Atraxa, Praetors' Voice")
              </p>
              <textarea
                value={list}
                onChange={(e) => setList(e.target.value)}
                placeholder="1 Atraxa, Praetors' Voice&#10;1 Sol Ring&#10;..."
                disabled={saving}
                style={{
                  width: '100%',
                  height: '300px',
                  padding: '0.75rem',
                  background: '#0f3460',
                  border: '1px solid #404050',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: success ? '#51cf66' : '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? 'Sauvegarde en cours...' : success ? 'Sauvegardé!' : 'Sauvegarder'}
              </button>
              <Link href={`/decks/${id}`}>
                <button
                  type="button"
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#404050',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  Annuler
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
