'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { AiMatchProperty } from '@/lib/ai/ai-match-types'

function FlyTo({
  center,
  zoom,
}: {
  center: [number, number]
  zoom: number
}) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.6 })
  }, [center, zoom, map])
  return null
}

function matchMarkerIcon(match: number, selected: boolean) {
  return L.divIcon({
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `<div style="
      width:40px;height:40px;border-radius:9999px;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:13px;color:#fff;
      background:${selected ? '#083b3a' : '#0a4a48'};
      border:2px solid ${selected ? '#c79a4a' : '#fff'};
      box-shadow:0 8px 20px rgba(8,59,58,0.28);
      transform:${selected ? 'scale(1.08)' : 'scale(1)'};
    ">${match}</div>`,
  })
}

function calloutIcon(property: AiMatchProperty) {
  return L.divIcon({
    className: '',
    iconSize: [220, 64],
    iconAnchor: [110, 78],
    html: `<div style="
      background:#fff;border-radius:16px;padding:10px 14px;
      box-shadow:0 12px 32px rgba(0,0,0,0.18);
      border:1px solid rgba(0,0,0,0.06);min-width:200px;
      font-family:inherit;text-align:left;position:relative;
    ">
      <div style="font-weight:700;font-size:13px;color:#083b3a;margin-bottom:2px;">${property.name}</div>
      <div style="font-size:12px;color:#64748b;">${property.price} • ${property.mapCommuteText}</div>
      <div style="
        position:absolute;left:50%;bottom:-7px;width:14px;height:14px;
        background:#fff;border-right:1px solid rgba(0,0,0,0.06);
        border-bottom:1px solid rgba(0,0,0,0.06);
        transform:translateX(-50%) rotate(45deg);
      "></div>
    </div>`,
  })
}

interface AiMatchesMapProps {
  properties: AiMatchProperty[]
  selectedId: string
  onSelect: (id: string) => void
  showSatellite?: boolean
  zoom?: number
}

export function AiMatchesMap({
  properties,
  selectedId,
  onSelect,
  showSatellite = false,
  zoom = 14,
}: AiMatchesMapProps) {
  const selected = properties.find((p) => p.id === selectedId) ?? properties[0]
  const center: [number, number] = selected
    ? [selected.lat, selected.lng]
    : [13.0451, 77.6266]

  const tileUrl = showSatellite
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const attribution = showSatellite
    ? 'Tiles &copy; Esri'
    : '&copy; OpenStreetMap &copy; CARTO'

  const callout = useMemo(
    () => (selected ? calloutIcon(selected) : null),
    [selected],
  )

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <FlyTo center={center} zoom={zoom} />
      <TileLayer attribution={attribution} url={tileUrl} />

      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat, property.lng]}
          icon={matchMarkerIcon(
            property.matchPercentage,
            property.id === selectedId,
          )}
          eventHandlers={{
            click: () => onSelect(property.id),
          }}
          zIndexOffset={property.id === selectedId ? 500 : 0}
        />
      ))}

      {selected && callout && (
        <Marker
          position={[selected.lat, selected.lng]}
          icon={callout}
          interactive={false}
          zIndexOffset={1000}
        />
      )}
    </MapContainer>
  )
}
