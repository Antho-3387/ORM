'use client'

import Image from 'next/image'
import Link from 'next/link'

interface CardImageProps {
  id: string
  name: string
  imageUrl?: string | null
  manaValue?: number | null
  colors?: string
  type?: string
  href?: string
  onClick?: () => void
  stats?: {
    popularity?: number
    synergies?: number
    decks?: number
  }
}

export function CardImage({
  id,
  name,
  imageUrl,
  manaValue,
  colors = '',
  type,
  href,
  onClick,
  stats,
}: CardImageProps) {
  const colorArray = colors ? colors.split('') : []

  const getColorBg = (color: string) => {
    const colorMap: Record<string, string> = {
      W: 'bg-yellow-100',
      U: 'bg-blue-400',
      B: 'bg-gray-800',
      R: 'bg-red-500',
      G: 'bg-green-600',
    }
    return colorMap[color] || 'bg-gray-600'
  }

  const content = (
    <div onClick={onClick} className="group cursor-pointer transition-transform duration-200 hover:scale-105">
      {/* Card Container */}
      <div className="relative rounded-lg overflow-hidden border border-slate-600 hover:border-purple-400 transition-colors bg-slate-900 shadow-lg hover:shadow-xl hover:shadow-purple-500/20">
        {/* Image */}
        <div className="relative w-full h-48 bg-slate-800">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
              <div className="text-center">
                <div className="text-4xl mb-2">🎴</div>
                <p className="text-xs text-slate-400">No Image</p>
              </div>
            </div>
          )}
        </div>

        {/* Card Info Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <p className="text-xs text-slate-300 mb-1">{type}</p>
          <p className="text-xs font-semibold text-slate-200">
            {stats?.popularity && `${stats.popularity}% in decks`}
          </p>
        </div>

        {/* Mana Value Badge */}
        {manaValue !== null && manaValue !== undefined && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            {manaValue}
          </div>
        )}

        {/* Color Indicators */}
        {colorArray.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {colorArray.map((color, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${getColorBg(color)}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Name */}
      <div className="mt-2">
        <h3 className="text-sm font-semibold text-slate-200 truncate hover:text-purple-300 transition-colors">
          {name}
        </h3>
        {stats && (
          <div className="text-xs text-slate-400 mt-1 space-y-0.5">
            {stats.synergies && <p>🔗 {stats.synergies} synergies</p>}
            {stats.decks && <p>📦 {stats.decks} decks</p>}
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
