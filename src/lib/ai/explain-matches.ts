import OpenAI from 'openai'
import type { Property } from '@/lib/types'
import type { DreamHomeCriteria, ScoredPropertyMatch } from './dream-home-schema'

/**
 * Optionally refine reason bullets via LLM; falls back to deterministic reasons.
 */
export async function explainMatches(
  query: string,
  criteria: DreamHomeCriteria,
  scored: ScoredPropertyMatch[],
  propertyMap: Map<string, Property>,
): Promise<ScoredPropertyMatch[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || scored.length === 0) return scored

  const openai = new OpenAI({ apiKey })

  const payload = scored.slice(0, 8).map((s) => {
    const p = propertyMap.get(s.property_id)
    return {
      property_id: s.property_id,
      title: p?.title,
      match_score: s.match_score,
      existing_reasons: s.reasons,
      price: p?.price,
      bedrooms: p?.bedrooms,
      city: p?.city,
      commute_minutes: s.signals.commute_minutes,
    }
  })

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Rewrite property match reasons as short user-friendly bullets (max 6 each).
Use ONLY facts from existing_reasons and provided data. Do NOT invent schools, distances, or amenities.
Return JSON: { "matches": [ { "property_id": "uuid", "reasons": ["...", "..."] } ] }`,
        },
        {
          role: 'user',
          content: JSON.stringify({ user_query: query, criteria, matches: payload }),
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) return scored

    const parsed = JSON.parse(raw) as {
      matches?: Array<{ property_id: string; reasons: string[] }>
    }

    if (!parsed.matches?.length) return scored

    const reasonMap = new Map(parsed.matches.map((m) => [m.property_id, m.reasons]))

    return scored.map((s) => {
      const refined = reasonMap.get(s.property_id)
      if (refined?.length) {
        return { ...s, reasons: refined.slice(0, 6) }
      }
      return s
    })
  } catch {
    return scored
  }
}
