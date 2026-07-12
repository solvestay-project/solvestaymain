import type { Property } from '@/lib/types'
import { normalizeNearbyPlaces } from '@/lib/types'
import type { DreamHomeCriteria, ScoredPropertyMatch, ScoredPropertySignals } from './dream-home-schema'
import { drivingMinutes } from './commute'
import type { GeoPoint } from './geocode'

const LIFESTYLE_KEYWORDS: Record<string, string[]> = {
  school: ['school', 'education', 'college', 'university'],
  gym: ['gym', 'fitness', 'workout'],
  family: ['family', 'kids', 'children', 'play area', 'park'],
  traffic: ['low traffic', 'quiet', 'peaceful', 'residential'],
  metro: ['metro', 'rail', 'train', 'transport'],
  mall: ['mall', 'shopping', 'market'],
}

function norm(s: string) {
  return s.toLowerCase().trim()
}

function textBlob(property: Property): string {
  const nearby = normalizeNearbyPlaces(property.nearby_places).join(' ')
  return norm(
    [property.title, property.description, property.locality, property.address, nearby].join(' '),
  )
}

function amenityList(property: Property): string[] {
  return (property.amenities || []).map(norm)
}

function scorePrice(property: Property, criteria: DreamHomeCriteria): number {
  if (!criteria.max_price && !criteria.min_price) return 70
  const price = property.price
  if (criteria.max_price && price > criteria.max_price * 1.1) return 0
  if (criteria.min_price && price < criteria.min_price * 0.9) return 40
  if (criteria.max_price) {
    const ratio = price / criteria.max_price
    if (ratio <= 1) return 100 - ratio * 15
    return Math.max(0, 100 - (ratio - 1) * 200)
  }
  return 80
}

function scoreBedrooms(property: Property, criteria: DreamHomeCriteria): number {
  if (criteria.bedrooms == null) return 70
  const b = property.bedrooms ?? 0
  const target = criteria.bedrooms
  if (b === target) return 100
  if (Math.abs(b - target) === 1) return 75
  if (Math.abs(b - target) === 2) return 40
  return 10
}

function scoreAmenities(property: Property, criteria: DreamHomeCriteria): {
  score: number
  matched: string[]
} {
  const wanted = (criteria.amenities || []).map(norm)
  if (wanted.length === 0) return { score: 70, matched: [] }
  const have = amenityList(property)
  const blob = textBlob(property)
  const matched = wanted.filter(
    (w) => have.some((h) => h.includes(w) || w.includes(h)) || blob.includes(w),
  )
  const score = Math.round((matched.length / wanted.length) * 100)
  return { score, matched }
}

function scoreLifestyle(property: Property, criteria: DreamHomeCriteria): {
  score: number
  matched: string[]
} {
  const tags = (criteria.lifestyle_tags || []).map(norm)
  if (tags.length === 0) return { score: 70, matched: [] }
  const blob = textBlob(property)
  const nearby = normalizeNearbyPlaces(property.nearby_places).map(norm)
  const matched: string[] = []

  for (const tag of tags) {
    const keys = LIFESTYLE_KEYWORDS[tag] || [tag]
    const hit =
      blob.includes(tag) ||
      keys.some(
        (k) => blob.includes(k) || nearby.some((n) => n.includes(k) || n.includes(tag)),
      )
    if (hit) matched.push(tag)
  }

  const score =
    matched.length === 0 ? 30 : Math.round((matched.length / tags.length) * 100)
  return { score, matched }
}

function scoreCommute(
  commuteMinutes: number | null,
  criteria: DreamHomeCriteria,
): number {
  if (!criteria.max_commute_minutes || commuteMinutes == null) {
    return commuteMinutes != null ? 80 : 50
  }
  if (commuteMinutes <= criteria.max_commute_minutes) return 100
  const over = commuteMinutes - criteria.max_commute_minutes
  return Math.max(0, 100 - over * 4)
}

function buildReasons(
  property: Property,
  criteria: DreamHomeCriteria,
  signals: ScoredPropertySignals,
): string[] {
  const reasons: string[] = []

  if (criteria.max_price && signals.price_score >= 60) {
    reasons.push('Within your budget')
  } else if (criteria.max_price && signals.price_score > 0) {
    reasons.push('Close to your budget range')
  }

  if (criteria.bedrooms != null && property.bedrooms === criteria.bedrooms) {
    reasons.push(`${property.bedrooms} BHK as requested`)
  } else if (criteria.bedrooms != null && property.bedrooms != null) {
    reasons.push(`${property.bedrooms} BHK layout`)
  }

  if (signals.commute_minutes != null && criteria.office_location) {
    reasons.push(`Approx. ${signals.commute_minutes} min to ${criteria.office_location}`)
  }

  for (const a of signals.matched_amenities.slice(0, 2)) {
    reasons.push(`Has ${a}`)
  }

  for (const tag of signals.matched_lifestyle) {
    if (tag.includes('school') || tag === 'school') reasons.push('Schools nearby')
    else if (tag.includes('gym') || tag === 'gym') reasons.push('Gym / fitness amenities')
    else if (tag.includes('family') || tag === 'family') reasons.push('Family-friendly area')
    else if (tag.includes('traffic') || tag === 'traffic') reasons.push('Quieter locality')
    else reasons.push(`Matches: ${tag}`)
  }

  const nearby = normalizeNearbyPlaces(property.nearby_places)
  if (nearby.length > 0 && reasons.length < 6) {
    reasons.push(`Near ${nearby.slice(0, 2).join(', ')}`)
  }

  if (property.is_verified) reasons.push('Verified listing')

  return [...new Set(reasons)].slice(0, 6)
}

async function commuteForProperty(
  office: GeoPoint | null,
  property: Property,
): Promise<number | null> {
  if (!office || property.latitude == null || property.longitude == null) return null
  return drivingMinutes(office, {
    lat: property.latitude,
    lng: property.longitude,
  })
}

export async function scoreProperties(
  properties: Property[],
  criteria: DreamHomeCriteria,
  officePoint: GeoPoint | null,
): Promise<ScoredPropertyMatch[]> {
  const results: ScoredPropertyMatch[] = []

  const commuteCap = Math.min(properties.length, 25)
  const commuteMap = new Map<string, number | null>()
  await Promise.all(
    properties.slice(0, commuteCap).map(async (p) => {
      const mins = await commuteForProperty(officePoint, p)
      commuteMap.set(p.id, mins)
    }),
  )

  for (const property of properties) {
    const price_score = scorePrice(property, criteria)
    const bedroom_score = scoreBedrooms(property, criteria)
    const { score: amenity_score, matched: matched_amenities } = scoreAmenities(
      property,
      criteria,
    )
    const { score: lifestyle_score, matched: matched_lifestyle } = scoreLifestyle(
      property,
      criteria,
    )
    const commute_minutes = commuteMap.get(property.id) ?? null
    const commute_score = scoreCommute(commute_minutes, criteria)

    const hasCommute = officePoint != null && criteria.office_location
    const weights = hasCommute
      ? { price: 0.3, bed: 0.2, amenity: 0.15, commute: 0.2, lifestyle: 0.15 }
      : { price: 0.35, bed: 0.25, amenity: 0.2, commute: 0, lifestyle: 0.2 }

    const match_score = Math.round(
      price_score * weights.price +
        bedroom_score * weights.bed +
        amenity_score * weights.amenity +
        commute_score * weights.commute +
        lifestyle_score * weights.lifestyle,
    )

    const signals: ScoredPropertySignals = {
      price_score,
      bedroom_score,
      amenity_score,
      commute_score,
      lifestyle_score,
      commute_minutes,
      matched_amenities,
      matched_lifestyle,
    }

    const reasons = buildReasons(property, criteria, signals)

    results.push({
      property_id: property.id,
      match_score,
      signals,
      reasons,
    })
  }

  return results
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10)
}
