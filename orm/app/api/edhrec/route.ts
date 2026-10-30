import { NextRequest, NextResponse } from 'next/server'

interface EdhrecCardView {
  id?: string
  name?: string
  slug?: string
  sanitized?: string
  image_version?: string | number
  synergy?: number
  num_decks?: number
}

interface EdhrecPage {
  container?: {
    json_dict?: {
      card?: { name?: string }
      cardlists?: Array<{
        tag?: string
        cardviews?: EdhrecCardView[]
      }>
    }
  }
}

function normalizeSlug(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET(request: NextRequest) {
  const commander = request.nextUrl.searchParams.get('commander')?.trim()

  if (!commander) {
    return NextResponse.json(
      { error: 'Le nom du commandant est requis.' },
      { status: 400 }
    )
  }

  const slug = normalizeSlug(commander)
  if (!slug || slug.length > 100) {
    return NextResponse.json(
      { error: 'Le nom du commandant est invalide.' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `https://json.edhrec.com/pages/commanders/${slug}.json`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
        next: { revalidate: 3600 },
      }
    )

    if (response.status === 404) {
      return NextResponse.json(
        { error: `Aucun commandant EDHREC trouvé pour « ${commander} ».` },
        { status: 404 }
      )
    }

    if (!response.ok) {
      console.error(`EDHREC a répondu avec le statut ${response.status} pour "${slug}".`)
      return NextResponse.json(
        { error: 'Le service EDHREC est momentanément indisponible.' },
        { status: 502 }
      )
    }

    const page = (await response.json()) as EdhrecPage
    const commanderData = page.container?.json_dict
    const topCards = commanderData?.cardlists?.find((list) => list.tag === 'topcards')

    if (!commanderData || !topCards?.cardviews) {
      console.error(`Réponse EDHREC invalide pour "${slug}": liste de cartes absente.`)
      return NextResponse.json(
        { error: 'Les recommandations EDHREC sont momentanément indisponibles.' },
        { status: 502 }
      )
    }

    const recommendations = topCards.cardviews.flatMap((card) => {
      const id = card.id?.toLowerCase()
      const cardSlug = card.slug || card.sanitized

      if (
        !id ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id) ||
        !card.name ||
        !cardSlug ||
        !/^[a-z0-9-]+$/.test(cardSlug)
      ) {
        return []
      }

      const imageVersion = card.image_version
        ? `?${encodeURIComponent(String(card.image_version))}`
        : ''

      return [{
        id,
        name: card.name,
        imageUrl: `https://card-images.edhrec.com/grid/front/${id[0]}/${id[1]}/${id}.webp${imageVersion}`,
        edhrecUrl: `https://edhrec.com/cards/${cardSlug}`,
        synergy: Number.isFinite(card.synergy) ? card.synergy : undefined,
        deckCount: Number.isFinite(card.num_decks) ? card.num_decks : undefined,
      }]
    })

    return NextResponse.json({
      commander: commanderData.card?.name || commander,
      commanderUrl: `https://edhrec.com/commanders/${slug}`,
      recommendations,
    })
  } catch (error) {
    console.error(`Erreur lors de l'appel à EDHREC pour "${slug}":`, error)
    return NextResponse.json(
      { error: 'Impossible de joindre EDHREC pour le moment.' },
      { status: 502 }
    )
  }
}
