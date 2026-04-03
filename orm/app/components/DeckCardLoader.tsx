'use client'

import React, { useState, useEffect } from 'react'
import { parseDecklist, CardInfo } from '@/lib/deck-parser'
import { VirtualCardList } from './VirtualCardList'

/**
 * COMPOSANT WRAPPER pour charger et afficher les cartes d'un deck
 * 
 * CORRECTION CORS:
 * - Ne pré-charge PAS les images côté client (CORS bloqué)
 * - VirtualCardList → LazyCardImage chargent via /api/cards/image
 * - Cette API route appelle Scryfall côté SERVEUR (pas de CORS!)
 */

interface DeckCardLoaderProps {
  deckList: string
}

export function DeckCardLoader({ deckList }: DeckCardLoaderProps) {
  const [cards, setCards] = useState<CardInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true)

        // ÉTAPE 1: Parser la decklist brute
        const parsed = parseDecklist(deckList)
        
        if (parsed.length === 0) {
          setCards([])
          setLoading(false)
          return
        }

        // ÉTAPE 2: Afficher les cartes SANS images d'abord
        // Les images seront chargées par LazyCardImage via API route
        setCards(parsed)
      } catch (error) {
        console.error('Error loading cards:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [deckList])

  // Passer les cartes au composant VirtualCardList
  // VirtualCardList gère l'affichage + lazy loading des images
  return <VirtualCardList cards={cards} loading={loading} />
}
