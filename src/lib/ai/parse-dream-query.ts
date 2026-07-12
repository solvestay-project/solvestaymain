import OpenAI from 'openai'
import {
  DreamHomeCriteriaSchema,
  type DreamHomeCriteria,
} from './dream-home-schema'

const PARSE_SYSTEM = `You extract structured property search criteria from natural language for an Indian real estate app.
Return ONLY valid JSON matching this shape (omit unknown fields):
{
  "listing_type": "sale" | "rent" | "lease",
  "max_price": number in INR (e.g. 80 lakh = 8000000, 25k rent = 25000),
  "min_price": number in INR,
  "bedrooms": number (BHK count),
  "city": string,
  "office_location": string (workplace or landmark),
  "max_commute_minutes": number,
  "amenities": string[],
  "lifestyle_tags": string[] (use: school, gym, family, traffic, metro, mall when relevant),
  "property_types": string[] (house, apartment, villa, pg, etc.)
}
Interpret Indian English: lakh/lac, crore/cr, BHK, PG, tech park, ORR, etc.`

function fallbackParse(query: string): DreamHomeCriteria {
  const q = query.toLowerCase()
  const criteria: DreamHomeCriteria = {}

  const bhk = q.match(/(\d)\s*bhk/)
  if (bhk) criteria.bedrooms = parseInt(bhk[1], 10)

  const lakh = q.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/)
  const crore = q.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr)/)
  if (crore) criteria.max_price = parseFloat(crore[1]) * 10000000
  else if (lakh) criteria.max_price = parseFloat(lakh[1]) * 100000

  if (q.includes('rent')) criteria.listing_type = 'rent'
  else if (q.includes('buy') || q.includes('purchase')) criteria.listing_type = 'sale'

  if (q.includes('school')) criteria.lifestyle_tags = ['school']
  if (q.includes('gym')) criteria.lifestyle_tags = [...(criteria.lifestyle_tags || []), 'gym']
  if (q.includes('traffic') || q.includes('quiet')) {
    criteria.lifestyle_tags = [...(criteria.lifestyle_tags || []), 'traffic']
  }
  if (q.includes('family')) criteria.lifestyle_tags = [...(criteria.lifestyle_tags || []), 'family']

  const commute = q.match(/(\d+)\s*min/)
  if (commute) criteria.max_commute_minutes = parseInt(commute[1], 10)

  if (q.includes('bangalore') || q.includes('bengaluru')) criteria.city = 'Bangalore'

  const officeMatch = q.match(/(?:work at|office at|near)\s+([^,.]+)/)
  if (officeMatch) criteria.office_location = officeMatch[1].trim()

  return criteria
}

export async function parseDreamQuery(query: string): Promise<DreamHomeCriteria> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return DreamHomeCriteriaSchema.parse(fallbackParse(query))
  }

  const openai = new OpenAI({ apiKey })

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PARSE_SYSTEM },
        { role: 'user', content: query },
      ],
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error('Empty LLM response')

    const parsed = JSON.parse(raw) as unknown
    return DreamHomeCriteriaSchema.parse(parsed)
  } catch {
    return DreamHomeCriteriaSchema.parse(fallbackParse(query))
  }
}
