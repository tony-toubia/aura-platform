// apps/web/components/wildlife-map.tsx
"use client"

import "leaflet/dist/leaflet.css"
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet"
import type { LatLngExpression } from "leaflet"

export interface WildlifeMapProps {
  points: { lat: number; lon: number; timestamp?: string }[]
}

export default function WildlifeMap({ points }: WildlifeMapProps) {
  // safe‐guard first point
  const first = points[0]
  const center: LatLngExpression = first
    ? [first.lat, first.lon]
    : [0, 0]

  const latlngs = points.map((p) => [p.lat, p.lon] as [number, number])

  return (
    <MapContainer
      center={center}
      zoom={points.length > 0 ? 8 : 2}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {latlngs.length > 1 && <Polyline positions={latlngs} color="purple" />}

      {latlngs.map((pos, i) => {
        const ts = points[i]?.timestamp
        return (
          <Marker key={i} position={pos}>
            {ts && (
              <Popup>
                {new Date(ts).toLocaleString()}
              </Popup>
            )}
          </Marker>
        )
      })}
    </MapContainer>
  )
}
