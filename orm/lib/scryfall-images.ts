interface ScryfallCardImage {
  name?: string
  image_uris?: { normal?: string }
  card_faces?: Array<{ image_uris?: { normal?: string } }>
}

interface ScryfallCollectionResponse {
  data?: ScryfallCardImage[]
  not_found?: Array<{ name?: string }>
}

const SCRYFALL_API = 'https://api.scryfall.com'
const CACHE_TTL = 12 * 60 * 60 * 1000
const COLLECTION_LIMIT = 75
const imageCache = new Map<string, { imageUrl: string; expiresAt: number }>()

let requestQueue = Promise.resolve()
let lastRequestAt = 0

function cacheKey(name: string) {
  return name.trim().toLowerCase()
}

function imageForCard(card: ScryfallCardImage) {
  return (
    card.image_uris?.normal ||
    card.card_faces?.find((face) => face.image_uris?.normal)?.image_uris?.normal ||
    null
  )
}

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function queueScryfallRequest<T>(request: () => Promise<T>): Promise<T> {
  const result = requestQueue.then(async () => {
    const wait = Math.max(0, 500 - (Date.now() - lastRequestAt))
    if (wait > 0) await delay(wait)
    lastRequestAt = Date.now()
    return request()
  })

  requestQueue = result.then(() => undefined, () => undefined)
  return result
}

async function fetchWithRetry(url: string | URL, init: RequestInit) {
  for (let attempt = 0; attempt < 4; attempt++) {
    let response: Response
    try {
      response = await queueScryfallRequest(() => fetch(url, init))
    } catch (error) {
      if (attempt === 3) throw error
      await delay(Math.min(1000 * (2 ** attempt), 8000))
      continue
    }

    if (response.status !== 429 && response.status < 500) return response
    if (attempt === 3) return response

    const retryAfter = Number(response.headers.get('Retry-After'))
    await delay(Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : Math.min(1000 * (2 ** attempt), 8000))
  }

  throw new Error('Scryfall could not be reached after multiple attempts.')
}

async function fetchCollection(names: string[]) {
  const response = await fetchWithRetry(`${SCRYFALL_API}/cards/collection`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'MagicDecksORM/1.0',
    },
    body: JSON.stringify({ identifiers: names.map((name) => ({ name })) }),
    signal: AbortSignal.timeout(20_000),
  })

  if (!response.ok) {
    throw new Error(`Scryfall collection lookup failed with status ${response.status}.`)
  }

  return response.json() as Promise<ScryfallCollectionResponse>
}

async function fetchFuzzyImage(name: string) {
  const url = new URL(`${SCRYFALL_API}/cards/named`)
  url.searchParams.set('fuzzy', name)
  const response = await fetchWithRetry(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'MagicDecksORM/1.0' },
    signal: AbortSignal.timeout(10_000),
  })

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`Scryfall image lookup failed with status ${response.status}.`)
  }

  return imageForCard(await response.json() as ScryfallCardImage)
}

export async function getScryfallCardImages(names: string[]) {
  const uniqueNames = [...new Map(names.map((name) => [cacheKey(name), name.trim()])).values()]
  const images: Record<string, string | null> = {}
  const missingNames: string[] = []

  for (const name of uniqueNames) {
    const key = cacheKey(name)
    const cached = imageCache.get(key)

    if (cached && cached.expiresAt > Date.now()) {
      images[name] = cached.imageUrl
    } else {
      if (cached) imageCache.delete(key)
      missingNames.push(name)
    }
  }

  for (let start = 0; start < missingNames.length; start += COLLECTION_LIMIT) {
    const batch = missingNames.slice(start, start + COLLECTION_LIMIT)
    const response = await fetchCollection(batch)

    for (const card of response.data || []) {
      if (!card.name) continue
      const imageUrl = imageForCard(card)
      if (!imageUrl) continue

      const key = cacheKey(card.name)
      imageCache.set(key, { imageUrl, expiresAt: Date.now() + CACHE_TTL })
      images[card.name] = imageUrl
    }

    for (const missing of response.not_found || []) {
      if (missing.name) images[missing.name] = null
    }
  }

  const returnedImages = new Map(
    Object.entries(images).map(([name, imageUrl]) => [cacheKey(name), imageUrl])
  )

  for (const name of uniqueNames) {
    const key = cacheKey(name)
    if (returnedImages.get(key)) continue

    const imageUrl = await fetchFuzzyImage(name)
    returnedImages.set(key, imageUrl)
    if (imageUrl) {
      imageCache.set(key, { imageUrl, expiresAt: Date.now() + CACHE_TTL })
    }
  }

  return Object.fromEntries(
    uniqueNames.map((name) => [name, returnedImages.get(cacheKey(name)) || null])
  )
}
