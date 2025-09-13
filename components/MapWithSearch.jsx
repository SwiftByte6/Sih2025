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

// Create colored marker icons using SVG data URLs
const createColoredIcon = (color) => {
  const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C10.48 2 6 6.48 6 12c0 8 10 18 10 18s10-10 10-18c0-5.52-4.48-10-10-10z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="12" r="4" fill="#fff"/>
    </svg>
  `
  
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

const yellowIcon = createColoredIcon('#FFD700')
const greenIcon = createColoredIcon('#22C55E')
const redIcon = createColoredIcon('#EF4444')

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

  // Compute hotspot circles and marker colors
  const { hotspotCircles, markersWithColors } = useMemo(() => {
    const circles = []
    const markersWithColors = validMarkers.map(m => {
      const nearby = validMarkers.filter(other =>
        getDistance(m.position, other.position) <= radius
      )
      
      // Determine marker color based on report count and verification status
      let markerColor = 'yellow' // default for less than 3 reports
      
      if (nearby.length > 7) {
        markerColor = 'red' // more than 7 reports
      } else if (nearby.length >= 3 && m.status?.toLowerCase() === 'verified') {
        markerColor = 'green' // verified and 3+ reports
      }
      
      return {
        ...m,
        nearbyCount: nearby.length,
        markerColor
      }
    })
    
    // Create hotspot circles for areas with 3+ reports
    validMarkers.forEach(m => {
      const nearby = validMarkers.filter(other =>
        getDistance(m.position, other.position) <= radius
      )
      if (nearby.length >= threshold) {
        // Determine circle color based on report count and verification status
        let circleColor = 'yellow'
        let circleFillColor = 'yellow'
        
        if (nearby.length > 7) {
          circleColor = 'red'
          circleFillColor = 'red'
        } else if (nearby.length >= 3 && m.status?.toLowerCase() === 'verified') {
          circleColor = 'green'
          circleFillColor = 'green'
        }
        
        circles.push({
          id: m.id,
          center: m.position,
          count: nearby.length,
          color: circleColor,
          fillColor: circleFillColor
        })
      }
    })
    
    return { hotspotCircles: circles, markersWithColors }
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
      
      {/* Legend */}
      <div className="bg-white/90 rounded-lg p-3 text-xs space-y-1">
        <div className="font-semibold text-gray-700 mb-2">Report Priority Legend:</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-400 border border-white"></div>
          <span>Yellow: Less than 3 reports in area</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 border border-white"></div>
          <span>Green: Verified & 3+ reports in area</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 border border-white"></div>
          <span>Red: More than 7 reports in area</span>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-300">
          <div className="text-xs text-gray-600">
            <strong>Circles:</strong> Show hotspot regions (3+ reports) with matching priority colors
          </div>
        </div>
      </div>
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-500">
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyTo center={center} zoom={zoom} />


          {markersWithColors.map((m, idx) => {
            // Select icon based on marker color
            let icon = yellowIcon // default
            if (m.markerColor === 'green') {
              icon = greenIcon
            } else if (m.markerColor === 'red') {
              icon = redIcon
            }

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
                    <div className="text-xs text-gray-600">
                      Status: {m.status || 'pending'}
                    </div>
                    <div className="text-xs text-blue-600">
                      Reports in area: {m.nearbyCount}
                    </div>
                    <div className={`text-xs font-medium ${
                      m.markerColor === 'red' ? 'text-red-600' : 
                      m.markerColor === 'green' ? 'text-green-600' : 
                      'text-yellow-600'
                    }`}>
                      Priority: {m.markerColor.toUpperCase()}
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
              pathOptions={{ 
                color: c.color, 
                fillColor: c.fillColor, 
                fillOpacity: 0.3,
                weight: 2
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">Hotspot Area</div>
                  <div className="text-sm">{c.count} reports in this area</div>
                  <div className={`text-xs font-medium ${
                    c.color === 'red' ? 'text-red-600' : 
                    c.color === 'green' ? 'text-green-600' : 
                    'text-yellow-600'
                  }`}>
                    Priority: {c.color.toUpperCase()}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
