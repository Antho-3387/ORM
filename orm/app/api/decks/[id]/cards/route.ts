import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

    const deck = await prisma.deck.findUnique({
      where: { id },
    })

    if (!deck || deck.userId !== userId) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // cardId peut être soit l'ID Prisma soit l'ID Scryfall
    // Chercher la carte dans la BD
    let card = await prisma.card.findUnique({
      where: { id: cardId },
    })

    // Si pas trouvé, chercher par scryfallId
    if (!card) {
      card = await prisma.card.findUnique({
        where: { scryfallId: cardId },
      })
    }

    if (!card) {
      return NextResponse.json(
        { error: 'Carte non trouvée' },
        { status: 404 }
      )
    }

    const deckCard = await prisma.deckCard.upsert({
      where: {
        deckId_cardId: {
          deckId: id,
          cardId: card.id,
        },
      },
      update: {
        quantity,
      },
      create: {
        deckId: id,
        cardId: card.id,
        quantity,
      },
      include: {
        card: true,
      },
    })

    return NextResponse.json(deckCard, { status: 201 })
  } catch (error) {
    console.error('Error adding card to deck:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de la carte' },
      { status: 500 }
    )
  }
}
