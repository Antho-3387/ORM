'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/app/components/ui/Navbar'
import { Button } from '@/app/components/ui/Button'
import { DeckCard } from '@/app/components/deck/DeckCard'

interface Deck {
  id: string
  name: string
  description?: string
  cards: any[]
  createdAt: string
}

export default function DecksPage() {
  const router = useRouter()
  const [decks, setDecks] = useState<Deck[]>([])
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(storedUser))
    fetchDecks()
  }, [router])

  const fetchDecks = async () => {
    try {
      const userId = localStorage.getItem('userId')
      const res = await fetch('/api/decks', {
        headers: {
          'x-user-id': userId || '',
        },
      })
      if (res.ok) {
        setDecks(await res.json())
      }
    } catch (error) {
      console.error('Error fetching decks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce deck?')) return

    try {
      const userId = localStorage.getItem('userId')
      const res = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId || '',
        },
      })

      if (res.ok) {
        setDecks(decks.filter((d) => d.id !== deckId))
      }
    } catch (error) {
      console.error('Error deleting deck:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userId')
    router.push('/login')
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mes Decks</h1>
          <Link href="/dashboard/decks/create">
            <Button>+ Créer un Deck</Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Chargement...</p>
        ) : decks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Vous n'avez pas encore de decks</p>
            <Link href="/dashboard/decks/create">
              <Button>Créer votre premier deck</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                id={deck.id}
                name={deck.name}
                description={deck.description}
                cardCount={deck.cards.length}
                createdAt={deck.createdAt}
                onDelete={handleDeleteDeck}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
