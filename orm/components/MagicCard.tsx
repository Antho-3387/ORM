'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface MagicCardProps {
  id: string
  name: string
  imageUrl: string
  manaValue?: number
  colors?: string[]
  href?: string
  onSelect?: () => void
  selected?: boolean
}

const colorMap: Record<string, string> = {
  'W': '⚪',
  'U': '🔵',
  'B': '⚫',
  'R': '🔴',
  'G': '🟢',
}

export function MagicCard({
  id,
  name,
  imageUrl,
  manaValue,
  colors,
  href,
  onSelect,
  selected,
}: MagicCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const CardContent = (
    <div
      className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
        isHovering ? 'scale-105' : 'scale-100'
      } ${selected ? 'ring-2 ring-purple-400' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Card Image */}
      <div className="relative aspect-[7/10] bg-gradient-to-br from-purple-900/50 to-blue-900/50 overflow-hidden group">
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
            <div className="text-center">
              <div className="text-4xl mb-2">🃏</div>
              <p className="text-xs text-slate-300 px-2">{name}</p>
            </div>
          </div>
        )}

        {/* Glow Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-purple-600/0 via-blue-500/0 to-purple-500/0 opacity-0 group-hover:opacity-40 transition-opacity duration-300`}
        />

        {/* Mana Value Badge */}
        {manaValue !== undefined && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-purple-600/80 backdrop-blur rounded-full flex items-center justify-center text-xs font-bold text-white/90">
            {manaValue}
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-xs font-semibold text-white line-clamp-2 mb-2">{name}</p>
        {colors && colors.length > 0 && (
          <div className="flex gap-1">
            {colors.map((color) => (
              <span key={color} className="text-sm">
                {colorMap[color] || color}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Border Glow */}
      {isHovering && (
        <div className="absolute inset-0 rounded-lg border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{CardContent}</Link>
  }

  if (onSelect) {
    return (
      <button
        onClick={onSelect}
        className="w-full text-left cursor-pointer hover:opacity-80"
      >
        {CardContent}
      </button>
    )
  }

  return CardContent
}
