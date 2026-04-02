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
      query = query.eq('userId', userId)
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
            // Chercher la carte en DB par nom
            let card = await prisma.card.findFirst({
              where: { name: cardName },
            })

            if (!card) {
              // Si pas en DB, chercher sur Scryfall
              const scryfallResults = await searchCards(cardName)
              let scryfallCard = scryfallResults[0] || null

              // Créer ou récupérer depuis Scryfall
              if (scryfallCard) {
                // Vérifier si elle existe déjà par scryfallId
                card = await prisma.card.findFirst({
                  where: { scryfallId: scryfallCard.id },
                })

                if (!card) {
                  // Créer avec les données de Scryfall
                  card = await prisma.card.create({
                    data: {
                      name: scryfallCard.name,
                      scryfallId: scryfallCard.id,
                      type: scryfallCard.type_line || 'Unknown',
                      manaValue: scryfallCard.mana_value || 0,
                      colors: scryfallCard.colors?.join('') || '',
                      imageUrl: scryfallCard.image_uris?.normal || '',
                    },
                  })
                }
              } else {
                // Fallback: créer avec données par défaut
                card = await prisma.card.create({
                  data: {
                    name: cardName,
                    scryfallId: '',
                    type: 'Unknown',
                  },
                })
              }
            }

            // Ajouter la carte au deck
            if (card) {
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
