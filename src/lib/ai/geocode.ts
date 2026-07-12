export interface GeoPoint {
  lat: number
  lng: number
  display_name?: string
}

export async function geocodePlace(query: string): Promise<GeoPoint | null> {
  const q = query.trim()
  if (!q) return null

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
        q,
        format: 'json',
        addressdetails: '1',
        limit: '1',
      })}`,
      {
        headers: { 'User-Agent': 'solvestay-ai-search/1.0' },
        signal: AbortSignal.timeout(8000),
      },
    )

    if (!response.ok) return null

    const data = (await response.json()) as Array<{ lat: string; lon: string; display_name?: string }>
    if (!Array.isArray(data) || data.length === 0) return null

    const first = data[0]
    return {
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      display_name: first.display_name,
    }
  } catch {
    return null
  }
}
