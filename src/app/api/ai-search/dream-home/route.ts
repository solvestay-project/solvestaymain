import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import {
  resolveAiSearchAccess,
  markTrialUsed,
  logAiSearchSession,
  getActiveSubscription,
} from '@/lib/ai/access'
import { parseDreamQuery } from '@/lib/ai/parse-dream-query'
import { fetchCandidateProperties } from '@/lib/ai/fetch-candidates'
import { geocodePlace } from '@/lib/ai/geocode'
import { scoreProperties } from '@/lib/ai/score-properties'
import { explainMatches } from '@/lib/ai/explain-matches'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const query = typeof body.query === 'string' ? body.query.trim() : ''

    if (!query || query.length < 10) {
      return NextResponse.json(
        { error: 'Please describe your dream home in at least 10 characters' },
        { status: 400 },
      )
    }

    if (query.length > 2000) {
      return NextResponse.json({ error: 'Query is too long' }, { status: 400 })
    }

    const access = await resolveAiSearchAccess(user.id)
    if (!access.can_search) {
      if (access.reason === 'daily_limit') {
        return NextResponse.json(
          {
            error: 'Daily AI search limit reached. Try again tomorrow.',
            daily_limit: access.daily_limit,
          },
          { status: 429 },
        )
      }
      return NextResponse.json(
        {
          error: 'Subscribe to continue using AI Dream Home Search',
          requires_subscription: true,
          trial_remaining: access.trial_remaining,
        },
        { status: 403 },
      )
    }

    const usedTrial = access.reason === 'trial_available'
    const criteria = await parseDreamQuery(query)

    const officePoint = criteria.office_location
      ? await geocodePlace(`${criteria.office_location}, ${criteria.city || 'Bangalore'}, India`)
      : null

    const candidates = await fetchCandidateProperties(criteria)
    let scored = await scoreProperties(candidates, criteria, officePoint)

    const propertyMap = new Map(candidates.map((p) => [p.id, p]))
    scored = await explainMatches(query, criteria, scored, propertyMap)

    const results = scored
      .map((s) => {
        const property = propertyMap.get(s.property_id)
        if (!property) return null
        return {
          property,
          match_score: s.match_score,
          reasons: s.reasons,
          commute_minutes: s.signals.commute_minutes,
        }
      })
      .filter(Boolean)

    if (usedTrial) {
      await markTrialUsed(user.id)
    }

    await logAiSearchSession({
      user_id: user.id,
      query_text: query,
      parsed_criteria: criteria,
      result_count: results.length,
      used_trial: usedTrial,
    })

    const subscription = await getActiveSubscription(user.id)

    return NextResponse.json({
      success: true,
      query,
      criteria,
      office_geocoded: officePoint?.display_name ?? null,
      results,
      used_trial: usedTrial,
      is_subscriber: Boolean(subscription),
      trial_remaining_after: usedTrial ? 0 : access.trial_remaining,
    })
  } catch (error) {
    console.error('AI dream home search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
