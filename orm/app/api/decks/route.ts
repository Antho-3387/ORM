import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/decks - Liste tous les decks de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decks = await prisma.deck.findMany({
      where: { userId },
      include: {
        cards: {
          include: {
            card: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(decks)
  } catch (error) {
    console.error('Error fetching decks:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des decks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/decks - Crée un nouveau deck
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du deck est requis' },
        { status: 400 }
      )
    }

    const deck = await prisma.deck.create({
      data: {
        name,
        description,
        userId,
      },
    })

    return NextResponse.json(deck, { status: 201 })
  } catch (error) {
    console.error('Error creating deck:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du deck' },
      { status: 500 }
    )
  }
}
