const cardCache = new Map<string, string>()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cardName = searchParams.get('name')?.trim()

  if (!cardName) {
    return Response.json({ error: 'Le nom de la carte est requis.' }, { status: 400 })
  }

  if (cardName.length > 200) {
    return Response.json({ error: 'Le nom de la carte est trop long.' }, { status: 400 })
  }

  const cacheKey = cardName.toLocaleLowerCase()
  const cachedUrl = cardCache.get(cacheKey)
  if (cachedUrl) {
    return Response.json({ imageUrl: cachedUrl })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
      const exactUrl = new URL('https://api.scryfall.com/cards/named')
      exactUrl.searchParams.set('exact', cardName)
      const exactResponse = await fetch(exactUrl, {
        headers: { Accept: 'application/json', 'User-Agent': 'MagicDecksORM/1.0' },
        signal: controller.signal,
      })

      let response = exactResponse
      if (exactResponse.status === 404) {
        const fuzzyUrl = new URL('https://api.scryfall.com/cards/named')
        fuzzyUrl.searchParams.set('fuzzy', cardName)
        response = await fetch(fuzzyUrl, {
          headers: { Accept: 'application/json', 'User-Agent': 'MagicDecksORM/1.0' },
          signal: controller.signal,
        })
      }

      if (response.status === 404) {
        return Response.json({ imageUrl: null })
      }

      if (!response.ok) {
        console.error(`Scryfall image lookup failed for "${cardName}" (${response.status}).`)
        return Response.json(
          { error: 'Le service d’images est momentanément indisponible.' },
          { status: 502 }
        )
      }

      const card = await response.json()
      const imageUrl =
        card.image_uris?.normal ||
        card.card_faces?.find((face: { image_uris?: { normal?: string } }) => face.image_uris?.normal)
          ?.image_uris?.normal ||
        null

      if (imageUrl) cardCache.set(cacheKey, imageUrl)
      return Response.json({ imageUrl })
    } finally {
      clearTimeout(timeout)
    }
  } catch (error) {
    console.error(`Error fetching image for "${cardName}":`, error)
    return Response.json(
      { error: 'Impossible de récupérer cette image pour le moment.' },
      { status: 502 }
    )
  }
}
