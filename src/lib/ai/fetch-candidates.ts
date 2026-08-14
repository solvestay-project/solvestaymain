import { createClient } from '@supabase/supabase-js'
import type { Property } from '@/lib/types'
import type { DreamHomeCriteria } from './dream-home-schema'
import { applyPropertyTypeBrowseFilter } from '@/lib/property-filters'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function fetchCandidateProperties(
  criteria: DreamHomeCriteria,
): Promise<Property[]> {
  let query = supabaseAdmin
    .from('properties')
    .select(
      '*, owner:profiles(id, full_name, phone, avatar_url, is_verified)',
    )
    .eq('status', 'approved')
    .eq('is_active', true)
    .eq('listing_availability', 'available')
    .limit(150)

  if (criteria.city) {
    query = query.ilike('city', `%${criteria.city}%`)
  }

  if (criteria.listing_type) {
    query = query.eq('listing_type', criteria.listing_type)
  }

  if (criteria.max_price) {
    query = query.lte('price', Math.round(criteria.max_price * 1.15))
  }

  if (criteria.min_price) {
    query = query.gte('price', criteria.min_price)
  }

  if (criteria.bedrooms != null) {
    const lo = Math.max(0, criteria.bedrooms - 1)
    const hi = criteria.bedrooms + 1
    query = query.gte('bedrooms', lo).lte('bedrooms', hi)
  }

  if (criteria.property_types?.length === 1) {
    query = applyPropertyTypeBrowseFilter(query, criteria.property_types[0])
  } else if (criteria.property_types?.length) {
    const types = criteria.property_types.filter((t) => t !== "pg")
    query = applyPropertyTypeBrowseFilter(query, undefined)
    if (types.length) {
      query = query.in("property_type", types)
    }
  } else {
    query = applyPropertyTypeBrowseFilter(query, undefined)
  }

  const { data, error } = await query

  if (error) {
    console.error('fetchCandidateProperties:', error.message)
    return []
  }

  return (data || []) as Property[]
}
