import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/decks/[id]/cards - Ajoute une carte à un deck
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')
    const { cardId, quantity } = await request.json()

    const { data: deck, error: deckError } = await supabase
      .from('Deck')
      .select('*')
      .eq('id', id)
      .single()

    if (deckError && deckError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Deck non trouvé' },
        { status: 404 }
      )
    }

    if (deckError) {
      throw deckError
    }

    if (!deck || deck.userId !== userId) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // cardId peut être soit l'ID Supabase soit l'ID Scryfall
    // Chercher la carte dans la BD
    const { data: card, error: cardError } = await supabase
      .from('Card')
      .select('*')
      .or(`id.eq.${cardId},scryfallId.eq.${cardId}`)
      .limit(1)
      .single()

    if (cardError && cardError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Carte non trouvée' },
        { status: 404 }
      )
    }

    if (cardError) {
      throw cardError
    }

    const { data: deckCard, error: upsertError } = await supabase
      .from('DeckCard')
      .upsert({
        deckId: id,
        cardId: card.id,
        quantity,
      })
      .select('*, Card(*)')
      .single()

    if (upsertError) {
      throw upsertError
    }

    return NextResponse.json(deckCard, { status: 201 })
  } catch (error) {
    console.error('Error adding card to deck:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de la carte' },
      { status: 500 }
    )
  }
}
