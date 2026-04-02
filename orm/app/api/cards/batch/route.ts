// Simple in-memory cache (will reset when server restarts, but helpful during session)
const cardCache = new Map<string, string | null>()

export async function POST(request: Request) {
  try {
    const { cardNames } = await request.json()

    if (!Array.isArray(cardNames) || cardNames.length === 0) {
      return Response.json({ error: 'Invalid cardNames array' }, { status: 400 })
    }

    // Limiter à 50 cartes par requête
    const limitedNames = cardNames.slice(0, 50)
    const results: Record<string, string | null> = {}

    // Grouper les cartes à fetcher par batch de 10
    const cardsToFetch: string[] = []
    for (const cardName of limitedNames) {
      if (cardCache.has(cardName)) {
        results[cardName] = cardCache.get(cardName) || null
      } else {
        cardsToFetch.push(cardName)
      }
    }

    // Fetcher les cartes non cachées en parallèle (avec délai entre batch)
    const batchSize = 10
    for (let i = 0; i < cardsToFetch.length; i += batchSize) {
      const batch = cardsToFetch.slice(i, i + batchSize)
      
      const promises = batch.map(async (cardName) => {
        try {
          const response = await fetch(
            `https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(cardName)}"&unique=cards`,
            {
              headers: {
                'Accept': 'application/json',
              },
            }
          )

          if (response.ok) {
            const data = await response.json()
            if (data.data && data.data.length > 0) {
              const imageUrl = data.data[0].image_uris?.normal || null
              cardCache.set(cardName, imageUrl)
              results[cardName] = imageUrl
              return
            }
          }
          
          cardCache.set(cardName, null)
          results[cardName] = null
        } catch (error) {
          console.error(`Error fetching ${cardName}:`, error)
          cardCache.set(cardName, null)
          results[cardName] = null
        }
      })

      await Promise.all(promises)

      // Délai entre batch pour respecter le rate limit
      if (i + batchSize < cardsToFetch.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return Response.json({ images: results })
  } catch (error) {
    console.error('Error in batch endpoint:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
