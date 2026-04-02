# 📋 Code Snippets & Examples

> Prêt-à-l'emploi : copier-coller pour développement rapide

---

## 📌 Table des matières
1. [Ajouter une nouvelle page](#nouvelle-page)
2. [Créer un nouveau composant](#nouveau-composant)
3. [Intégrer Scryfall API](#api-scryfall)
4. [Ajouter des filtres](#nouveaux-filtres)
5. [Personnaliser themes](#themes)

---

## 🆕 Ajouter une Nouvelle Page {#nouvelle-page}

### Template Page Basique:

```tsx
// app/nompage/page.tsx

'use client'

import Link from 'next/link'
import { StatsGrid } from '@/components/StatsBar'
import { TrendingSection } from '@/components/TrendingSection'

export default function NomPagePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            Ma Page
          </h1>
          <p className="text-lg text-slate-400">
            Description de ma page
          </p>
        </div>

        {/* Stats */}
        <StatsGrid
          stats={[
            { label: 'Stat 1', value: '100', icon: '📦' },
            { label: 'Stat 2', value: '200', icon: '🎴' },
          ]}
        />

        {/* Contenu */}
        <TrendingSection
          title="Section Titre"
          href="/autre-page"
        >
          {/* Contenu ici */}
        </TrendingSection>
      </div>
    </main>
  )
}
```

### Avec Route Dynamique:

```tsx
// app/nompage/[id]/page.tsx

'use client'

import { use } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DynamicPage({ params }: PageProps) {
  const { id } = use(params)
  
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h1>Page: {id}</h1>
      </div>
    </main>
  )
}
```

---

## 🧩 Créer un Nouveau Composant {#nouveau-composant}

### Template Composant Simple:

```tsx
// components/MonComposant.tsx

interface MonComposantProps {
  titre: string
  contenu?: string
  variant?: 'primary' | 'secondary'
}

export function MonComposant({ 
  titre, 
  contenu, 
  variant = 'primary' 
}: MonComposantProps) {
  
  const variantClass = {
    primary: 'bg-purple-600 border-purple-500',
    secondary: 'bg-slate-800 border-slate-700'
  }[variant]
  
  return (
    <div className={`p-4 rounded-lg border ${variantClass}`}>
      <h3 className="font-semibold text-slate-100 mb-2">
        {titre}
      </h3>
      {contenu && (
        <p className="text-slate-300 text-sm">
          {contenu}
        </p>
      )}
    </div>
  )
}
```

### Utiliser le composant:

```tsx
import { MonComposant } from '@/components/MonComposant'

export default function Page() {
  return (
    <MonComposant 
      titre="Mon Titre"
      contenu="Mon contenu"
      variant="secondary"
    />
  )
}
```

### Composant Avec État:

```tsx
'use client'

import { useState } from 'react'

interface MonComposantAvecEtatProps {
  onSubmit?: (data: string) => void
}

export function MonComposantAvecEtat({ 
  onSubmit 
}: MonComposantAvecEtatProps) {
  const [input, setInput] = useState('')
  
  const handleClick = () => {
    onSubmit?.(input)
    setInput('')
  }
  
  return (
    <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Entrez quelque chose..."
      />
      <button
        onClick={handleClick}
        className="mt-2 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
      >
        Soumettre
      </button>
    </div>
  )
}
```

---

## 🔌 Intégrer Scryfall API {#api-scryfall}

### 1. Créer une fonction API:

```tsx
// lib/scryfall.ts

export interface Card {
  id: string
  name: string
  image_uris?: { large: string }
  cmc: number
  type_line: string
  color_identity: string[]
  oracle_text?: string
}

export async function searchCards(query: string): Promise<Card[]> {
  try {
    const encoded = encodeURIComponent(query)
    const response = await fetch(
      `https://api.scryfall.com/cards/search?q=${encoded}&unique=prints&order=popularity`
    )
    
    if (!response.ok) throw new Error('Not found')
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

export async function getCardById(id: string): Promise<Card | null> {
  try {
    const response = await fetch(`https://api.scryfall.com/cards/${id}`)
    if (!response.ok) throw new Error('Not found')
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}
```

### 2. Utiliser dans une page:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { searchCards, Card } from '@/lib/scryfall'
import { CardImage } from '@/components/CardImage'
import { CardGrid } from '@/components/CardGrid'

export default function CardsAPIPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    searchCards('color:U type:Instant').then((data) => {
      setCards(data)
      setLoading(false)
    })
  }, [])
  
  if (loading) return <div>Chargement...</div>
  
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <CardGrid columns={5}>
          {cards.map((card) => (
            <CardImage
              key={card.id}
              id={card.id}
              name={card.name}
              imageUrl={card.image_uris?.large}
              manaValue={card.cmc}
              colors={card.color_identity.join('')}
              type={card.type_line}
            />
          ))}
        </CardGrid>
      </div>
    </main>
  )
}
```

### 3. Avec filtres (exemple avancé):

```tsx
'use client'

import { useState, useEffect } from 'react'
import { searchCards } from '@/lib/scryfall'

export default function AdvancedSearch() {
  const [color, setColor] = useState('U')
  const [type, setType] = useState('Instant')
  const [cmc, setCmc] = useState('<=2')
  const [cards, setCards] = useState([])
  
  useEffect(() => {
    const query = `color:${color} type:${type} cmc${cmc}`
    searchCards(query).then(setCards)
  }, [color, type, cmc])
  
  return (
    <div>
      <select value={color} onChange={(e) => setColor(e.target.value)}>
        <option value="W">White</option>
        <option value="U">Blue</option>
        <option value="B">Black</option>
        <option value="R">Red</option>
        <option value="G">Green</option>
      </select>
      
      <p>Found {cards.length} cards</p>
    </div>
  )
}
```

---

## 🔍 Ajouter des Filtres {#nouveaux-filtres}

### Étendre FilterSidebar:

```tsx
// Dans FilterSidebar.tsx, ajouter à FilterState:

export interface FilterState {
  colors: string[]
  types: string[]
  manaRange: [number, number]
  searchQuery: string
  format: string
  rarity: string[]  // ← NOUVEAU
  power: string     // ← NOUVEAU
  toughness: string // ← NOUVEAU
}

// Dans le composant, ajouter une nouvelle section:

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Mythic Rare']

{/* Rarity Filter (nouveau) */}
<div>
  <h3 className="text-sm font-semibold text-slate-200 mb-2">
    Rarity
  </h3>
  <div className="space-y-2">
    {RARITIES.map((rarity) => (
      <label key={rarity} className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.rarity.includes(rarity)}
          onChange={() => {
            const updated = filters.rarity.includes(rarity)
              ? filters.rarity.filter(r => r !== rarity)
              : [...filters.rarity, rarity]
            updateFilter({ rarity: updated })
          }}
          className="w-4 h-4 rounded bg-slate-800"
        />
        <span className="text-sm text-slate-300">{rarity}</span>
      </label>
    ))}
  </div>
</div>
```

---

## 🎨 Personnaliser Thèmes {#themes}

### Créer un thème rouge:

```css
/* globals.css - Ajouter variant */

:root[data-theme="red"] {
  --primary: #ef4444;
  --primary-light: #f87171;
  --primary-dark: #991b1b;
}

:root[data-theme="green"] {
  --primary: #10b981;
  --primary-light: #6ee7b7;
  --primary-dark: #047857;
}
```

### Composant toggle:

```tsx
'use client'

import { useEffect, useState } from 'react'

const THEMES = ['purple', 'red', 'green', 'blue']

export function ThemeSelector() {
  const [theme, setTheme] = useState('purple')
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  
  return (
    <div className="flex gap-2">
      {THEMES.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`px-3 py-1 rounded capitalize ${
            theme === t 
              ? 'bg-purple-600 text-white' 
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
```

---

## 📊 Ajouter des Graphiques

### Installer Chart.js:

```bash
npm install chart.js react-chartjs-2
```

### Composant graphique:

```tsx
'use client'

import { Bar } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export function PopularityChart() {
  const data = {
    labels: ['W', 'U', 'B', 'R', 'G'],
    datasets: [{
      label: 'Popularity %',
      data: [45, 52, 48, 41, 58],
      backgroundColor: [
        '#eab308',
        '#3b82f6',
        '#1f2937',
        '#ef4444',
        '#16a34a',
      ]
    }]
  }
  
  return <Bar data={data} />
}
```

---

## 🔐 Authentification

### Vérifier utilisateur:

```tsx
'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth')
    }
  }, [isAuthenticated, router])
  
  if (!isAuthenticated) return null
  
  return (
    <div>
      <p>Bienvenue, {user?.email}</p>
    </div>
  )
}
```

---

**Plus d'exemples? Consultez les fichiers dans `/app` et `/components`! 🚀**
