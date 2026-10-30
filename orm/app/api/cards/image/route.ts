import { NextResponse } from 'next/server'
import { getScryfallCardImages } from '@/lib/scryfall-images'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cardName = searchParams.get('name')?.trim()

  if (!cardName) {
    return Response.json({ error: 'Le nom de la carte est requis.' }, { status: 400 })
  }

  if (cardName.length > 200) {
    return Response.json({ error: 'Le nom de la carte est trop long.' }, { status: 400 })
  }

  try {
    const images = await getScryfallCardImages([cardName])
    return NextResponse.json({ imageUrl: images[cardName] || null })
  } catch (error) {
    console.error(`Error fetching image for "${cardName}":`, error)
    return NextResponse.json(
      { error: 'Impossible de récupérer cette image pour le moment.' },
      { status: 502 }
    )
  }
}
