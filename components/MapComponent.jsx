"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

export default function MapComponent({ search }) {
  const mapRef = useRef();

  // Dummy city data
  const cities = [
    { name: "Delhi", coords: [28.6139, 77.2090] },
    { name: "Mumbai", coords: [19.0760, 72.8777] },
    { name: "Kolkata", coords: [22.5726, 88.3639] },
    { name: "Chennai", coords: [13.0827, 80.2707] },
    { name: "Bengaluru", coords: [12.9716, 77.5946] },
    { name: "Hyderabad", coords: [17.3850, 78.4867] },
  ];

  // 🔍 Zoom only when search changes
  useEffect(() => {
    if (!search || !mapRef.current) return;

    const city = cities.find((c) =>
      search.toLowerCase().includes(c.name.toLowerCase())
    );

    if (city) {
      mapRef.current.setView(city.coords, 10, { animate: true });
    }
  }, [search]);

  return (
    <MapContainer
      center={[22.9734, 78.6569]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      maxBounds={[
        [6.4627, 68.1097],
        [37.0841, 97.3956],
      ]}
      maxBoundsViscosity={1.0}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
      />

      {/* Markers */}
      {cities.map((city, idx) => (
        <Marker key={idx} position={city.coords}>
          <Popup>{city.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
