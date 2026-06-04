"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
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

const DEFAULT_POSITION: [number, number] = [-6.2, 106.816666]; // Jakarta

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: [number, number] | null;
}

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

export default function locationPickerMap({
  onLocationSelect,
  initialLocation,
}: LocationPickerMapProps) {
  return (
    <MapContainer
      center={initialLocation || DEFAULT_POSITION}
      zoom={13}
      style={{ height: "400px", width: "100%", borderRadius: "8px", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {initialLocation && <Marker position={initialLocation} icon={markerIcon} />}
      <MapClickHandler onLocationSelect={onLocationSelect} />
      {initialLocation && <MapUpdater center={initialLocation} />}
    </MapContainer>
  );
}
