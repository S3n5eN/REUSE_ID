"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Teal warehouse pin — circle with house icon
const warehouseIcon = new L.DivIcon({
  className: "",
  html: `
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.06 0 0 8.06 0 18C0 30 18 44 18 44C18 44 36 30 36 18C36 8.06 27.94 0 18 0Z" fill="#14B8A6"/>
      <circle cx="18" cy="18" r="10" fill="white" fill-opacity="0.2"/>
      <path d="M18 12L12 17.5V25H15.5V20H18V12ZM21 25H24.5V17.5L18 12L21 17.5V25Z" fill="white"/>
    </svg>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -44],
});

// Yellow selected pin — circle with checkmark
const selectedIcon = new L.DivIcon({
  className: "",
  html: `
    <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C8.96 0 0 8.96 0 20C0 33.6 20 48 20 48C20 48 40 33.6 40 20C40 8.96 31.04 0 20 0Z" fill="#F59E0B"/>
      <circle cx="20" cy="20" r="12" fill="white" fill-opacity="0.25"/>
      <path d="M16 20.5L18.5 23L24 17" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -48],
});

// Blue user pin — circle with dot
const userIcon = new L.DivIcon({
  className: "",
  html: `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" fill="#3B82F6" stroke="white" stroke-width="2"/>
      <circle cx="10" cy="10" r="3" fill="white"/>
    </svg>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

export interface Place {
  id: number;
  name: string;
  address?: string;
  latitude: number | null;
  longitude: number | null;
}

export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface WarehouseMapProps {
  places: Place[];
  userLocation?: UserLocation;
  selectedPlace?: Place | null;
  onSelectPlace: (place: Place) => void;
  onRouteUpdate?: (distance: number | null) => void;
}

// Fits map to show all points + route
function FitRouteBounds({
  coordinates,
}: {
  coordinates: [number, number][];
}) {
  const map = useMap();
  const initial = useRef(true);

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      initial.current = false;
    }
  }, [coordinates, map]);

  return null;
}

export default function WarehouseMap({
  places,
  userLocation,
  selectedPlace,
  onSelectPlace,
  onRouteUpdate,
}: WarehouseMapProps) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const prevSelectedId = useRef<number | null>(null);

  // Fetch route when a warehouse is selected AND user location exists
  useEffect(() => {
    // Only refetch if the selected warehouse changed
    if (
      !selectedPlace ||
      !userLocation ||
      selectedPlace.id === prevSelectedId.current
    ) {
      return;
    }

    if (
      !selectedPlace.latitude ||
      !selectedPlace.longitude ||
      !userLocation.lat ||
      !userLocation.lng
    ) {
      return;
    }

    prevSelectedId.current = selectedPlace.id;
    setRouteCoords([]);
    setRouteDistance(null);
    onRouteUpdate?.(null);

    const fetchRoute = async () => {
      try {
        // OSRM: lng,lat format
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${userLocation.lng},${userLocation.lat};` +
          `${selectedPlace.longitude},${selectedPlace.latitude}` +
          `?overview=full&geometries=geojson`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number]
          );
          const distanceKm = data.routes[0].distance / 1000; // meters → km

          setRouteCoords(coords);
          setRouteDistance(distanceKm);
          onRouteUpdate?.(distanceKm);
        }
      } catch (err) {
        console.error("Gagal mengambil rute:", err);
        onRouteUpdate?.(null);
      }
    };

    fetchRoute();
  }, [selectedPlace, userLocation, onRouteUpdate]);

  // Clear route when selection is removed
  useEffect(() => {
    if (!selectedPlace) {
      setRouteCoords([]);
      setRouteDistance(null);
      onRouteUpdate?.(null);
      prevSelectedId.current = null;
    }
  }, [selectedPlace, onRouteUpdate]);

  const DEFAULT_CENTER: [number, number] = [-6.2, 106.816666];

  let center: [number, number] = DEFAULT_CENTER;
  let zoom = 11;

  if (userLocation) {
    center = [userLocation.lat, userLocation.lng];
    zoom = 12;
  } else {
    const first = places.find((p) => p.latitude && p.longitude);
    if (first?.latitude && first?.longitude) {
      center = [first.latitude, first.longitude];
      zoom = 12;
    }
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* User location pin */}
      {userLocation && (
        <>
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-sm font-semibold text-blue-700">Lokasimu</div>
              {userLocation.address && (
                <div className="text-xs text-gray-500 mt-1">
                  {userLocation.address}
                </div>
              )}
            </Popup>
          </Marker>
        </>
      )}

      {/* Warehouse pins */}
      {places
        .filter((p) => p.latitude && p.longitude)
        .map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          return (
            <Marker
              key={place.id}
              position={[place.latitude!, place.longitude!]}
              icon={isSelected ? selectedIcon : warehouseIcon}
              eventHandlers={{ click: () => onSelectPlace(place) }}
            >
              <Popup>
                <div className="text-sm font-bold text-gray-800">{place.name}</div>
                {place.address && (
                  <div className="text-xs text-gray-500 mt-1">{place.address}</div>
                )}
                {isSelected && routeDistance !== null && (
                  <div className="text-xs text-amber-600 font-semibold mt-1">
                    {routeDistance.toFixed(1)} km dari lokasimu
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlace(place);
                  }}
                  className={`
                    mt-2 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors duration-150 cursor-pointer
                    ${isSelected
                      ? "bg-amber-100 text-amber-700"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                    }
                  `}
                >
                  {isSelected ? "Terpilih" : "Pilih Gudang Ini"}
                </button>
              </Popup>
            </Marker>
          );
        })}

      {/* Route polyline — user → selected warehouse */}
      {routeCoords.length > 0 && (
        <>
          <Polyline
            positions={routeCoords}
            color="#14B8A6"
            weight={4}
            opacity={0.8}
          />
          <FitRouteBounds coordinates={routeCoords} />
        </>
      )}
    </MapContainer>
  );
}