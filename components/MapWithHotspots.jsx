'use client'
import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useI18n } from '@/contexts/I18nContext'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false })

// Custom hook for map functionality
function useMapHotspots(reports) {
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]) // Mumbai coordinates
  const [zoom, setZoom] = useState(10)

  // Generate hotspots based on report density
  const hotspots = useMemo(() => {
    if (!reports || reports.length === 0) return []

    // Filter out reports with invalid coordinates
    const validReports = reports.filter(report => 
      report && 
      typeof report.latitude === 'number' && 
      typeof report.longitude === 'number' &&
      !isNaN(report.latitude) && 
      !isNaN(report.longitude) &&
      report.latitude >= -90 && report.latitude <= 90 &&
      report.longitude >= -180 && report.longitude <= 180
    )

    if (validReports.length === 0) return []

    const clusterRadius = 0.01 // ~1km radius
    const clusters = []
    const processed = new Set()

    validReports.forEach((report, index) => {
      if (processed.has(index)) return

      const cluster = {
        id: `cluster-${index}`,
        center: [report.latitude, report.longitude],
        reports: [report],
        intensity: 1,
        type: report.type || 'other'
      }

      // Find nearby reports to cluster
      validReports.forEach((otherReport, otherIndex) => {
        if (otherIndex === index || processed.has(otherIndex)) return

        const distance = Math.sqrt(
          Math.pow(report.latitude - otherReport.latitude, 2) +
          Math.pow(report.longitude - otherReport.longitude, 2)
        )

        if (distance < clusterRadius) {
          cluster.reports.push(otherReport)
          cluster.intensity++
          processed.add(otherIndex)
        }
      })

      processed.add(index)
      clusters.push(cluster)
    })

    return clusters
  }, [reports])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude])
          setZoom(12)
        },
        (error) => {
          console.warn('Location access denied:', error.message)
        }
      )
    }
  }, [])

  return { mapCenter, zoom, hotspots }
}

// Hotspot component
function HotspotMarker({ hotspot }) {
  // Validate hotspot data
  if (!hotspot || !hotspot.center || !Array.isArray(hotspot.center) || hotspot.center.length !== 2) {
    console.warn('Invalid hotspot data:', hotspot)
    return null
  }

  const [lat, lng] = hotspot.center
  
  // Validate coordinates
  if (typeof lat !== 'number' || typeof lng !== 'number' || 
      isNaN(lat) || isNaN(lng) ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.warn('Invalid hotspot coordinates:', hotspot.center)
    return null
  }

  const getHotspotColor = (intensity, type) => {
    if (intensity >= 5) return '#dc2626' // Red for high intensity
    if (intensity >= 3) return '#ea580c' // Orange for medium intensity
    if (intensity >= 2) return '#d97706' // Amber for low intensity
    return '#059669' // Green for single reports
  }

  const getHotspotRadius = (intensity) => {
    return Math.max(100, intensity * 50) // Minimum 100m, scale with intensity
  }

  return (
    <Circle
      center={hotspot.center}
      radius={getHotspotRadius(hotspot.intensity)}
      pathOptions={{
        color: getHotspotColor(hotspot.intensity, hotspot.type),
        fillColor: getHotspotColor(hotspot.intensity, hotspot.type),
        fillOpacity: 0.3,
        weight: 2
      }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">Hotspot Alert</h3>
          <p className="text-sm mb-1">
            <strong>Reports:</strong> {hotspot.intensity}
          </p>
          <p className="text-sm mb-1">
            <strong>Type:</strong> {hotspot.type}
          </p>
          <p className="text-xs text-gray-600">
            {hotspot.reports.length > 1 
              ? `${hotspot.reports.length} reports in this area`
              : 'Single report'
            }
          </p>
        </div>
      </Popup>
    </Circle>
  )
}

// Individual report marker
function ReportMarker({ report }) {
  // Validate report data
  if (!report || 
      typeof report.latitude !== 'number' || 
      typeof report.longitude !== 'number' ||
      isNaN(report.latitude) || 
      isNaN(report.longitude) ||
      report.latitude < -90 || report.latitude > 90 ||
      report.longitude < -180 || report.longitude > 180) {
    console.warn('Invalid report coordinates:', report)
    return null
  }

  const getMarkerColor = (status, type) => {
    if (status === 'verified') return '#059669' // Green
    if (status === 'pending') return '#d97706' // Amber
    return '#6b7280' // Gray
  }

  return (
    <CircleMarker
      center={[report.latitude, report.longitude]}
      radius={8}
      pathOptions={{
        color: getMarkerColor(report.status, report.type),
        fillColor: getMarkerColor(report.status, report.type),
        fillOpacity: 0.7,
        weight: 2
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-bold text-lg mb-2">{report.title || 'Untitled Report'}</h3>
          <p className="text-sm mb-1">
            <strong>Type:</strong> {report.type || 'Unknown'}
          </p>
          <p className="text-sm mb-1">
            <strong>Status:</strong> 
            <span className={`ml-1 px-2 py-1 rounded text-xs ${
              report.status === 'verified' ? 'bg-green-100 text-green-800' :
              report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {report.status || 'Unknown'}
            </span>
          </p>
          {report.description && (
            <p className="text-sm mt-2 text-gray-600">
              {report.description.length > 100 
                ? `${report.description.substring(0, 100)}...`
                : report.description
              }
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {new Date(report.created_at).toLocaleString()}
          </p>
        </div>
      </Popup>
    </CircleMarker>
  )
}

// Main map component
export default function MapWithHotspots({ reports = [], showHotspots = true, showIndividualReports = true }) {
  const { t } = useI18n()
  
  // Filter out invalid reports before processing
  const validReports = useMemo(() => {
    if (!reports || !Array.isArray(reports)) return []
    
    return reports.filter(report => 
      report && 
      typeof report.latitude === 'number' && 
      typeof report.longitude === 'number' &&
      !isNaN(report.latitude) && 
      !isNaN(report.longitude) &&
      report.latitude >= -90 && report.latitude <= 90 &&
      report.longitude >= -180 && report.longitude <= 180
    )
  }, [reports])
  
  const { mapCenter, zoom, hotspots } = useMapHotspots(validReports)

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render hotspots */}
        {showHotspots && hotspots.map((hotspot) => (
          <HotspotMarker key={hotspot.id} hotspot={hotspot} />
        ))}
        
        {/* Render individual reports */}
        {showIndividualReports && validReports.map((report) => (
          <ReportMarker key={report.id} report={report} />
        ))}
      </MapContainer>
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <div className="text-xs font-semibold text-gray-700">Map View</div>
        <div className="text-xs text-gray-600">
          {showHotspots && `Hotspots: ${hotspots.length}`}
        </div>
        <div className="text-xs text-gray-600">
          {showIndividualReports && `Reports: ${validReports.length}`}
        </div>
      </div>
    </div>
  )
}
