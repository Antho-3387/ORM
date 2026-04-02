/**
 * Scryfall API Integration Guide
 * 
 * Ce fichier montre comment intégrer l'API Scryfall
 * pour remplacer les données mock.
 */

// ==========================================
// 1. RECHERCHE DE CARTES
// ==========================================

interface ScryfallCard {
  id: string
  name: string
  image_uris?: {
    large: string
    normal: string
  }
  mana_cost: string
  cmc: number
  type_line: string
  color_identity: string[]
  oracle_text?: string
  power?: string
  toughness?: string
  rarity: string
  set: string
  prices?: {
    usd?: string
  }
}

/**
 * Exemple: Rechercher des cartes
 * 
 * const response = await fetch('https://api.scryfall.com/cards/search?q=name:sol');
 * const data = await response.json();
 * 
 * data.data.map(card => ({
 *   id: card.id,
 *   name: card.name,
 *   imageUrl: card.image_uris?.large,
 *   manaValue: card.cmc,
 *   colors: card.color_identity.join(''),
 *   type: card.type_line,
 * }))
 */

// ==========================================
// 2. GETTER PAR ID
// ==========================================

/**
 * Exemple: Récupérer une carte par ID
 * 
 * const cardId = 'e6211e3e-8494-40ba-b149-eb89e618e1d2';
 * const response = await fetch(`https://api.scryfall.com/cards/${cardId}`);
 * const card = await response.json();
 */

// ==========================================
// 3. RECHERCHE AVANCÉE
// ==========================================

/**
 * Exemples de recherche:
 * 
 * Par couleur:
 * https://api.scryfall.com/cards/search?q=color:U
 * 
 * Par type:
 * https://api.scryfall.com/cards/search?q=type:Creature
 * 
 * Par coût de mana:
 * https://api.scryfall.com/cards/search?q=cmc<=2
 * 
 * Par format:
 * https://api.scryfall.com/cards/search?q=legal:commander
 * 
 * Combiné:
 * https://api.scryfall.com/cards/search?q=type:Creature color:W cmc<=3
 */

// ==========================================
// 4. FONCTION HELPER À IMPLÉMENTER
// ==========================================

export async function searchCards(query: string): Promise<ScryfallCard[]> {
  try {
    const searchQuery = encodeURIComponent(query)
    const response = await fetch(
      `https://api.scryfall.com/cards/search?q=${searchQuery}&unique=prints&order=popularity`
    )
    
    if (!response.ok) throw new Error('Card not found')
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error searching cards:', error)
    return []
  }
}

export async function getCardById(id: string): Promise<ScryfallCard | null> {
  try {
    const response = await fetch(`https://api.scryfall.com/cards/${id}`)
    
    if (!response.ok) throw new Error('Card not found')
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching card:', error)
    return null
  }
}

// ==========================================
// 5. COMMENT UTILISER DANS LES PAGES
// ==========================================

/**
 * Dans app/cards/page.tsx:
 * 
 * import { searchCards } from '@/lib/scryfall'
 * 
 * export default function CardsPage() {
 *   const [cards, setCards] = useState([])
 *   
 *   useEffect(() => {
 *     searchCards('color:U type:Instant').then(setCards)
 *   }, [])
 *   
 *   return (
 *     <CardGrid>
 *       {cards.map(card => (
 *         <CardImage
 *           key={card.id}
 *           id={card.id}
 *           name={card.name}
 *           imageUrl={card.image_uris?.large}
 *           manaValue={card.cmc}
 *           colors={card.color_identity.join('')}
 *           type={card.type_line}
 *         />
 *       ))}
 *     </CardGrid>
 *   )
 * }
 */

// ==========================================
// 6. CACHE STRATEGY (OPTIMISATION)
// ==========================================

/**
 * Pour ne pas surcharger l'API:
 * 
 * import NodeCache from 'node-cache'
 * 
 * const cache = new NodeCache({ stdTTL: 3600 })
 * 
 * export async function searchCardsWithCache(query: string) {
 *   const cached = cache.get(query)
 *   if (cached) return cached
 *   
 *   const results = await searchCards(query)
 *   cache.set(query, results)
 *   return results
 * }
 */

// ==========================================
// 7. PAGINATION
// ==========================================

/**
 * Scryfall retourne les résultats avec pagination:
 * 
 * const response = await fetch(
 *   'https://api.scryfall.com/cards/search?q=...'
 * )
 * const data = await response.json()
 * 
 * data.has_more // true si d'autres pages existent
 * data.next_page // URL de la page suivante
 */

// ==========================================
// 8. RATES & PRICES
// ==========================================

/**
 * Récupérer les prix:
 * 
 * card.prices = {
 *   usd: "5.23",
 *   usd_foil: "12.45",
 *   eur: "4.95",
 *   tix: "0.05"
 * }
 */

export default {}
