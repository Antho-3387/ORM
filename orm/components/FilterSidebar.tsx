'use client'

import { useState } from 'react'

interface FilterSidebarProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  colors: string[]
  types: string[]
  manaRange: [number, number]
  searchQuery: string
  format: string
}

const COLORS = ['W', 'U', 'B', 'R', 'G']
const TYPES = ['Creature', 'Instant', 'Sorcery', 'Enchantment', 'Artifact', 'Land', 'Planeswalker', 'Tribal']
const MANA_RANGES = [
  { label: '0-3', min: 0, max: 3 },
  { label: '4-7', min: 4, max: 7 },
  { label: '8+', min: 8, max: 12 },
]
const FORMATS = ['All Formats', 'Standard', 'Modern', 'Commander', 'Pioneer', 'Vintage']

const COLOR_NAMES: Record<string, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
}

const COLOR_BG: Record<string, string> = {
  W: 'bg-yellow-500',
  U: 'bg-blue-500',
  B: 'bg-black',
  R: 'bg-red-500',
  G: 'bg-green-600',
}

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    types: [],
    manaRange: [0, 12],
    searchQuery: '',
    format: 'All Formats',
  })

  const updateFilter = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange(updated)
  }

  const toggleColor = (color: string) => {
    const updated = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color]
    updateFilter({ colors: updated })
  }

  const toggleType = (type: string) => {
    const updated = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    updateFilter({ types: updated })
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 p-6 h-max sticky top-20">
      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Search Cards
        </label>
        <input
          type="text"
          placeholder="Card name..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter({ searchQuery: e.target.value })}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />
      </div>

      {/* Format */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Format
        </label>
        <select
          value={filters.format}
          onChange={(e) => updateFilter({ format: e.target.value })}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        >
          {FORMATS.map((fmt) => (
            <option key={fmt} value={fmt}>
              {fmt}
            </option>
          ))}
        </select>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Colors</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              className={`w-8 h-8 rounded-full transition-all ${
                filters.colors.includes(color)
                  ? `${COLOR_BG[color]} ring-2 ring-purple-400 ring-offset-1 ring-offset-slate-900`
                  : `${COLOR_BG[color]} opacity-60 hover:opacity-100`
              }`}
              title={COLOR_NAMES[color]}
            />
          ))}
        </div>
      </div>

      {/* Mana Value */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Mana Value</h3>
        <div className="space-y-2">
          {MANA_RANGES.map(({ label, min, max }) => (
            <button
              key={label}
              onClick={() => updateFilter({ manaRange: [min, max] })}
              className={`w-full px-3 py-2 text-sm rounded-lg transition ${
                filters.manaRange[0] === min && filters.manaRange[1] === max
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Card Types */}
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Card Type</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={() => toggleType(type)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-600 checked:bg-purple-600 cursor-pointer"
              />
              <span className="text-sm text-slate-300 group-hover:text-slate-200 transition">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          const defaultFilters: FilterState = {
            colors: [],
            types: [],
            manaRange: [0, 12],
            searchQuery: '',
            format: 'All Formats',
          }
          setFilters(defaultFilters)
          onFilterChange(defaultFilters)
        }}
        className="w-full mt-6 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition text-sm font-medium"
      >
        Reset Filters
      </button>
    </aside>
  )
}
