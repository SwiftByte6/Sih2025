'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'

// FlyTo component for map animation
function FlyTo({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center && Array.isArray(center) && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      map.flyTo(center, zoom ?? 14, { duration: 0.8 })
    }
  }, [center, zoom, map])
  return null
}

// Geocode search function
async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { 'accept-language': 'en' } })
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

// Custom icons for verified and pending
const verifiedIcon = L.icon({
  iconUrl: '/icons/verified.png', // add in public/icons/
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const pendingIcon = L.icon({
  iconUrl: '/icons/unverified.png', // add in public/icons/
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

export default function MapWithSearch({ markers = [] }) {
  const [search, setSearch] = useState('')
  const [center, setCenter] = useState([20.5937, 78.9629])
  const [zoom, setZoom] = useState(5)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // Filter valid markers
  const validMarkers = useMemo(() =>
    (markers || []).filter(m =>
      Array.isArray(m.position) &&
      m.position.length === 2 &&
      Number.isFinite(m.position[0]) &&
      Number.isFinite(m.position[1])
    ), [markers]
  )
console.log(markers)
  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return
    setSearching(true)
    setError('')
    try {
      const results = await geocode(search.trim())
      if (results && results.length > 0) {
        const best = results[0]
        setCenter([Number(best.lat), Number(best.lon)])
        setZoom(14)
      } else {
        setError('No results found')
      }
    } catch (err) {
      setError('Search failed')
    } finally {
      setSearching(false)
    }
  }

  // Haversine distance in meters
  function getDistance(p1, p2) {
    const R = 6371e3
    const lat1 = p1[0] * Math.PI / 180
    const lat2 = p2[0] * Math.PI / 180
    const dLat = (p2[0] - p1[0]) * Math.PI / 180
    const dLon = (p2[1] - p1[1]) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const radius = 500 // meters
  const threshold = 3 // reports to form hotspot

  // Compute hotspot circles
  const hotspotCircles = useMemo(() => {
    const circles = []
    validMarkers.forEach(m => {
      const nearby = validMarkers.filter(other =>
        getDistance(m.position, other.position) <= radius
      )
      if (nearby.length >= threshold) {
        circles.push({
          id: m.id,
          center: m.position,
          count: nearby.length
        })
      }
    })
    return circles
  }, [validMarkers])

  return (
    <div className="w-full h-full flex flex-col px-4 space-y-2">
      <form onSubmit={handleSearch} className="mt-4 flex gap-2 items-center">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search place or address..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-400"
        />
        <button disabled={searching} className="px-3 py-2 rounded-lg bg-white/70 border border-gray-300 text-black">
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <div className="px-3 py-1 text-sm text-red-600">{error}</div>}
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-500">
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyTo center={center} zoom={zoom} />


          {validMarkers.map((m, idx) => {
            const status = m.status?.toLowerCase().trim()  
            const icon = status === 'verified' ? verifiedIcon : pendingIcon

            return (
              <Marker
                key={m.id || idx}
                position={m.position}
                icon={icon}
              >
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">{m.title}</div>
                    <div className="text-sm text-gray-700">{m.description}</div>
                    <div className={`text-xs ${status === 'verified' ? 'text-green-600' : 'text-red-600'}`}>
                      {status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Render hotspot circles */}
          {hotspotCircles.map(c => (
            <Circle
              key={`circle-${c.id}`}
              center={c.center}
              radius={radius}
              pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }}
            >
              <Popup>{c.count} reports in this area</Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
