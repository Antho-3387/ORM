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
    const { name, description, userId } = body

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'name et userId sont requis' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('Deck')
      .insert([{ name, description, userId }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
