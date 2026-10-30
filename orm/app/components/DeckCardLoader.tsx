'use client'

import React, { useState, useEffect } from 'react'
import { parseDecklist, CardInfo } from '@/lib/deck-parser'
import { VirtualCardList } from './VirtualCardList'

interface DeckCardLoaderProps {
  deckList: string
}

export function DeckCardLoader({ deckList }: DeckCardLoaderProps) {
  const [cards, setCards] = useState<CardInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const loadCards = async () => {
      try {
        setLoading(true)
        setError(null)

        const parsed = parseDecklist(deckList)

        setCards(parsed)
        if (parsed.length === 0) {
          return
        }

        const response = await fetch('/api/cards/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: parsed.map((card) => card.name) }),
          signal: controller.signal,
        })
        const data: { images?: Record<string, string | null>; notFound?: string[]; error?: string } =
          await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Impossible de charger les images des cartes.')
        }

        const images = new Map(
          Object.entries(data.images || {}).map(([name, imageUrl]) => [name.toLowerCase(), imageUrl])
        )

        setCards(parsed.map((card) => ({
          ...card,
          imageUrl: images.get(card.name.toLowerCase()) || undefined,
          error: images.get(card.name.toLowerCase())
            ? undefined
            : 'Image introuvable dans Scryfall.',
        })))

        if (data.notFound?.length) {
          setError(`Image introuvable pour : ${data.notFound.join(', ')}.`)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Erreur lors du chargement des images du deck:', error)
        setError(
          error instanceof Error
            ? error.message
            : 'Impossible de charger les images. Réessayez.'
        )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadCards()
    return () => controller.abort()
  }, [deckList, retryCount])

  return (
    <>
      {error && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-950/40 p-3 text-sm text-amber-100">
          <span>{error}</span>
          {!loading && (
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="rounded border border-amber-400/40 px-3 py-1 hover:bg-amber-900/50"
            >
              Réessayer
            </button>
          )}
        </div>
      )}
      <VirtualCardList cards={cards} loading={loading} />
    </>
  )
}
