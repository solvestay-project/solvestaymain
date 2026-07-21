import { Suspense } from 'react'
import AiMatchesPageClient from './AiMatchesPageClient'

export const metadata = {
  title: 'AI Matches | Solvestay',
  description:
    'Explore highly recommended properties on a map, ranked by your lifestyle and commute.',
}

export default function AiMatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          Loading matches…
        </div>
      }
    >
      <AiMatchesPageClient />
    </Suspense>
  )
}
