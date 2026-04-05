import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * DELETE /api/decks/[id]/cards/[cardId] - Supprime une carte du deck
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const { id, cardId } = await params
    const userId = request.headers.get('x-user-id')

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

    const { error: deleteError } = await supabase
      .from('DeckCard')
      .delete()
      .eq('deckId', id)
      .eq('cardId', cardId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing card from deck:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la carte' },
      { status: 500 }
    )
  }
}
 