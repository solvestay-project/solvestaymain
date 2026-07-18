'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/lib/store'
import type { Property } from '@/lib/types'
import type { AiSearchAccess, DreamHomeCriteria } from '@/lib/ai/dream-home-schema'
import {
  Sparkles,
  Loader2,
  Lock,
  ArrowRight,
  MapPin,
  Bell,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import dummyMatches from '@/data/ai-matches-dummy.json'
import type { AiMatchProperty } from '@/lib/ai/ai-match-types'

const EXAMPLE_QUERIES = [
  'I work at Manyata Tech Park. Budget ₹80 lakh. 2BHK with good schools nearby and a gym.',
  '2BHK for rent under ₹25k in Koramangala, close to metro.',
  'Family-friendly 3BHK in Whitefield, gated community with pool.',
]

const curatedMatches = dummyMatches as AiMatchProperty[]

interface SearchResult {
  property: Property
  match_score: number
  reasons: string[]
  commute_minutes: number | null
}

function formatCriteriaSummary(criteria: DreamHomeCriteria) {
  return [
    criteria.bedrooms != null && `${criteria.bedrooms} BHK`,
    criteria.max_price != null &&
      `Budget up to ₹${criteria.max_price.toLocaleString('en-IN')}`,
    criteria.city,
    criteria.listing_type,
    criteria.office_location && `Near ${criteria.office_location}`,
  ]
    .filter(Boolean)
    .join(' • ')
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
  const [email, setEmail] = useState('')

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
        toast.success(
          'You used your free AI search tryout. Subscribe for unlimited searches.',
        )
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const canSearch =
    !!user &&
    !(access != null && !access.can_search && access.reason === 'trial_used')

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-foreground">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-10 sm:pt-32 sm:pb-14">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#ffffff_0%,_#F5F5F4_55%,_#EEEEEC_100%)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            {!loadingAccess && (
              <div className="mb-5 flex justify-center">
                {!user ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                    <Lock className="h-3.5 w-3.5" />
                    Sign in for 1 free try
                  </span>
                ) : access?.is_subscriber ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs text-foreground backdrop-blur">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    Included in your plan
                  </span>
                ) : access?.trial_remaining === 1 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-white/80 px-3 py-1 text-xs text-foreground backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    1 free try available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                    <Lock className="h-3.5 w-3.5" />
                    Subscribe to continue
                  </span>
                )}
              </div>
            )}

            <div className="mb-5 flex justify-center">
              <Sparkles className="h-6 w-6 text-foreground/80" strokeWidth={1.5} />
            </div>

            <h1 className="mb-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              AI Dream Home{' '}
              <span className="font-semibold">Search</span>
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Skip the filters. Describe your ideal home — budget, office, BHK,
              lifestyle — and get ranked matches with clear reasons why each
              fits.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-[1.75rem] border border-black/[0.06] bg-white p-5 text-left shadow-[0_20px_60px_-28px_rgba(0,0,0,0.28)] sm:p-6"
            >
              <Textarea
                placeholder="I work at Manyata Tech Park. Budget ₹80 lakh. 2BHK with good schools nearby and a gym."
                className="min-h-[120px] resize-none border-0 bg-transparent px-1 py-1 text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={searching}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    void handleSearch()
                  }
                }}
              />

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/[0.05] pt-4">
                {EXAMPLE_QUERIES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    className="max-w-[min(100%,18rem)] truncate rounded-full border border-black/10 bg-transparent px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-black/25 hover:text-foreground"
                    onClick={() => setQuery(ex)}
                  >
                    {ex.length > 42 ? `${ex.slice(0, 42)}…` : ex}
                  </button>
                ))}
                <div className="ml-auto flex flex-wrap gap-2 pt-1 sm:pt-0">
                  {!user ? (
                    <Button
                      asChild
                      className="rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
                    >
                      <Link href="/auth/login?redirect=/ai-search">
                        Sign in to search
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
                      onClick={handleSearch}
                      disabled={searching || !canSearch}
                    >
                      {searching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Finding…
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Search
                        </>
                      )}
                    </Button>
                  )}
                  {access?.reason === 'trial_used' && !access.is_subscriber && (
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-black/15"
                    >
                      <Link href="/pricing">View plans</Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {criteria && hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-5 inline-flex max-w-full items-center rounded-full border border-black/[0.06] bg-white px-5 py-2.5 text-sm text-muted-foreground shadow-sm"
              >
                <span className="mr-1.5 shrink-0 font-medium text-foreground">
                  AI understood:
                </span>
                <span className="truncate">
                  {formatCriteriaSummary(criteria) || 'General property search'}
                </span>
              </motion.div>
            )}
          </div>
        </section>

        {/* Curated matches */}
        <section className="pb-16 sm:pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Curated for you
                </h2>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  Top matches based on your lifestyle profile.
                </p>
              </div>
              <Link
                href="/properties"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Browse all properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {searching && (
              <div className="mb-6 flex items-center justify-center gap-3 rounded-[1.5rem] border border-black/[0.06] bg-white py-16 text-muted-foreground shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin" />
                Ranking matches for your lifestyle…
              </div>
            )}

            {!searching && hasSearched && results.length === 0 && (
              <div className="mb-6 rounded-[1.5rem] border border-black/[0.06] bg-white px-6 py-12 text-center shadow-sm">
                <p className="mb-2 text-lg font-medium">No live matches yet</p>
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  Showing curated demo homes below. Try adjusting budget, city,
                  or BHK for live results.
                </p>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {curatedMatches.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Link
                    href={`/ai-search/matches?id=${item.id}`}
                    className="group block h-full overflow-hidden rounded-[1.35rem] border border-black/[0.06] bg-white shadow-[0_12px_40px_-24px_rgba(0,0,0,0.35)] transition-shadow hover:shadow-[0_18px_48px_-20px_rgba(0,0,0,0.4)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          {item.matchPercentage}% AI Match
                        </span>
                        {item.isExclusive && (
                          <span className="rounded-full bg-foreground/90 px-2.5 py-1 text-xs font-medium text-background">
                            Exclusive
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent p-4 pt-16">
                        <div className="rounded-xl border border-white/25 bg-white/20 px-3 py-2.5 backdrop-blur-md">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">
                            Starting at
                          </p>
                          <div className="flex items-end justify-between gap-2">
                            <p className="text-xl font-semibold text-white">
                              {item.price}
                            </p>
                            <div className="text-right text-xs text-white/90">
                              <p>{item.config}</p>
                              <p className="text-white/70">Ready to Move</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 p-5">
                      <div>
                        <h3 className="line-clamp-1 text-base font-semibold tracking-tight">
                          {item.name}
                        </h3>
                        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-1">{item.commuteLabel}</span>
                        </p>
                      </div>
                      <div
                        className={cn(
                          'rounded-xl bg-[#F3F3F1] px-3.5 py-3 text-sm leading-relaxed text-muted-foreground',
                        )}
                      >
                        “{item.aiAnalysis}”
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 sm:pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#141414] px-6 py-12 text-white sm:px-10 sm:py-14 lg:px-14">
              <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <h2 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Never miss a match again.
                  </h2>
                  <p className="mb-8 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
                    Join discerning buyers getting AI-filtered properties
                    straight to their inbox — or unlock unlimited search with a
                    Solvestay plan.
                  </p>
                  <form
                    className="flex max-w-md flex-col gap-3 sm:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!email.trim()) {
                        toast.error('Enter your email address')
                        return
                      }
                      toast.success("You're on the list. We'll be in touch.")
                      setEmail('')
                    }}
                  >
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-full border-white/10 bg-white/10 text-white placeholder:text-white/45 focus-visible:border-white/30 focus-visible:ring-white/20"
                    />
                    <Button
                      type="submit"
                      className="h-12 shrink-0 rounded-full bg-white px-6 text-foreground hover:bg-white/90"
                    >
                      Get early access
                    </Button>
                  </form>
                  <p className="mt-4 text-xs text-white/45">
                    Prefer full access now?{' '}
                    <Link
                      href="/pricing"
                      className="underline underline-offset-2 hover:text-white"
                    >
                      View plans
                    </Link>
                  </p>
                </div>

                <div className="relative mx-auto hidden h-48 w-48 items-center justify-center lg:flex">
                  <div className="absolute inset-0 rounded-full border border-white/10" />
                  <div className="absolute inset-6 rounded-full border border-white/10" />
                  <div className="absolute inset-12 rounded-full border border-white/15" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                    <Bell className="h-7 w-7 text-white/80" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
