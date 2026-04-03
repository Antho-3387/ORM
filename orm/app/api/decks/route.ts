import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/decks - Récupérer tous les decks ou les decks de l'utilisateur
 * Query params: userId (optionnel) pour filtrer par utilisateur
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    let query = supabase
      .from('Deck')
      .select(`
        id,
        name,
        description,
        userId,
        createdAt,
        user:User(email, name)
      `)

    if (userId) {
      // Cast userId to UUID for proper comparison
      query = query.eq('userId', userId as any)
    }

    const { data, error } = await query.order('createdAt', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/decks - Créer un nouveau deck
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, userId, list } = body

    // Valider les champs requis
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom du deck est requis' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      )
    }

    if (!list || !list.trim()) {
      return NextResponse.json(
        { error: 'La decklist est requise' },
        { status: 400 }
      )
    }

    // Préparer les données
    const deckData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      userId: userId,
      list: list.trim(),
    }

    // Insérer le deck
    const { data, error } = await supabase
      .from('Deck')
      .insert([deckData])
      .select()
      .maybeSingle()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: `Erreur lors de la création du deck: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Impossible de créer le deck' },
        { status: 500 }
      )
    }

    console.log('Deck créé:', data)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/decks error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
