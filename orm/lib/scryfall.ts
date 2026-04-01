/**
 * Scryfall API Integration
 * API gratuite pour les cartes Magic: The Gathering
 */

const SCRYFALL_API = 'https://api.scryfall.com'

export interface ScryfallCard {
  id: string
  name: string
  mana_value?: number
  colors?: string[]
  type_line: string
  image_uris?: {
    normal: string
  }
  scryfall_uri: string
}

/**
 * Recherche les cartes par nom avec retry sur rate limit
 */
export async function searchCards(query: string): Promise<ScryfallCard[]> {
  let retries = 0
  const maxRetries = 5
  let delay = 500

  while (retries < maxRetries) {
    try {
      // Respect du rate limit: délai minimum 500ms entre requêtes
      await new Promise(resolve => setTimeout(resolve, delay))

      const response = await fetch(
        `${SCRYFALL_API}/cards/search?q=${encodeURIComponent(query)}&unique=cards`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      // Si rate limit (429), attendre et réessayer
      if (response.status === 429) {
        console.warn(`Rate limit Scryfall (429) pour "${query}", retry ${retries + 1}/${maxRetries}`)
        retries++
        delay = Math.min(delay * 2, 5000) // Backoff exponentiel max 5s
        continue
      }

      if (!response.ok) {
        console.warn(`Scryfall search failed for "${query}": ${response.status}`)
        return []
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error searching cards:', error)
      return []
    }
  }

  console.error(`Max retries atteint pour "${query}"`)
  return []
}

/**
 * Récupère les détails d'une carte par son ID Scryfall
 */
export async function getCardById(scryfallId: string): Promise<ScryfallCard | null> {
  try {
    const response = await fetch(`${SCRYFALL_API}/cards/${scryfallId}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching card:', error)
    return null
  }
}

/**
 * Récupère les cartes par couleur (W, U, B, R, G)
 */
export async function searchCardsByColor(color: string): Promise<ScryfallCard[]> {
  try {
    const response = await fetch(
      `${SCRYFALL_API}/cards/search?q=color%3D${color}&unique=prints&order=released`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error searching cards by color:', error)
    return []
  }
}

/**
 * Récupère les cartes par puissance (power)
 */
export async function searchCardsByPower(power: string): Promise<ScryfallCard[]> {
  try {
    const response = await fetch(
      `${SCRYFALL_API}/cards/search?q=pow%3D${power}&unique=prints`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error searching cards by power:', error)
    return []
  }
}
