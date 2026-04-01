'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { Select } from '@/app/components/ui/Select'
import { CardComponent } from '@/app/components/card/CardComponent'
import { Navbar } from '@/app/components/ui/Navbar'

interface Card {
  id: string
  name: string
  scryfallId: string
  imageUrl?: string
  manaValue?: number
  colors: string[]
  type: string
}

export default function CreateDeckPage() {
  const router = useRouter()
  const [deckName, setDeckName] = useState('')
  const [deckDescription, setDeckDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Card[]>([])
  const [selectedCards, setSelectedCards] = useState<Array<Card & { quantity: number }>>([])
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | undefined>()
  const [loading, setLoading] = useState(false)
  const [searchColor, setSearchColor] = useState('')
  const [searchPower, setSearchPower] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(storedUser))
  }, [router])

  const searchCards = useCallback(async () => {
    if (!searchQuery && !searchColor && !searchPower) return

    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (searchColor) params.append('color', searchColor)
      if (searchPower) params.append('power', searchPower)

      const res = await fetch(`/api/cards?${params}`)
      if (res.ok) {
        const results = await res.json()
        setSearchResults(results)
      }
    } catch (error) {
      console.error('Error searching cards:', error)
    }
  }, [searchQuery, searchColor, searchPower])

  const addCardToDeck = (card: Card) => {
    const existing = selectedCards.find((c) => c.id === card.id)
    if (existing) {
      setSelectedCards(
        selectedCards.map((c) =>
          c.id === card.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      )
    } else {
      setSelectedCards([...selectedCards, { ...card, quantity: 1 }])
    }
  }

  const removeCardFromDeck = (cardId: string) => {
    setSelectedCards(selectedCards.filter((c) => c.id !== cardId))
  }

  const updateCardQuantity = (cardId: string, quantity: number) => {
    if (quantity <= 0) {
      removeCardFromDeck(cardId)
    } else {
      setSelectedCards(
        selectedCards.map((c) =>
          c.id === cardId ? { ...c, quantity } : c
        )
      )
    }
  }

  const createDeck = async () => {
    if (!deckName || selectedCards.length === 0) {
      alert('Veuillez donner un nom au deck et ajouter des cartes')
      return
    }

    setLoading(true)

    try {
      const userId = localStorage.getItem('userId')

      // Créer le deck
      const deckRes = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || '',
        },
        body: JSON.stringify({
          name: deckName,
          description: deckDescription,
        }),
      })

      if (!deckRes.ok) throw new Error('Failed to create deck')
      const deck = await deckRes.json()

      // Ajouter les cartes au deck
      for (const card of selectedCards) {
        await fetch(`/api/decks/${deck.id}/cards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId || '',
          },
          body: JSON.stringify({
            cardId: card.id,
            quantity: card.quantity,
          }),
        })
      }

      router.push(`/dashboard/decks/${deck.id}`)
    } catch (error) {
      console.error('Error creating deck:', error)
      alert('Erreur lors de la création du deck')
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold mb-8">Créer un nouveau Deck</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Informations du deck */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-4">Informations du Deck</h2>
              <Input
                label="Nom du deck"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Ex: Deck Bleu/Blanc"
              />
              <Input
                label="Description (optionnel)"
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                placeholder="Description de votre stratégie..."
              />
            </div>

            {/* Recherche de cartes */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-4">Rechercher des Cartes</h2>

              <Input
                label="Nom de la carte"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Lightning Bolt"
              />

              <Select
                label="Couleur"
                options={[
                  { value: 'W', label: 'Blanc' },
                  { value: 'U', label: 'Bleu' },
                  { value: 'B', label: 'Noir' },
                  { value: 'R', label: 'Rouge' },
                  { value: 'G', label: 'Vert' },
                ]}
                value={searchColor}
                onChange={(e) => setSearchColor(e.target.value)}
              />

              <Input
                label="Puissance"
                type="number"
                value={searchPower}
                onChange={(e) => setSearchPower(e.target.value)}
                placeholder="Ex: 3"
              />

              <Button onClick={searchCards} className="w-full">
                Rechercher
              </Button>

              {/* Résultats */}
              {searchResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold mb-4">
                    Résultats ({searchResults.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {searchResults.slice(0, 20).map((card) => (
                      <div
                        key={card.id}
                        className="border rounded p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => addCardToDeck(card)}
                      >
                        <p className="text-sm font-semibold">{card.name}</p>
                        <p className="text-xs text-gray-600">{card.type}</p>
                        <Button
                          className="w-full mt-1 text-xs"
                          onClick={() => addCardToDeck(card)}
                        >
                          +
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aperçu du deck */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-4">
              <h2 className="text-xl font-bold mb-4">Aperçu du Deck</h2>

              {selectedCards.length === 0 ? (
                <p className="text-gray-600 text-sm">Aucune carte ajoutée</p>
              ) : (
                <>
                  <div className="mb-4 max-h-96 overflow-y-auto">
                    {selectedCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex justify-between items-center p-2 border-b text-sm"
                      >
                        <span>
                          {card.quantity}x {card.name}
                        </span>
                        <button
                          onClick={() => removeCardFromDeck(card.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm">
                      <strong>Total:</strong> {selectedCards.reduce((sum, c) => sum + c.quantity, 0)} cartes
                    </p>
                  </div>
                </>
              )}

              <Button
                onClick={createDeck}
                disabled={loading || !deckName || selectedCards.length === 0}
                className="w-full"
              >
                {loading ? 'Création...' : 'Créer le Deck'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
