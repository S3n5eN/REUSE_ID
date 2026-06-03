"use client";

import { useEffect, useState, useMemo } from "react";
import { GoSortDesc, GoSortAsc } from "react-icons/go";
import Link from "next/link";
import {
  MapPin,
  Search,
  Navigation,
  Phone,
  User,
  Clock,
  ArrowLeft,
  ChevronDown,
  Compass,
} from "lucide-react";
import { hitungJarak } from "@/lib/distance";

interface Place {
  id: number;
  name: string;
  address: string;
  managerName: string;
  managerPhone: string;
  operationalJam: string;
  latitude: number | null;
  longitude: number | null;
}

export default function GudangPenyaluranPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"terdekat" | "terjauh">("terdekat");

  // Coordinates state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [profileCoords, setProfileCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [coordsSource, setCoordsSource] = useState<"profile" | "gps" | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [profileAddress, setProfileAddress] = useState<string | null>(null);

  // Loading states
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch places & profile coordinates on mount
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch("/api/LokasiPengumpulan/getPlace");
        if (!res.ok) throw new Error("Gagal mengambil data gudang");
        const data = await res.json();
        setPlaces(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Gagal memuat daftar gudang penyaluran.");
      } finally {
        setLoadingPlaces(false);
      }
    };

    const fetchUserProfileAlamat = async () => {
      try {
        const res = await fetch("/api/Pengguna/getAlamatByUserId");
        if (res.ok) {
          const data = await res.json();
          if (data.lat !== null && data.lng !== null) {
            const coords = { lat: Number(data.lat), lng: Number(data.lng) };
            setUserCoords(coords);
            setProfileCoords(coords);
            setCoordsSource("profile");
            setProfileAddress(data.address || null);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil alamat profil:", err);
      }
    };

    fetchPlaces();
    fetchUserProfileAlamat();
  }, []);

  // 2. Toggle GPS live location
  const handleToggleGPS = () => {
    if (coordsSource === "gps") {
      // Turn OFF GPS, fallback to profile coords
      if (profileCoords) {
        setUserCoords(profileCoords);
      }
      setCoordsSource("profile");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolokasi tidak didukung oleh browser Anda.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setCoordsSource("gps");
        setGpsLoading(false);
      },
      (error) => {
        console.error("Error getting geolocation:", error);
        alert(
          "Gagal mengambil lokasi GPS Live. Pastikan Anda mengaktifkan izin akses lokasi di browser."
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 3. Process, Filter, and Sort Places
  const processedPlaces = useMemo(() => {
    let items = places.map((place) => {
      let distance: number | null = null;
      if (userCoords && place.latitude !== null && place.longitude !== null) {
        distance = hitungJarak(
          userCoords.lat,
          userCoords.lng,
          Number(place.latitude),
          Number(place.longitude)
        );
      }
      return { ...place, distance };
    });

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      );
    }

    // Sort by distance (default to terdekat)
    if (sortBy === "terdekat") {
      items.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    } else if (sortBy === "terjauh") {
      items.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return b.distance - a.distance;
      });
    }

    return items;
  }, [places, searchQuery, sortBy, userCoords]);

  return (
    <main className="min-h-screen bg-[#F4F6F5] font-sans pb-12">
      {/* Top Banner / Navbar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-teal-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">
                Gudang Penyaluran
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Lokasi tempat pengumpulan dan penyaluran donasi barang bekas
              </p>
            </div>
          </div>

          {/* GPS Live Button */}
          <button
            onClick={handleToggleGPS}
            disabled={gpsLoading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${coordsSource === "gps"
              ? "bg-teal-600 text-white hover:bg-teal-700"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
              }`}
          >
            <Compass className={`w-4 h-4 ${gpsLoading ? "animate-spin" : ""}`} />
            {gpsLoading
              ? "Mencari Lokasi..."
              : coordsSource === "gps"
                ? "GPS Live: Aktif"
                : "GPS Live: Non-aktif"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Active Coordinate Banner */}
        {userCoords && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5 text-teal-800">
              <MapPin className="w-5 h-5 text-[#007582] shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-bold">Lokasi Anda Aktif:</span>{" "}
                {coordsSource === "gps" ? (
                  <span>Diperoleh via GPS Live browser</span>
                ) : (
                  <span>
                    Diperoleh via profil ({profileAddress || "Alamat Terdaftar"})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search & Sort Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama gudang atau kota/alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#007582] focus:ring-2 focus:ring-[#007582]/10 transition"
            />
          </div>

          {/* Sort Toggle Button */}
          <button
            onClick={() => setSortBy(sortBy === "terdekat" ? "terjauh" : "terdekat")}
            className="flex items-center gap-2 px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 font-semibold text-sm hover:bg-teal-100 transition shrink-0 shadow-xs active:scale-95"
          >
            <span className="text-teal-700">
              {sortBy === "terdekat" ? <GoSortDesc className="w-5 h-5" /> : <GoSortAsc className="w-5 h-5" />}
            </span>
            {sortBy === "terdekat" ? "Jarak: Terdekat" : "Jarak: Terjauh"}
          </button>
        </div>

        {/* Warehouse List */}
        {loadingPlaces ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-[#007582]/20 border-t-[#007582] animate-spin" />
            <p className="text-sm text-slate-400">Memuat data gudang...</p>
          </div>
        ) : errorMsg ? (
          <div className="py-24 text-center">
            <p className="text-red-500 font-semibold mb-2">{errorMsg}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition"
            >
              Coba Lagi
            </button>
          </div>
        ) : processedPlaces.length === 0 ? (
          <div className="py-24 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold mb-1">
              Gudang Tidak Ditemukan
            </p>
            <p className="text-slate-400 text-sm">
              Cobalah mengganti kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {processedPlaces.map((place) => {
              let directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
              if (userCoords) {
                directionUrl += `&origin=${userCoords.lat},${userCoords.lng}`;
              }

              return (
                <div
                  key={place.id}
                  className="bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-50 flex items-start gap-4">
                    <div className="p-2.5 bg-[#007582]/5 text-[#007582] rounded-xl shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
                        {place.name}
                      </h3>
                      {place.distance !== null ? (
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#007582] text-xs font-bold">
                          {place.distance.toFixed(2)} km dari Anda
                        </span>
                      ) : (
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-400 text-xs font-medium">
                          Jarak tidak diketahui
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 space-y-3.5 text-sm text-slate-600">
                    {/* Alamat */}
                    <div className="flex gap-3">
                      <Navigation className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{place.address}</p>
                    </div>

                    {/* Jam Operasional */}
                    <div className="flex items-center gap-3">
                      <Clock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                      <p>Jam Operasional: {place.operationalJam}</p>
                    </div>

                    {/* Pengelola */}
                    <div className="flex items-center gap-3">
                      <User className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                      <p>Pengelola: {place.managerName}</p>
                    </div>

                    {/* Telepon */}
                    <div className="flex items-center gap-3">
                      <Phone className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                      <p>Hubungi: {place.managerPhone}</p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-5 bg-slate-50 border-t border-slate-100 mt-auto">
                    <a
                      href={directionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#007582] hover:bg-[#005f6b] text-white py-2.5 rounded-xl text-sm font-semibold transition"
                    >
                      <Navigation className="w-4 h-4" />
                      Lihat Rute Google Maps
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
