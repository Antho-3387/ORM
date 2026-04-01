'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '../ui/Button'

interface DeckCardProps {
  id: string
  name: string
  description?: string
  cardCount: number
  createdAt: string
  onDelete?: (id: string) => void
}

export function DeckCard({
  id,
  name,
  description,
  cardCount,
  createdAt,
  onDelete,
}: DeckCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('fr-FR')

  return (
    <div className="border border-gray-300 rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
      <h3 className="font-bold text-lg mb-2">{name}</h3>
      {description && <p className="text-gray-600 text-sm mb-2">{description}</p>}

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          <p>{cardCount} cartes</p>
          <p>Créé: {formattedDate}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/dashboard/decks/${id}`} className="flex-1">
          <Button className="w-full">Voir/Éditer</Button>
        </Link>
        {onDelete && (
          <Button
            onClick={() => onDelete(id)}
            variant="danger"
            className="px-3"
          >
            Supprimer
          </Button>
        )}
      </div>
    </div>
  )
}
