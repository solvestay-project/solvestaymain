'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { PropertyCard } from '@/components/PropertyCard'
import { useAuthStore } from '@/lib/store'
import type { Property } from '@/lib/types'
import type { AiSearchAccess, DreamHomeCriteria } from '@/lib/ai/dream-home-schema'
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'

const EXAMPLE_QUERIES = [
  'I work at Manyata Tech Park. Budget ₹80 lakh. 2BHK with good schools nearby and a gym.',
  'Need a furnished 1BHK for rent under ₹25k in Koramangala, close to metro.',
  'Family-friendly 3BHK in Whitefield, low traffic, gated community with pool.',
]

interface SearchResult {
  property: Property
  match_score: number
  reasons: string[]
  commute_minutes: number | null
}

export default function AiSearchPageClient() {
  const { user, hasActiveSubscription } = useAuthStore()
  const [query, setQuery] = useState('')
  const [access, setAccess] = useState<AiSearchAccess | null>(null)
  const [loadingAccess, setLoadingAccess] = useState(true)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [criteria, setCriteria] = useState<DreamHomeCriteria | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const loadAccess = useCallback(async () => {
    setLoadingAccess(true)
    try {
      const res = await fetch('/api/ai-search/access')
      const data = (await res.json()) as AiSearchAccess
      setAccess(data)
    } catch {
      setAccess(null)
    } finally {
      setLoadingAccess(false)
    }
  }, [])

  useEffect(() => {
    loadAccess()
  }, [loadAccess, user?.id, hasActiveSubscription])

  const handleSearch = async () => {
    if (!user) {
      toast.error('Sign in to try AI Dream Home Search')
      return
    }
    if (!query.trim()) {
      toast.error('Describe your dream home first')
      return
    }

    setSearching(true)
    setHasSearched(true)
    try {
      const res = await fetch('/api/ai-search/dream-home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await res.json()

      if (res.status === 401) {
        toast.error('Please sign in to continue')
        return
      }
      if (res.status === 403 && data.requires_subscription) {
        toast.error('Subscribe to continue using AI search')
        setResults([])
        await loadAccess()
        return
      }
      if (res.status === 429) {
        toast.error(data.error || 'Daily limit reached')
        return
      }
      if (!res.ok) {
        toast.error(data.error || 'Search failed')
        return
      }

      setResults(data.results || [])
      setCriteria(data.criteria || null)
      await loadAccess()

      if (data.used_trial) {
        toast.success('You used your free AI search tryout. Subscribe for unlimited searches.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const accessBadge = () => {
    if (loadingAccess) return null
    if (!user) {
      return (
        <Badge variant="outline" className="gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          Sign in for 1 free try
        </Badge>
      )
    }
    if (access?.is_subscriber) {
      return (
        <Badge className="gap-1.5 bg-primary/15 text-primary border-primary/30">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Included in your plan
        </Badge>
      )
    }
    if (access?.trial_remaining === 1) {
      return (
        <Badge variant="secondary" className="gap-1.5 border border-primary/30">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          1 free try available
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="gap-1.5 text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        Subscribe to continue
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="flex justify-center mb-4">{accessBadge()}</div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
              <Wand2 className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              AI Dream Home{' '}
              <span className="font-serif italic text-primary">Search</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Skip the filters. Describe your ideal home — budget, office, BHK,
              lifestyle — and get ranked matches with clear reasons why each fits.
            </p>
          </motion.div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm mb-8">
            <Textarea
              placeholder="Example: I work at Manyata Tech Park. My budget is ₹80 lakh. I need a 2BHK with good schools nearby, low traffic, and a gym."
              className="min-h-[140px] text-base resize-none mb-4"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={searching}
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {EXAMPLE_QUERIES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-left max-w-full truncate"
                  onClick={() => setQuery(ex)}
                >
                  {ex.slice(0, 55)}…
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {!user ? (
                <Button asChild className="flex-1">
                  <Link href="/auth/login?redirect=/ai-search">Sign in to search</Link>
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={handleSearch}
                  disabled={searching || (access != null && !access.can_search && access.reason === 'trial_used')}
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finding matches…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Find my dream home
                    </>
                  )}
                </Button>
              )}
              {access?.reason === 'trial_used' && !access.is_subscriber && (
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/pricing">View plans</Link>
                </Button>
              )}
            </div>
          </div>

          {criteria && hasSearched && (
            <div className="mb-8 p-4 rounded-xl bg-muted/50 border text-sm text-muted-foreground">
              <span className="font-medium text-foreground">AI understood: </span>
              {[
                criteria.bedrooms != null && `${criteria.bedrooms} BHK`,
                criteria.max_price != null && `budget up to ₹${criteria.max_price.toLocaleString('en-IN')}`,
                criteria.city,
                criteria.listing_type,
                criteria.office_location && `near ${criteria.office_location}`,
              ]
                .filter(Boolean)
                .join(' · ') || 'General property search'}
            </div>
          )}

          {hasSearched && !searching && results.length === 0 && (
            <div className="text-center py-16 rounded-2xl border bg-card">
              <p className="text-lg font-medium mb-2">No strong matches yet</p>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your budget, city, or BHK. More listings are added daily.
              </p>
              <Button asChild variant="outline">
                <Link href="/properties">Browse all properties</Link>
              </Button>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">Top matches</h2>
              {results.map((item, index) => (
                <motion.div
                  key={item.property.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-2xl border bg-card overflow-hidden shadow-sm"
                >
                  <div className="p-4 sm:p-5 border-b bg-primary/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Badge className="text-lg px-3 py-1 bg-primary text-primary-foreground">
                        {item.match_score}% match
                      </Badge>
                      {index === 0 && (
                        <span className="text-sm font-medium text-primary">Best match</span>
                      )}
                    </div>
                    {item.commute_minutes != null && (
                      <span className="text-sm text-muted-foreground">
                        ~{item.commute_minutes} min commute
                      </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    <ul className="mb-5 space-y-2">
                      {item.reasons.map((reason) => (
                        <li key={reason} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                    <PropertyCard property={item.property} variant="list" />
                    <div className="mt-4 flex justify-end">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/properties/${item.property.id}`}>
                          View details
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {hasSearched && results.length > 0 && (
            <div className="mt-12 p-6 rounded-2xl bg-accent text-white text-center">
              <p className="font-semibold mb-2">Found your match?</p>
              <p className="text-white/85 text-sm mb-4">
                Subscribe to reveal owner contacts and chat directly — zero brokerage.
              </p>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/pricing">Get a plan</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
