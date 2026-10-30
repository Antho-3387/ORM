import { NextRequest, NextResponse } from 'next/server'
import { getScryfallCardImages } from '@/lib/scryfall-images'

const MAX_NAMES_PER_REQUEST = 250

export async function POST(request: NextRequest) {
  let body: { names?: unknown }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Le corps de la requête doit être un JSON valide.' }, { status: 400 })
  }

  if (
    !Array.isArray(body.names) ||
    body.names.length === 0 ||
    body.names.length > MAX_NAMES_PER_REQUEST ||
    body.names.some((name) => typeof name !== 'string' || !name.trim() || name.length > 200)
  ) {
    return NextResponse.json(
      { error: `Fournissez entre 1 et ${MAX_NAMES_PER_REQUEST} noms de cartes valides.` },
      { status: 400 }
    )
  }

  try {
    const images = await getScryfallCardImages(body.names as string[])
    const notFound = Object.entries(images)
      .filter(([, imageUrl]) => !imageUrl)
      .map(([name]) => name)

    return NextResponse.json({ images, notFound })
  } catch (error) {
    console.error('Erreur lors du chargement groupé des images Scryfall:', error)
    return NextResponse.json(
      { error: 'Scryfall ne répond pas pour le moment. Réessayez de charger les images.' },
      { status: 502 }
    )
  }
}
