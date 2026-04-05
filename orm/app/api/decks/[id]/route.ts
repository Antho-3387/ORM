import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/decks/[id] - Récupère un deck spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: deck, error } = await supabase
      .from('Deck')
      .select('*, DeckCard(*, Card(*))')
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Deck non trouvé' },
        { status: 404 }
      )
    }

    if (error) {
      throw error
    }

    return NextResponse.json(deck)
  } catch (error) {
    console.error('Error fetching deck:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du deck' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/decks/[id] - Met à jour un deck
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')
    const { name, description, list } = await request.json()

    const { data: deck, error: fetchError } = await supabase
      .from('Deck')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Deck non trouvé' },
        { status: 404 }
      )
    }

    if (fetchError) {
      throw fetchError
    }

    if (!deck || deck.userId !== userId) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (list !== undefined) updateData.list = list

    const { data: updatedDeck, error: updateError } = await supabase
      .from('Deck')
      .update(updateData)
      .eq('id', id)
      .select('*, DeckCard(*, Card(*))')
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json(updatedDeck)
  } catch (error) {
    console.error('Error updating deck:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du deck' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/decks/[id] - Supprime un deck
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')

    const { data: deck, error: fetchError } = await supabase
      .from('Deck')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Deck non trouvé' },
        { status: 404 }
      )
    }

    if (fetchError) {
      throw fetchError
    }

    if (!deck || deck.userId !== userId) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabase
      .from('Deck')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deck:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du deck' },
      { status: 500 }
    )
  }
}
