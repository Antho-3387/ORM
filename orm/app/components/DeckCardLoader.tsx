'use client'

import React, { useState, useEffect } from 'react'
import { parseDecklist, fetchAllCardImages, CardInfo } from '@/lib/deck-parser'
import { VirtualCardList } from './VirtualCardList'

/**
 * COMPOSANT WRAPPER pour charger et afficher les cartes d'un deck
 * 
 * Responsabilités:
 * 1. Parser la decklist
 * 2. Charger les images progressivement
 * 3. Passer les cartes à VirtualCardList (qui gère l'affichage)
 * 
 * Séparation des responsabilités = code plus lisible et maintenable
 */

interface DeckCardLoaderProps {
  deckList: string
}

export function DeckCardLoader({ deckList }: DeckCardLoaderProps) {
  const [cards, setCards] = useState<CardInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true)
        setLoadedCount(0)

        // ÉTAPE 1: Parser la decklist brute
        // Exemple: "1 Atraxa, Praetors' Voice" → { quantity: 1, name: "Atraxa, Praetors' Voice" }
        const parsed = parseDecklist(deckList)
        
        if (parsed.length === 0) {
          setCards([])
          setLoading(false)
          return
        }

        // ÉTAPE 2: Afficher immédiatement les cartes sans images
        // Cela donne un feedback visuel instantané à l'utilisateur
        setCards(parsed)

        // ÉTAPE 3: Charger les images progressivement
        // Le callback met à jour l'UI avec la progression en temps réel
        const withImages = await fetchAllCardImages(parsed, (count) => {
          setLoadedCount(count)
        })
        
        // ÉTAPE 4: Mettre à jour avec les images chargées
        setCards(withImages)
        setLoadedCount(withImages.filter(c => c.imageUrl).length)
      } catch (error) {
        console.error('Error loading cards:', error)
        setLoadedCount(0)
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [deckList])

  // Passer les cartes chargées au composant VirtualCardList
  // VirtualCardList gère tout l'affichage (virtualisation, lazy loading)
  return <VirtualCardList cards={cards} loading={loading} onProgressUpdate={setLoadedCount} />
}
