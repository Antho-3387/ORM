'use client'

import React from 'react'
import Image from 'next/image'

interface CardProps {
  id: string
  name: string
  imageUrl?: string
  manaValue?: number
  colors: string[]
  type: string
  quantity?: number
  onRemove?: (cardId: string) => void
  onQuantityChange?: (cardId: string, quantity: number) => void
}

const colorMap: Record<string, string> = {
  W: 'bg-yellow-200',
  U: 'bg-blue-200',
  B: 'bg-gray-800',
  R: 'bg-red-200',
  G: 'bg-green-200',
}

export function CardComponent({
  id,
  name,
  imageUrl,
  manaValue,
  colors,
  type,
  quantity = 1,
  onRemove,
  onQuantityChange,
}: CardProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
      {imageUrl && (
        <div className="relative w-full h-40 mb-2">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover rounded"
          />
        </div>
      )}

      <h3 className="font-bold text-sm mb-1">{name}</h3>
      <p className="text-xs text-gray-600 mb-2">{type}</p>

      <div className="flex gap-1 mb-2">
        {colors.map((color) => (
          <div
            key={color}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              colorMap[color] || 'bg-gray-200'
            }`}
            title={color}
          >
            {color}
          </div>
        ))}
      </div>

      {manaValue && (
        <p className="text-xs font-semibold mb-2">Puissance: {manaValue}</p>
      )}

      {quantity && (
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs">Quantité:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange?.(id, parseInt(e.target.value))}
            min="1"
            className="w-12 px-2 py-1 border rounded text-sm"
          />
        </div>
      )}

      {onRemove && (
        <button
          onClick={() => onRemove(id)}
          className="w-full mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Supprimer
        </button>
      )}
    </div>
  )
}
