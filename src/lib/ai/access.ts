import { createClient } from '@supabase/supabase-js'
import type { AiSearchAccess } from './dream-home-schema'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function dailyLimit(): number {
  const n = parseInt(process.env.AI_SEARCH_DAILY_LIMIT || '20', 10)
  return Number.isFinite(n) && n > 0 ? n : 20
}

export async function getActiveSubscription(userId: string) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}

export async function getProfileAiTrial(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('ai_trial_used')
    .eq('id', userId)
    .maybeSingle()

  if (error) return false
  return Boolean(data?.ai_trial_used)
}

export async function countSearchesToday(userId: string): Promise<number> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { count, error } = await supabaseAdmin
    .from('ai_search_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())

  if (error) return 0
  return count ?? 0
}

export async function resolveAiSearchAccess(
  userId: string | null,
): Promise<AiSearchAccess> {
  if (!userId) {
    return {
      can_search: false,
      reason: 'login_required',
      trial_remaining: 0,
      is_subscriber: false,
    }
  }

  const subscription = await getActiveSubscription(userId)
  if (subscription) {
    const limit = dailyLimit()
    const searchesToday = await countSearchesToday(userId)
    if (searchesToday >= limit) {
      return {
        can_search: false,
        reason: 'daily_limit',
        trial_remaining: 0,
        is_subscriber: true,
        searches_today: searchesToday,
        daily_limit: limit,
      }
    }
    return {
      can_search: true,
      reason: 'subscribed',
      trial_remaining: 0,
      is_subscriber: true,
      searches_today,
      daily_limit: limit,
    }
  }

  const trialUsed = await getProfileAiTrial(userId)
  if (!trialUsed) {
    return {
      can_search: true,
      reason: 'trial_available',
      trial_remaining: 1,
      is_subscriber: false,
    }
  }

  return {
    can_search: false,
    reason: 'trial_used',
    trial_remaining: 0,
    is_subscriber: false,
  }
}

export async function markTrialUsed(userId: string) {
  await supabaseAdmin
    .from('profiles')
    .update({ ai_trial_used: true })
    .eq('id', userId)
}

export async function logAiSearchSession(params: {
  user_id: string
  query_text: string
  parsed_criteria: unknown
  result_count: number
  used_trial: boolean
}) {
  try {
    await supabaseAdmin.from('ai_search_sessions').insert({
      user_id: params.user_id,
      query_text: params.query_text,
      parsed_criteria: params.parsed_criteria,
      result_count: params.result_count,
      used_trial: params.used_trial,
    })
  } catch {
    // Non-fatal if table not migrated yet
  }
}
