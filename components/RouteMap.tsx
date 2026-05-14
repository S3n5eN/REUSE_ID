"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface RouteMapProps {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}

// Ini biar dia fokus ke rute 
function FitBounds({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [40, 40] }); // ==== padding 40px supaya tidak mepet ====
    }
  }, [coordinates, map]);

  return null;
}

export default function RouteMap({ originLat, originLng, destLat, destLng }: RouteMapProps) {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          setRouteCoordinates(coords);
        }
      } catch (error) {
        console.error("Gagal mengambil rute map:", error);
      }
    };

    if (originLat && originLng && destLat && destLng) {
      fetchRoute();
    }
  }, [originLat, originLng, destLat, destLng]);

  if (!originLat || !originLng || !destLat || !destLng) {
    return (
      <div className="h-full w-full bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-400 text-sm">Menunggu koordinat lokasi...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[originLat, originLng]}
      zoom={13}
      style={{ height: "100%", width: "100%", zIndex: 0, borderRadius: "0.5rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={[originLat, originLng]} />
      <Marker position={[destLat, destLng]} />
      {routeCoordinates.length > 0 && (
        <>
          <Polyline positions={routeCoordinates} color="#007582" weight={5} opacity={0.8} />
          <FitBounds coordinates={routeCoordinates} />
        </>
      )}
    </MapContainer>
  );
}