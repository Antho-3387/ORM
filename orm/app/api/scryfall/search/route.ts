import { NextRequest, NextResponse } from 'next/server'

interface ScryfallSearchError {
  code?: string
  details?: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.trim()
  const rawPage = searchParams.get('page') || '1'
  const page = Number.parseInt(rawPage, 10)

  if (!query) {
    return NextResponse.json({ error: 'Saisissez un nom ou une recherche de carte.' }, { status: 400 })
  }

  if (query.length > 1000) {
    return NextResponse.json({ error: 'La recherche ne peut pas dépasser 1 000 caractères.' }, { status: 400 })
  }

  if (!Number.isInteger(page) || page < 1 || page > 100) {
    return NextResponse.json({ error: 'Le numéro de page est invalide.' }, { status: 400 })
  }

  try {
    const url = new URL('https://api.scryfall.com/cards/search')
    url.searchParams.set('q', query)
    url.searchParams.set('page', String(page))
    url.searchParams.set('unique', 'cards')
    url.searchParams.set('order', 'edhrec')

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'MagicDecksORM/1.0',
      },
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 300 },
    })

    if (response.status === 404) {
      const body = await response.json() as ScryfallSearchError
      if (body.code === 'not_found') {
        return NextResponse.json({
          data: [],
          total_cards: 0,
          has_more: false,
        })
      }
    }

    if (response.status === 400) {
      const body = await response.json() as ScryfallSearchError
      return NextResponse.json(
        { error: body.details || 'La syntaxe de recherche est invalide.' },
        { status: 400 }
      )
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null) as ScryfallSearchError | null
      console.error(`Scryfall search failed (${response.status}): ${body?.details || 'unknown error'}`)

      return NextResponse.json(
        {
          error: response.status === 429
            ? 'La recherche est temporairement limitée. Réessayez dans quelques secondes.'
            : 'Le service de recherche de cartes est momentanément indisponible.',
        },
        { status: response.status === 429 ? 429 : 502 }
      )
    }

    const results = await response.json()
    return NextResponse.json(results)
  } catch (error) {
    console.error('Unable to reach Scryfall:', error)
    return NextResponse.json(
      { error: 'Impossible de joindre Scryfall pour le moment. Réessayez dans quelques instants.' },
      { status: 502 }
    )
  }
}
