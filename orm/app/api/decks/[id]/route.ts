import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/decks/[id] - Récupère un deck spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deck = await prisma.deck.findUnique({
      where: { id },
      include: {
        cards: {
          include: {
            card: true,
          },
        },
      },
    })

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck non trouvé' },
        { status: 404 }
      )
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
    const { name, description } = await request.json()

    const deck = await prisma.deck.findUnique({
      where: { id },
    })

    if (!deck || deck.userId !== userId) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const updatedDeck = await prisma.deck.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        cards: {
          include: {
            card: true,
          },
        },
      },
    })

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

    const deck = await prisma.deck.findUnique({
      where: { id },
    })

    if (!deck || deck.userId !== userId) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    await prisma.deck.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deck:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du deck' },
      { status: 500 }
    )
  }
}
