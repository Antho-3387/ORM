import { NextRequest, NextResponse } from 'next/server'
import { searchCards, searchCardsByColor, searchCardsByPower } from '@/lib/scryfall'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/cards/search - Recherche des cartes par nom
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const color = searchParams.get('color')
    const power = searchParams.get('power')

    let results = []

    if (color) {
      results = await searchCardsByColor(color)
    } else if (power) {
      results = await searchCardsByPower(power)
    } else if (query) {
      results = await searchCards(query)
    } else {
      return NextResponse.json(
        { error: 'Paramètre de recherche requis' },
        { status: 400 }
      )
    }

    // Sauvegarder les cartes trouvées dans la BD
    for (const scryfallCard of results) {
      const { error } = await supabase
        .from('Card')
        .upsert({
          scryfallId: scryfallCard.id,
          name: scryfallCard.name,
          manaValue: scryfallCard.mana_value,
          colors: JSON.stringify(scryfallCard.colors || []),
          type: scryfallCard.type_line,
          imageUrl: scryfallCard.image_uris?.normal,
        })

      if (error) {
        console.error('Error upserting card:', error)
        throw error
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching cards:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cards - Crée une carte manuellement
 */
export async function POST(request: NextRequest) {
  try {
    const { scryfallId, name, manaValue, colors, type, imageUrl } = await request.json()

    const { data: card, error } = await supabase
      .from('Card')
      .upsert({
        scryfallId,
        name,
        manaValue,
        colors: Array.isArray(colors) ? JSON.stringify(colors) : colors || "",
        type,
        imageUrl,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la carte' },
      { status: 500 }
    )
  }
}
