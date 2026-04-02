// Simple in-memory cache (will reset when server restarts, but helpful during session)
const cardCache = new Map<string, string | null>()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cardName = searchParams.get('name')

  if (!cardName) {
    return Response.json({ error: 'Missing card name' }, { status: 400 })
  }

  // Vérifier le cache serveur
  if (cardCache.has(cardName)) {
    const cachedUrl = cardCache.get(cardName)
    return Response.json({ imageUrl: cachedUrl })
  }

  try {
    const response = await fetch(
      `https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(cardName)}"&unique=cards`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      cardCache.set(cardName, null)
      return Response.json({ imageUrl: null })
    }

    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      const card = data.data[0]
      const imageUrl = card.image_uris?.normal || null
      cardCache.set(cardName, imageUrl)
      return Response.json({ imageUrl })
    }

    cardCache.set(cardName, null)
    return Response.json({ imageUrl: null })
  } catch (error) {
    console.error('Error fetching card image:', error)
    cardCache.set(cardName, null)
    return Response.json({ imageUrl: null })
  }
}
