// Simple in-memory cache (will reset when server restarts, but helpful during session)
const cardCache = new Map<string, string | null>()

async function fetchCardWithRetry(cardName: string, maxRetries = 2): Promise<string | null> {
  let retries = 0
  let delay = 100

  while (retries < maxRetries) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000) // 3s timeout par carte

      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(cardName)}"&unique=cards`,
        {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        }
      )

      clearTimeout(timeout)

      if (response.status === 429) {
        // Rate limited, retry avec délai
        retries++
        delay = delay * 2
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          return data.data[0].image_uris?.normal || null
        }
      }

      return null
    } catch (error) {
      console.error(`Error fetching ${cardName}:`, error)
      retries++
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  return null
}

export async function POST(request: Request) {
  try {
    const { cardNames } = await request.json()

    if (!Array.isArray(cardNames) || cardNames.length === 0) {
      return Response.json({ error: 'Invalid cardNames array' }, { status: 400 })
    }

    // Limiter à 50 cartes par requête
    const limitedNames = cardNames.slice(0, 50)
    const results: Record<string, string | null> = {}

    // Séparer cartes cachées et nouvelles
    const cardsToFetch: string[] = []
    for (const cardName of limitedNames) {
      if (cardCache.has(cardName)) {
        results[cardName] = cardCache.get(cardName) || null
      } else {
        cardsToFetch.push(cardName)
      }
    }

    // Fetcher les cartes non cachées par batch avec délai progressif
    const batchSize = 5  // Réduit de 10 à 5 pour éviter les rate limits
    for (let i = 0; i < cardsToFetch.length; i += batchSize) {
      const batch = cardsToFetch.slice(i, i + batchSize)
      
      const promises = batch.map(async (cardName) => {
        try {
          const imageUrl = await fetchCardWithRetry(cardName)
          cardCache.set(cardName, imageUrl)
          results[cardName] = imageUrl
        } catch (error) {
          console.error(`Final error for ${cardName}:`, error)
          cardCache.set(cardName, null)
          results[cardName] = null
        }
      })

      await Promise.all(promises)

      // Délai plus court entre batch
      if (i + batchSize < cardsToFetch.length) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }

    return Response.json({ images: results })
  } catch (error) {
    console.error('Error in batch endpoint:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
