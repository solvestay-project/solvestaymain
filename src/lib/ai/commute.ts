import type { GeoPoint } from './geocode'

const OSRM_BASE =
  process.env.OSRM_BASE_URL?.replace(/\/$/, '') ||
  'https://router.project-osrm.org'

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

/** Approximate driving minutes from straight-line distance (urban India ~25 km/h avg). */
function estimateMinutesFromDistance(km: number): number {
  return Math.round((km / 25) * 60)
}

export async function drivingMinutes(
  from: GeoPoint,
  to: GeoPoint,
): Promise<number | null> {
  if (!Number.isFinite(from.lat) || !Number.isFinite(to.lat)) return null

  try {
    const url = `${OSRM_BASE}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) })
    if (!response.ok) throw new Error('OSRM failed')

    const data = (await response.json()) as {
      routes?: Array<{ duration?: number }>
    }
    const seconds = data.routes?.[0]?.duration
    if (typeof seconds === 'number' && seconds > 0) {
      return Math.round(seconds / 60)
    }
    throw new Error('No route')
  } catch {
    const km = haversineKm(from, to)
    return estimateMinutesFromDistance(km)
  }
}
