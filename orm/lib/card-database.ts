/**
 * Local card database with 1000+ Magic cards
 * Used for paginated API responses to demonstrate virtualization
 */

export interface Card {
  id: string
  name: string
  image_uris?: {
    normal: string
  }
  type_line: string
  mana_value?: number
  rarity?: string
}

// Expanded Magic card database (1000+ cards)
const CARD_DATABASE: Card[] = [
  // White cards
  { id: '1', name: 'Hylea of the Forest', type_line: 'Creature — God', mana_value: 3, rarity: 'rare' },
  { id: '2', name: 'Master Decoy', type_line: 'Creature — Human Rogue', mana_value: 3, rarity: 'uncommon' },
  { id: '3', name: 'Vega, the Watcher', type_line: 'Creature — God', mana_value: 5, rarity: 'rare' },
  { id: '4', name: 'Dungeon Geists', type_line: 'Creature — Spirit', mana_value: 3, rarity: 'uncommon' },
  { id: '5', name: 'Illithid Harvester', type_line: 'Creature — Aberration', mana_value: 4, rarity: 'uncommon' },
  { id: '6', name: 'Kytheon\'s Irregulars', type_line: 'Creature — Human Soldier', mana_value: 2, rarity: 'common' },
  { id: '7', name: 'Minister of Impediments', type_line: 'Creature — Human Cleric', mana_value: 2, rarity: 'uncommon' },
  { id: '8', name: 'Junk Winder', type_line: 'Creature — Construct', mana_value: 3, rarity: 'uncommon' },
  { id: '9', name: 'Gadwick, the Wizened', type_line: 'Creature — Wizard', mana_value: 2, rarity: 'rare' },
  { id: '10', name: 'Icewrought Sentry', type_line: 'Creature — Golem', mana_value: 3, rarity: 'common' },
  { id: '11', name: 'Tolarian Kraken', type_line: 'Creature — Kraken', mana_value: 4, rarity: 'uncommon' },
  { id: '12', name: 'Niblis of Frost', type_line: 'Creature — Spirit', mana_value: 2, rarity: 'uncommon' },
  { id: '13', name: 'Rhoda, Geist Avenger', type_line: 'Creature — Spirit', mana_value: 3, rarity: 'rare' },
  { id: '14', name: 'Sunblast Angel', type_line: 'Creature — Angel', mana_value: 5, rarity: 'rare' },
  { id: '15', name: 'Ultimecia, the High Priestess', type_line: 'Creature — Human Cleric', mana_value: 4, rarity: 'rare' },
  { id: '16', name: 'Topplegeist', type_line: 'Creature — Spirit', mana_value: 2, rarity: 'uncommon' },
  { id: '17', name: 'Court Street Denizen', type_line: 'Creature — Human', mana_value: 1, rarity: 'common' },
  { id: '18', name: 'Goldmeadow Stalwart', type_line: 'Creature — Sheep', mana_value: 2, rarity: 'common' },
  { id: '19', name: 'Frost Titan', type_line: 'Creature — Giant', mana_value: 6, rarity: 'rare' },
  { id: '20', name: 'Share of Nantuko', type_line: 'Creature — Insect', mana_value: 2, rarity: 'common' },
]

// Duplicate and expand to 1000+ cards
function expandDatabase(): Card[] {
  const expanded: Card[] = [...CARD_DATABASE]
  const baseLength = CARD_DATABASE.length

  // Generate 980 more cards by duplicating and renaming
  for (let i = baseLength; i < 1000; i++) {
    const baseCard = CARD_DATABASE[i % baseLength]
    expanded.push({
      ...baseCard,
      id: String(i + 1),
      name: `${baseCard.name} #${Math.floor(i / baseLength)}`
    })
  }

  return expanded
}

const DATABASE = expandDatabase()

export function getCardsPage(page: number, pageSize: number = 50): { cards: Card[]; total: number; hasMore: boolean } {
  const start = page * pageSize
  const end = start + pageSize
  const cards = DATABASE.slice(start, end)
  const hasMore = end < DATABASE.length

  return {
    cards,
    total: DATABASE.length,
    hasMore
  }
}

export function searchCards(query: string): Card[] {
  const lowerQuery = query.toLowerCase()
  return DATABASE.filter(card =>
    card.name.toLowerCase().includes(lowerQuery) ||
    card.type_line.toLowerCase().includes(lowerQuery)
  )
}

export function sortCards(cards: Card[], sortBy: 'name' | 'mana' | 'rarity'): Card[] {
  const sorted = [...cards]

  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'mana':
      sorted.sort((a, b) => (a.mana_value || 0) - (b.mana_value || 0))
      break
    case 'rarity':
      const rarityOrder = { common: 0, uncommon: 1, rare: 2, mythic: 3 }
      sorted.sort((a, b) => (rarityOrder[a.rarity as keyof typeof rarityOrder] || 99) - (rarityOrder[b.rarity as keyof typeof rarityOrder] || 99))
      break
  }

  return sorted
}
