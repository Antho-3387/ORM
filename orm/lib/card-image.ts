export interface CardImageSource {
  image_uris?: {
    small?: string
    normal?: string
    large?: string
  }
  card_faces?: Array<{
    image_uris?: {
      small?: string
      normal?: string
      large?: string
    }
  }>
}

export function getCardImageUrl(
  card: CardImageSource | null | undefined,
  size: 'small' | 'normal' | 'large' = 'normal'
) {
  return (
    card?.image_uris?.[size] ||
    card?.card_faces?.find((face) => face.image_uris?.[size])?.image_uris?.[size]
  )
}
