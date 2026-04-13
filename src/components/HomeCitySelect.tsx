'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

/** Famous cities shown when dropdown opens (before search). Bangalore first for home search focus. */
const FAMOUS_CITIES = [
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
]

interface PlaceResult {
  display_name: string
  city: string | null
  state: string | null
}

interface HomeCitySelectProps {
  value: string
  onChange: (city: string) => void
  placeholder?: string
  className?: string
  triggerClassName?: string
  heightClass?: string
}

export function HomeCitySelect({
  value,
  onChange,
  placeholder = 'All Cities',
  className,
  triggerClassName,
  heightClass = 'h-12 sm:h-14',
}: HomeCitySelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [apiCities, setApiCities] = React.useState<PlaceResult[]>([])
  const [loading, setLoading] = React.useState(false)

  const showFamous = !search.trim() || search.trim().length < 2
  const famousFiltered = React.useMemo(() => {
    if (!search.trim()) return FAMOUS_CITIES
    const q = search.toLowerCase()
    return FAMOUS_CITIES.filter((c) => c.toLowerCase().includes(q))
  }, [search])

  React.useEffect(() => {
    if (!open) {
      setSearch('')
      setApiCities([])
      return
    }
  }, [open])

  React.useEffect(() => {
    const q = search.trim()
    if (q.length < 2) {
      setApiCities([])
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/place?q=${encodeURIComponent(q)}&limit=8`
        )
        const data = await res.json()
        setApiCities(
          data.success && Array.isArray(data.places)
            ? data.places.map((p: any) => ({
                display_name: p.display_name,
                city: p.city || null,
                state: p.state || null,
              }))
            : []
        )
      } catch {
        setApiCities([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const selectCity = (cityName: string) => {
    onChange(cityName)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal border-0 bg-muted/50 hover:bg-muted/70 rounded-lg',
            heightClass,
            triggerClassName
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-[var(--radix-popover-trigger-width)] p-0', className)}
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search city..."
            value={search}
            onValueChange={setSearch}
            className="h-10"
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && (
              <>
                <CommandEmpty>No city found.</CommandEmpty>
                <CommandGroup heading={showFamous ? 'Popular cities' : 'Search results'}>
                  {showFamous ? (
                    <>
                      <CommandItem
                        value="__all__"
                        onSelect={() => selectCity('')}
                      >
                        <Check className={cn('mr-2 h-4 w-4', !value ? 'opacity-100' : 'opacity-0')} />
                        All Cities
                      </CommandItem>
                      {famousFiltered.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={() => selectCity(city)}
                        >
                          <Check
                            className={cn('mr-2 h-4 w-4', value === city ? 'opacity-100' : 'opacity-0')}
                          />
                          <span className="truncate">{city}</span>
                        </CommandItem>
                      ))}
                    </>
                  ) : (
                    <>
                      <CommandItem
                        value="__all__"
                        onSelect={() => selectCity('')}
                      >
                        <Check className={cn('mr-2 h-4 w-4', !value ? 'opacity-100' : 'opacity-0')} />
                        All Cities
                      </CommandItem>
                      {apiCities.map((place, idx) => {
                        const cityLabel = place.city || place.display_name
                        return (
                          <CommandItem
                            key={`${place.display_name}-${idx}`}
                            value={place.display_name}
                            onSelect={() => selectCity(cityLabel)}
                          >
                            <Check
                              className={cn('mr-2 h-4 w-4', value === cityLabel ? 'opacity-100' : 'opacity-0')}
                            />
                            <span className="truncate">{place.display_name}</span>
                            {place.state && (
                              <span className="ml-2 text-xs text-muted-foreground truncate">
                                {place.state}
                              </span>
                            )}
                          </CommandItem>
                        )
                      })}
                    </>
                  )}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
