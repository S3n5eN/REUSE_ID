"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 41" width="25" height="41">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 29 12 29s12-20 12-29c0-6.627-5.373-12-12-12z" fill="#2563eb"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`,
  className: "",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapViewProps {
  lat: number;
  lng: number;
}

export default function MapView({ lat, lng }: MapViewProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height: "200px", width: "100%", borderRadius: "8px" }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={[lat, lng]} icon={markerIcon} />
    </MapContainer>
  );
}