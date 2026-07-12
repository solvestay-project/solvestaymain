import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { resolveAiSearchAccess } from '@/lib/ai/access'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        can_search: false,
        reason: 'login_required',
        trial_remaining: 0,
        is_subscriber: false,
      })
    }

    const access = await resolveAiSearchAccess(user.id)
    return NextResponse.json(access)
  } catch (error) {
    console.error('AI search access error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
