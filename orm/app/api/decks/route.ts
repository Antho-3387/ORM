import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/decks - Liste tous les decks de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      // Si pas d'authentification, retourne une liste vide au lieu d'une erreur
      return NextResponse.json([])
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

    const { name, description, decklistText } = await request.json()

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

    // Si decklistText fourni, parser et ajouter les cartes
    if (decklistText && decklistText.trim()) {
      const lines = decklistText.split('\n').filter((line: string) => line.trim())
      
      for (const line of lines) {
        // Parser des formats: "4x Card Name", "4 Card Name", "Card Name"
        const match = line.match(/^(\d+)?\s*x?\s*(.+)$/)
        if (match) {
          const quantity = parseInt(match[1] || '1')
          const cardName = match[2].trim()

          if (cardName) {
            // Créer la carte si on ne l'a pas en DB (ou chercher)
            let card = await prisma.card.findFirst({
              where: { name: cardName },
            })

            if (!card) {
              card = await prisma.card.create({
                data: {
                  name: cardName,
                  scryfallId: '',
                  type: 'Unknown',
                },
              })
            }

            // Ajouter la carte au deck
            await prisma.deckCard.create({
              data: {
                deckId: deck.id,
                cardId: card.id,
                quantity,
              },
            })
          }
        }
      }
    }

    return NextResponse.json(deck, { status: 201 })
  } catch (error) {
    console.error('Error creating deck:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du deck' },
      { status: 500 }
    )
  }
}
