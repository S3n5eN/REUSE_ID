"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Place {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

interface PlaceSelectorMapProps {
  places: Place[];
  onSelectPlace: (placeId: number) => void;
}

export default function PlaceSelectorMap({
  places,
  onSelectPlace,
}: PlaceSelectorMapProps) {
  return (
    <MapContainer
      center={[-6.2, 106.816666]}
      zoom={11}
      style={{ height: "400px", width: "100%", borderRadius: "8px", zIndex: 0 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Tampilkan Marker semua place yang ada di database*/}
      {places
        .filter((place) => place.latitude && place.longitude)
        .map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude!, place.longitude!]}
            eventHandlers={{ click: () => onSelectPlace(place.id) }}
          >
            <Popup>
              <div className="font-bold">{place.name}</div>
              <button
                className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => onSelectPlace(place.id)}
              >
                Pilih Lokasi Ini
              </button>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
