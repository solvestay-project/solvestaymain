'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import dummyMatches from '@/data/ai-matches-dummy.json'
import {
  AI_MATCH_CRITERIA_LABEL,
  type AiMatchProperty,
} from '@/lib/ai/ai-match-types'
import {
  Sparkles,
  MapPin,
  Car,
  Layers,
  Crosshair,
  Plus,
  Minus,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const AiMatchesMap = dynamic(
  () => import('@/components/AiMatchesMap').then((m) => m.AiMatchesMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  },
)

const properties = dummyMatches as AiMatchProperty[]

export default function AiMatchesPageClient() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id') || properties[0]?.id
  const [selectedId, setSelectedId] = useState(initialId)
  const [satellite, setSatellite] = useState(false)
  const [showCommute, setShowCommute] = useState(true)
  const [zoom, setZoom] = useState(14)

  useEffect(() => {
    const fromUrl = searchParams.get('id')
    if (fromUrl && properties.some((p) => p.id === fromUrl)) {
      setSelectedId(fromUrl)
    }
  }, [searchParams])

  const selected =
    properties.find((p) => p.id === selectedId) ?? properties[0]

  const mapKey = useMemo(() => (satellite ? 'sat' : 'light'), [satellite])

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <Navbar />

      <div className="flex min-h-0 flex-1 flex-col pt-20 lg:flex-row">
        {/* Left list */}
        <aside className="flex min-h-0 w-full flex-1 flex-col border-b border-border bg-background lg:w-[42%] lg:max-w-xl lg:flex-none lg:border-b-0 lg:border-r">
          <div className="shrink-0 px-5 pb-4 pt-6 sm:px-7">
            <p className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              {AI_MATCH_CRITERIA_LABEL}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Highly Recommended
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on your commute and lifestyle preferences.
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-8 sm:px-7 lg:pb-10">
            {properties.map((property) => {
              const isSelected = property.id === selected.id
              return (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => setSelectedId(property.id)}
                  className={cn(
                    'w-full overflow-hidden rounded-[1.35rem] border bg-card text-left shadow-[0_10px_36px_-24px_rgba(8,59,58,0.28)] transition-all',
                    isSelected
                      ? 'border-primary/20 ring-1 ring-primary/10'
                      : 'border-border opacity-95 hover:opacity-100',
                  )}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={property.imageUrl}
                      alt={property.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      priority={isSelected}
                    />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
                        <Star className="h-3 w-3 fill-current" />
                        {property.matchPercentage}% Match
                      </span>
                      {property.isExclusive && (
                        <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                          Exclusive
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute inset-x-3 bottom-3 flex items-end gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-white/40 bg-white/95 p-2 shadow-sm backdrop-blur">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={property.thumbnailUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-foreground">
                              {property.subtitle}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {property.price} · {property.beds} Bed |{' '}
                              {property.baths} Bath
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {property.features.join(' · ')}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="shrink-0 rounded-full bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          asChild
                        >
                          <Link href="/pricing">Request Viewing</Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h2 className="text-xl font-semibold tracking-tight">
                        {property.name}
                      </h2>
                      <p className="shrink-0 text-xl font-semibold tracking-tight">
                        {property.price}
                      </p>
                    </div>
                    <p className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {property.commuteLabel}
                    </p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {property.config} • {property.area}
                    </p>

                    {isSelected && (
                      <div className="rounded-2xl bg-secondary px-4 py-3.5">
                        <p className="mb-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Sparkles className="h-3 w-3 text-accent" />
                          AI Analysis
                        </p>
                        <p className="text-sm leading-relaxed text-foreground/80">
                          {property.aiAnalysis}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Right map — fixed in the viewport; does not scroll with the list */}
        <section className="relative min-h-[45vh] flex-1 shrink-0 lg:min-h-0">
          <div className="absolute inset-0 z-0" key={mapKey}>
            <AiMatchesMap
              properties={properties}
              selectedId={selected.id}
              onSelect={setSelectedId}
              showSatellite={satellite}
              zoom={zoom}
            />
          </div>

          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="pointer-events-auto absolute right-4 top-4 flex flex-wrap justify-end gap-2 sm:right-6 sm:top-6">
              <button
                type="button"
                onClick={() => setShowCommute((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium shadow-md transition-colors',
                  showCommute && 'ring-1 ring-primary/20',
                )}
              >
                <Car className="h-3.5 w-3.5 text-primary" />
                Commute Time
              </button>
              <button
                type="button"
                onClick={() => setSatellite((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium shadow-md transition-colors',
                  satellite && 'ring-1 ring-primary/20',
                )}
              >
                <Layers className="h-3.5 w-3.5 text-primary" />
                Satellite
              </button>
            </div>

            <div className="pointer-events-auto absolute bottom-5 right-4 flex flex-col gap-2 sm:bottom-6 sm:right-6">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-md"
                aria-label="Locate me"
                onClick={() => {
                  if (!navigator.geolocation) return
                  navigator.geolocation.getCurrentPosition(() => {
                    setSelectedId(properties[0].id)
                  })
                }}
              >
                <Crosshair className="h-4 w-4 text-primary" />
              </button>
              <div className="overflow-hidden rounded-full border border-border bg-card shadow-md">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center border-b border-border"
                  aria-label="Zoom in"
                  onClick={() => setZoom((z) => Math.min(18, z + 1))}
                >
                  <Plus className="h-4 w-4 text-primary" />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center"
                  aria-label="Zoom out"
                  onClick={() => setZoom((z) => Math.max(11, z - 1))}
                >
                  <Minus className="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="hidden shrink-0 border-t border-border bg-background px-6 py-3 text-xs text-muted-foreground lg:flex lg:items-center lg:justify-between">
        <p>© {new Date().getFullYear()} Solvestay. AI property discovery.</p>
        <div className="flex gap-5">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/ai-search" className="hover:text-foreground">
            AI Search
          </Link>
        </div>
      </footer>
    </div>
  )
}
