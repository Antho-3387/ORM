'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/app/components/ui/Navbar'
import { Button } from '@/app/components/ui/Button'
import { CardComponent } from '@/app/components/card/CardComponent'

interface Deck {
  id: string
  name: string
  description?: string
  cards: Array<{
    id: string
    quantity: number
    card: {
      id: string
      name: string
      imageUrl?: string
      manaValue?: number
      colors: string[]
      type: string
    }
  }>
}

export default function DeckDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | undefined>()
  const [loading, setLoading] = useState(true)
  const [filterColor, setFilterColor] = useState<string>('')
  const [sortBy, setSortBy] = useState<'name' | 'power'>('name')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(storedUser))
    fetchDeck()
  }, [params.id, router])

  const fetchDeck = async () => {
    try {
      const res = await fetch(`/api/decks/${params.id}`)
      if (res.ok) {
        setDeck(await res.json())
      }
    } catch (error) {
      console.error('Error fetching deck:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeCard = async (cardId: string) => {
    const userId = localStorage.getItem('userId')
    try {
      await fetch(`/api/decks/${params.id}/cards`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId || '',
        },
        body: JSON.stringify({ cardId }),
      })
      fetchDeck()
    } catch (error) {
      console.error('Error removing card:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userId')
    router.push('/login')
  }

  if (loading) {
    return <p className="text-center py-8">Chargement...</p>
  }

  if (!deck) {
    return <p className="text-center py-8">Deck non trouvé</p>
  }

  let filteredCards = deck.cards

  if (filterColor) {
    filteredCards = filteredCards.filter((dc) =>
      dc.card.colors.includes(filterColor)
    )
  }

  if (sortBy === 'power') {
    filteredCards = [...filteredCards].sort(
      (a, b) => (b.card.manaValue || 0) - (a.card.manaValue || 0)
    )
  } else {
    filteredCards = [...filteredCards].sort((a, b) =>
      a.card.name.localeCompare(b.card.name)
    )
  }

  const colors = [...new Set(deck.cards.flatMap((dc) => dc.card.colors))]

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/dashboard/decks" className="text-blue-600 hover:underline mb-4">
          ← Retour aux decks
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
          {deck.description && (
            <p className="text-gray-600">{deck.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {deck.cards.reduce((sum, c) => sum + c.quantity, 0)} cartes
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 flex-wrap">
          <div>
            <label className="text-sm font-medium mr-2">Couleur:</label>
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">Toutes</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mr-2">Trier par:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'power')}
              className="border rounded px-2 py-1"
            >
              <option value="name">Nom</option>
              <option value="power">Puissance</option>
            </select>
          </div>
        </div>

        {/* Cartes du deck */}
        {filteredCards.length === 0 ? (
          <p className="text-center text-gray-600">Aucune carte trouvée</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((deckCard) => (
              <CardComponent
                key={deckCard.id}
                id={deckCard.card.id}
                name={deckCard.card.name}
                imageUrl={deckCard.card.imageUrl}
                manaValue={deckCard.card.manaValue}
                colors={deckCard.card.colors}
                type={deckCard.card.type}
                quantity={deckCard.quantity}
                onRemove={() => removeCard(deckCard.card.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
