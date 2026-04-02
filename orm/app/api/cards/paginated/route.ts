import { getCardsPage, searchCards, sortCards } from '@/lib/card-database'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') || '0')
  const pageSize = Number(searchParams.get('limit') || '50')
  const query = searchParams.get('q') || ''
  const sortBy = (searchParams.get('sort') as 'name' | 'mana' | 'rarity') || 'name'

  try {
    let cards = getCardsPage(page, pageSize).cards

    // Apply search if query provided
    if (query) {
      cards = searchCards(query)
        .sort((a, b) => {
          // Exact matches first
          const aExact = a.name.toLowerCase() === query.toLowerCase()
          const bExact = b.name.toLowerCase() === query.toLowerCase()
          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1
          return a.name.localeCompare(b.name)
        })
        .slice(page * pageSize, (page + 1) * pageSize)
    } else {
      // Apply pagination
      cards = getCardsPage(page, pageSize).cards
    }

    // Apply sorting
    cards = sortCards(cards, sortBy)

    const { total, hasMore } = getCardsPage(page, pageSize)

    return Response.json({
      data: cards,
      page,
      pageSize,
      total,
      hasMore,
      query: query || null
    })
  } catch (error) {
    console.error('Error in paginated cards endpoint:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
