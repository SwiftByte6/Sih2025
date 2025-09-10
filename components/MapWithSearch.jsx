'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'

function FlyTo({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center && Array.isArray(center) && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      map.flyTo(center, zoom ?? 14, { duration: 0.8 })
    }
  }, [center, zoom, map])
  return null
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { 'accept-language': 'en' } })
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export default function MapWithSearch({ markers = [] }) {
  const [search, setSearch] = useState('')
  const [center, setCenter] = useState([20.5937, 78.9629])
  const [zoom, setZoom] = useState(5)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const validMarkers = useMemo(() => (markers || [])
    .filter(m => Array.isArray(m.position)
      && m.position.length === 2
      && Number.isFinite(m.position[0])
      && Number.isFinite(m.position[1])
    ), [markers])

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

  return (
    <div className="w-full h-full flex flex-col">
      <form onSubmit={handleSearch} className="p-2 border-b border-gray-200 flex gap-2 items-center">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search place or address..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-400"
        />
        <button disabled={searching} className="px-3 py-2 rounded-lg bg-sky-600 text-white">
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <div className="px-3 py-1 text-sm text-red-600">{error}</div>}
      <div className="flex-1">
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyTo center={center} zoom={zoom} />
          {validMarkers.map(m => (
            <Marker key={m.id} position={m.position}>
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-sm text-gray-700">{m.description}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}


