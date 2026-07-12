import { z } from 'zod'

export const DreamHomeCriteriaSchema = z.object({
  listing_type: z.enum(['sale', 'rent', 'lease']).optional(),
  max_price: z.number().positive().optional(),
  min_price: z.number().nonnegative().optional(),
  bedrooms: z.number().int().min(0).max(10).optional(),
  city: z.string().optional(),
  office_location: z.string().optional(),
  max_commute_minutes: z.number().int().positive().max(180).optional(),
  amenities: z.array(z.string()).optional(),
  lifestyle_tags: z.array(z.string()).optional(),
  property_types: z.array(z.string()).optional(),
})

export type DreamHomeCriteria = z.infer<typeof DreamHomeCriteriaSchema>

export const MatchExplanationSchema = z.object({
  property_id: z.string().uuid(),
  match_score: z.number().min(0).max(100),
  reasons: z.array(z.string()).min(1).max(8),
})

export const MatchExplanationsResponseSchema = z.object({
  matches: z.array(MatchExplanationSchema),
})

export type MatchExplanation = z.infer<typeof MatchExplanationSchema>

export interface ScoredPropertySignals {
  price_score: number
  bedroom_score: number
  amenity_score: number
  commute_score: number
  lifestyle_score: number
  commute_minutes: number | null
  matched_amenities: string[]
  matched_lifestyle: string[]
}

export interface ScoredPropertyMatch {
  property_id: string
  match_score: number
  signals: ScoredPropertySignals
  reasons: string[]
}

export interface AiSearchAccess {
  can_search: boolean
  reason: 'authenticated' | 'trial_available' | 'subscribed' | 'login_required' | 'trial_used' | 'daily_limit'
  trial_remaining: number
  is_subscriber: boolean
  searches_today?: number
  daily_limit?: number
}
