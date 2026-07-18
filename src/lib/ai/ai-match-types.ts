export interface AiMatchProperty {
  id: string
  name: string
  subtitle: string
  price: string
  priceValue: number
  config: string
  beds: number
  baths: number
  area: string
  features: string[]
  commuteLabel: string
  mapCommuteText: string
  matchPercentage: number
  isExclusive: boolean
  lat: number
  lng: number
  aiAnalysis: string
  imageUrl: string
  thumbnailUrl: string
}

export const AI_MATCH_CRITERIA_LABEL =
  'AI understood: 2 BHK • ₹80L • Near Manyata'
