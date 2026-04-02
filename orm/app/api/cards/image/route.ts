export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cardName = searchParams.get('name')

  if (!cardName) {
    return Response.json({ error: 'Missing card name' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(cardName)}"&unique=cards`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return Response.json({ imageUrl: null })
    }

    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      const card = data.data[0]
      return Response.json({
        imageUrl: card.image_uris?.normal || null,
      })
    }

    return Response.json({ imageUrl: null })
  } catch (error) {
    console.error('Error fetching card image:', error)
    return Response.json({ imageUrl: null })
  }
}
