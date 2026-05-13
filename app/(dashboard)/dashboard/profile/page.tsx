"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  namaLengkap: string;
  email: string;
  usia: number | "";
  gender: string;
  pekerjaan: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

// ── Icons ────────────────────────────────────────────────────────────────────
const ChevronLeftIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="13"
    height="13"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ShieldIcon = () => (
  <svg
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ClockIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 15" />
  </svg>
);
const LockIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
  </svg>
);
const UserIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const StarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const MapPinIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const GiftIcon = () => (
  <svg
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const DocIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    viewBox="0 0 24 24"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="9" y1="7" x2="15" y2="7" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="9" y1="15" x2="12" y2="15" />
  </svg>
);

// ── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --teal:       #0d7a6e;
    --teal-dark:  #095f55;
    --teal-light: #e6f4f2;
    --amber:      #f59e0b;
    --amber-dark: #d97706;
    --amber-light:#fef3c7;
    --text:       #1a2e2c;
    --muted:      #6b7280;
    --border:     #d1d5db;
    --bg:         #f3f4f6;
    --white:      #ffffff;
    --shadow:     0 1px 3px rgba(0,0,0,.07), 0 4px 12px rgba(0,0,0,.05);
    --radius:     12px;
  }

  html, body, #root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    height: 100%;
    margin: 0; padding: 0;
  }

  .rui-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .rui-back-bar {
    flex-shrink: 0;
    padding: 10px 20px;
    background: var(--white);
    border-bottom: 1px solid var(--border);
  }
  .rui-back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    color: var(--teal); font-weight: 600; font-size: .85rem;
    font-family: inherit; padding: 4px 0; transition: opacity .2s;
  }
  .rui-back-btn:hover { opacity: .7; }

  .rui-main {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 240px 1fr;
    overflow: hidden;
  }

  /* SIDEBAR */
  .rui-sidebar {
    background: var(--white);
    border-right: 1px solid var(--border);
    overflow-y: auto;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Profile card */
  .rui-profile-card { text-align: center; }
  .rui-avatar-wrap { position: relative; width: 72px; height: 72px; margin: 0 auto 8px; }
  .rui-avatar-wrap img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--teal-light); }
  .rui-avatar-badge {
    position: absolute; bottom: 1px; right: 1px;
    background: var(--teal); border-radius: 50%;
    width: 18px; height: 18px;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--white); color: white;
  }
  .rui-profile-name { font-size: .98rem; font-weight: 800; margin-bottom: 2px; }
  .rui-profile-since { font-size: .72rem; color: var(--muted); margin-bottom: 8px; }
  .rui-badge-verified {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--teal-light); color: var(--teal-dark);
    border: 1.5px solid #9ececa; border-radius: 99px;
    padding: 3px 9px; font-size: .67rem; font-weight: 700; letter-spacing: .3px;
  }
  .rui-badge-pending {
    display: inline-flex; align-items: center; gap: 5px;
    background: #fefce8; color: #92400e;
    border: 1.5px solid #fde68a; border-radius: 99px;
    padding: 3px 9px; font-size: .67rem; font-weight: 700;
  }

  /* Poin card */
  .rui-poin-card {
    background: linear-gradient(135deg, #0d7a6e 0%, #064e44 100%);
    border-radius: var(--radius);
    padding: 14px;
    color: white;
    position: relative;
    overflow: hidden;
  }
  .rui-poin-card::before {
    content: '';
    position: absolute; top: -20px; right: -20px;
    width: 80px; height: 80px;
    background: rgba(255,255,255,.07); border-radius: 50%;
  }
  .rui-poin-card::after {
    content: '';
    position: absolute; bottom: -25px; right: 10px;
    width: 90px; height: 90px;
    background: rgba(255,255,255,.04); border-radius: 50%;
  }
  .rui-poin-label { font-size: .65rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; opacity: .7; margin-bottom: 3px; }
  .rui-poin-value { font-size: 1.7rem; font-weight: 800; line-height: 1; margin-bottom: 1px; }
  .rui-poin-sub { font-size: .7rem; opacity: .65; }
  .rui-poin-badges { display: flex; gap: 5px; margin-top: 9px; flex-wrap: wrap; }
  .rui-poin-badge {
    background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);
    border-radius: 99px; padding: 2px 7px;
    font-size: .62rem; font-weight: 600;
    display: flex; align-items: center; gap: 4px;
  }
  .rui-poin-progress-wrap { margin-top: 9px; }
  .rui-poin-progress-label { display: flex; justify-content: space-between; font-size: .63rem; opacity: .7; margin-bottom: 4px; }
  .rui-poin-progress-bar { height: 5px; background: rgba(255,255,255,.18); border-radius: 99px; overflow: hidden; }
  .rui-poin-progress-fill { height: 100%; width: 65%; background: rgba(255,255,255,.75); border-radius: 99px; }

  /* Stat */
  .rui-stat-card {
    background: var(--bg); border-radius: 10px; padding: 9px 12px;
    display: flex; align-items: center; gap: 10px; border: 1px solid var(--border);
  }
  .rui-stat-icon {
    width: 32px; height: 32px; border-radius: 8px; background: var(--teal-light);
    display: flex; align-items: center; justify-content: center; color: var(--teal); flex-shrink: 0;
  }
  .rui-stat-val { font-size: 1.05rem; font-weight: 800; }
  .rui-stat-lbl { font-size: .65rem; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }

  /* Menu */
  .rui-menu-title { font-size: .65rem; font-weight: 700; color: var(--muted); letter-spacing: .8px; text-transform: uppercase; padding: 0 4px; margin-bottom: 4px; }
  .rui-menu-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 9px;
    font-size: .82rem; font-weight: 500; color: var(--text);
    cursor: pointer; transition: background .15s, color .15s;
    width: 100%; background: none; border: none; font-family: inherit;
  }
  .rui-menu-item:hover { background: var(--teal-light); color: var(--teal); }
  .rui-menu-item.active { background: var(--teal); color: white; font-weight: 700; }
  .rui-menu-item svg { color: var(--muted); flex-shrink: 0; }
  .rui-menu-item.active svg, .rui-menu-item:hover svg { color: inherit; }

  /* CONTENT */
  .rui-content {
    overflow-y: auto;
    padding: 16px 20px;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* FORM CARD */
  .rui-form-card {
    background: var(--white); border-radius: var(--radius);
    box-shadow: var(--shadow); padding: 20px 24px;
  }
  .rui-form-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .rui-form-header-text h2 { font-size: 1.05rem; font-weight: 800; color: var(--teal); margin-bottom: 2px; }
  .rui-form-header-text p { font-size: .76rem; color: var(--muted); }
  .rui-form-header-icon { color: var(--muted); }

  .rui-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
  .rui-field { display: flex; flex-direction: column; gap: 5px; }
  .rui-field.full { grid-column: 1 / -1; }
  .rui-field label { font-size: .76rem; font-weight: 600; color: var(--text); }

  .rui-input, .rui-select, .rui-textarea {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: .83rem; color: var(--text);
    background: var(--bg); border: 1.5px solid var(--border);
    border-radius: 8px; padding: 8px 11px; outline: none;
    transition: border-color .2s, box-shadow .2s; width: 100%;
  }
  .rui-input:focus, .rui-select:focus, .rui-textarea:focus {
    border-color: var(--teal); box-shadow: 0 0 0 3px rgba(13,122,110,.08); background: var(--white);
  }
  .rui-textarea { resize: none; height: 60px; line-height: 1.5; }
  .rui-phone-row { display: flex; gap: 6px; }
  .rui-phone-prefix {
    background: var(--bg); border: 1.5px solid var(--border); border-radius: 8px;
    padding: 8px 11px; font-size: .83rem; font-weight: 600; color: var(--text);
    white-space: nowrap; display: flex; align-items: center; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .rui-phone-input { flex: 1; }
  .rui-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border); }
  .rui-btn-cancel {
    background: var(--white); color: var(--text); border: 1.5px solid var(--border);
    border-radius: 8px; padding: 7px 18px; font-size: .83rem; font-weight: 600;
    cursor: pointer; transition: border-color .2s, color .2s; font-family: inherit;
  }
  .rui-btn-cancel:hover { border-color: var(--teal); color: var(--teal); }
  .rui-btn-save {
    background: var(--amber); color: white; border: none;
    border-radius: 8px; padding: 7px 20px; font-size: .83rem; font-weight: 700;
    cursor: pointer; transition: background .2s, transform .1s; font-family: inherit;
  }
  .rui-btn-save:hover { background: var(--amber-dark); transform: translateY(-1px); }
  .rui-btn-save:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  /* MAP CARD */
  .rui-map-card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px 20px; }
  .rui-map-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .rui-map-header-icon {
    width: 32px; height: 32px; border-radius: 8px; background: var(--teal-light);
    display: flex; align-items: center; justify-content: center; color: var(--teal); flex-shrink: 0;
  }
  .rui-map-header h3 { font-size: .92rem; font-weight: 800; color: var(--teal); margin-bottom: 1px; }
  .rui-map-header p { font-size: .73rem; color: var(--muted); }
  .rui-map-coords { margin-top: 8px; display: flex; gap: 8px; }
  .rui-coord-pill {
    background: var(--bg); border: 1px solid var(--border); border-radius: 99px;
    padding: 3px 9px; font-size: .7rem; font-weight: 600; color: var(--muted);
    display: flex; align-items: center; gap: 4px;
  }
  .rui-coord-pill span { color: var(--text); }

  /* POIN DETAIL */
  .rui-poin-detail-card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px 20px; }
  .rui-poin-detail-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .rui-poin-detail-icon {
    width: 34px; height: 34px; border-radius: 8px; background: var(--amber-light);
    display: flex; align-items: center; justify-content: center; color: var(--amber-dark);
  }
  .rui-poin-detail-header h3 { font-size: .92rem; font-weight: 800; }
  .rui-poin-detail-header p { font-size: .73rem; color: var(--muted); }

  .rui-poin-history { display: flex; flex-direction: column; gap: 7px; }
  .rui-poin-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 11px; background: var(--bg); border-radius: 9px; border: 1px solid var(--border);
  }
  .rui-poin-item-left { display: flex; align-items: center; gap: 9px; }
  .rui-poin-item-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .rui-poin-item-desc { font-size: .78rem; font-weight: 600; }
  .rui-poin-item-date { font-size: .68rem; color: var(--muted); }
  .rui-poin-item-val { font-size: .82rem; font-weight: 800; }
  .pos { color: var(--teal); }
  .neg { color: #ef4444; }

  .rui-reward-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
  .rui-reward-item {
    background: var(--bg); border: 1.5px solid var(--border);
    border-radius: 10px; padding: 10px; text-align: center;
    cursor: pointer; transition: border-color .2s, background .2s;
  }
  .rui-reward-item:hover { border-color: var(--amber); background: var(--amber-light); }
  .rui-reward-emoji { font-size: 1.35rem; margin-bottom: 3px; }
  .rui-reward-name { font-size: .68rem; font-weight: 700; margin-bottom: 2px; }
  .rui-reward-poin { font-size: .63rem; color: var(--amber-dark); font-weight: 700; }

  @media (max-width: 860px) {
    .rui-container { height: auto; overflow: auto; }
    .rui-main { grid-template-columns: 1fr; overflow: visible; }
    .rui-content { overflow: visible; }
    .rui-form-grid { grid-template-columns: 1fr; }
    .rui-reward-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ── Leaflet Map ───────────────────────────────────────────────────────────────
function LeafletMap({
  lat,
  lng,
  onLocationSelect,
}: {
  latitude: number;
  longitude: number;
  onLocationSelect: (latitude: number, longitude: number) => void;
}) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initMap = () => {
      const L = (window as any).L;
      if (!containerRef.current || mapRef.current) return;

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const map = L.map(containerRef.current).setView([lat, lng], 14);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:#0d7a6e;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35);"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: "",
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        onLocationSelect(pos.lat, pos.lng);
      });
      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });
    };

    if ((window as any).L) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], 14);
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      style={{ height: 190, borderRadius: 9, border: "1.5px solid #d1d5db" }}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<
    "profil" | "riwayat" | "keamanan"
  >("profil");
  const [profileImage, setProfileImage] = useState(
    "/api/Pengguna/photoProfile",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [penggunaName, setPenggunaName] = useState("Glen");
  const [isVerified, setIsVerified] = useState(true);
  const [jumlahDonasi, setJumlahDonasi] = useState(12);
  const [myPoin, setMyPoin] = useState(1850);

  const [form, setForm] = useState<FormData>({
    namaLengkap: "",
    email: "",
    usia: "",
    gender: "Laki-laki",
    pekerjaan: "",
    phone: "",
    address: "",
    latitude: -6.9175,
    longitude: 107.6191,
  });
  const [originalForm, setOriginalForm] = useState<FormData>(form);

  const poinHistory = [
    {
      desc: "Donasi Baju Bekas",
      date: "10 Mei 2026",
      val: +150,
      dot: "#0d7a6e",
    },
    {
      desc: "Donasi Elektronik",
      date: "2 Mei 2026",
      val: +200,
      dot: "#0d7a6e",
    },
    {
      desc: "Tukar Reward Voucher",
      date: "28 Apr 2026",
      val: -300,
      dot: "#ef4444",
    },
    { desc: "Donasi Furnitur", date: "20 Apr 2026", val: +250, dot: "#0d7a6e" },
  ];
  const rewards = [
    { emoji: "🎁", name: "Voucher 10K", poin: 500 },
    { emoji: "☕", name: "Kopi Gratis", poin: 300 },
    { emoji: "🛍️", name: "Diskon 20%", poin: 400 },
    { emoji: "🌱", name: "Tanam Pohon", poin: 200 },
    { emoji: "🎓", name: "Donasi Beasiswa", poin: 1000 },
    { emoji: "📦", name: "Pick-Up Gratis", poin: 150 },
  ];

  // ── API 1: GET data pengguna ────────────────────────────────────────────────
  const getPenggunaName = async () => {
    try {
      const res = await fetch("/api/Pengguna");

      if (!res.ok) {
        console.warn("Failed to fetch pengguna data:", res.status);
        return;
      }

      const data = await res.json();
      setPenggunaName(data.namalengkap || data.profile?.nama || "—");
      setIsVerified(data.isVerified ?? false);
      if (data.hasProfileImage) {
        setProfileImage("/api/Pengguna/photoProfile");
      }
      setJumlahDonasi(data.totalDonasi ?? 0);
      setMyPoin(data.poin ?? 0);
    } catch (error) {
      console.error("Error fetching pengguna:", error);
      setPenggunaName("—");
      setIsVerified(false);
      setJumlahDonasi(0);
      setMyPoin(0);
    }
  };

  // ── API 2: GET profil lengkap ───────────────────────────────────────────────
  const getProfilData = async () => {
    try {
      const res = await fetch("/api/Pengguna/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const response = await res.json();
      let profileData: any = {};

      if (res.ok) {
        if (response.hasProfile && response.data) {
          profileData = response.data;
        }
      }

      const filled: FormData = {
        namaLengkap: profileData.namaLengkap ?? "",
        email: profileData.email ?? "",
        usia: profileData.usia ?? "",
        gender: profileData.gender ?? "Laki-laki",
        pekerjaan: profileData.pekerjaan ?? "",
        phone: profileData.phone ?? "",
        address: profileData.address ?? "",
        latitude: profileData.latitude ?? -6.9175,
        longitude: profileData.longitude ?? 107.6191,
      };

      setForm(filled);
      setOriginalForm(filled);
      setIsVerified(response.isVerified ?? false);
    } catch (error) {
      console.error("Error fetching profil:", error);
      setForm({
        namaLengkap: "",
        email: "",
        usia: "",
        gender: "Laki-laki",
        pekerjaan: "",
        phone: "",
        address: "",
        latitude: -6.9175,
        longitude: 107.6191,
      });
    }
  };

  // ── API 3: PUT simpan profil ────────────────────────────────────────────────
  const handleSave = async () => {
    if (
      !form.namaLengkap.trim() ||
      !form.email.trim() ||
      !form.address.trim()
    ) {
      alert("Nama, email, dan alamat wajib diisi!");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/Pengguna/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });
      const response = await res.json();

      if (res.ok && response.success) {
        setOriginalForm(form);
        if (!response.data?.isVerified) {
          alert(
            "Profile berhasil disimpan! Data sedang menunggu verifikasi admin.",
          );
        } else {
          alert("Perubahan berhasil disimpan!");
        }
      } else {
        alert(response.message || "Gagal menyimpan perubahan.");
      }
    } catch (error) {
      console.error("Error saving profil:", error);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => setForm(originalForm);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleLocationSelect = (latitude: number, longitude: number) =>
    setForm((p) => ({ ...p, latitude, longitude }));

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const formData = new FormData();

      formData.append("foto", file);

      const res = await fetch("/api/Pengguna/photoProfile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const response = await res.json();

      if (res.ok) {
        alert("Foto profile berhasil diupload");

        setProfileImage(`/api/Pengguna/photoProfile?t=${Date.now()}`);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.log(error);

      alert("Terjadi kesalahan");
    }
  };

  const handleDeletePhoto = async () => {
    const confirmDelete = confirm("Yakin ingin menghapus foto profile?");

    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/Pengguna/photoProfile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const response = await res.json();

      if (res.ok) {
        alert("Foto berhasil dihapus");

        setProfileImage(
          "https://i.pinimg.com/236x/56/2e/be/562ebed9cd49b9a09baa35eddfe86b00.jpg",
        );
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.log(error);

      alert("Terjadi kesalahan");
    }
  };

  useEffect(() => {
    getPenggunaName();
    getProfilData();
    setProfileImage(`/api/Pengguna/photoProfile?t=${Date.now()}`);
  }, []);

  return (
    <div className="rui-container">
      <style>{STYLES}</style>

      <div className="rui-back-bar">
        <button className="rui-back-btn" onClick={() => router.back()}>
          <ChevronLeftIcon /> Kembali ke Dashboard
        </button>
      </div>

      <div className="rui-main">
        {/* SIDEBAR */}
        <aside className="rui-sidebar">
          <div className="rui-profile-card">
            <div className="rui-avatar-wrap">
              <img
                src={profileImage}
                alt={penggunaName}
                onError={(e) => {
                  e.currentTarget.src = "https://i.pravatar.cc/104?img=68";
                }}
              />
              <div className="rui-avatar-badge">
                <CheckIcon />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleUploadPhoto}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginTop: "10px",
              }}
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: "#0d7a6e",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                {" "}
                Ganti Foto
              </button>

              <button
                onClick={handleDeletePhoto}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                {" "}
                Hapus
              </button>
            </div>
            <div className="rui-profile-name">{penggunaName || "—"}</div>
            <div className="rui-profile-since">Donatur Aktif sejak 2023</div>
            {isVerified ? (
              <div className="rui-badge-verified">
                <ShieldIcon /> AKUN TERVERIFIKASI
              </div>
            ) : (
              <div className="rui-badge-pending">⏳ MENUNGGU VERIFIKASI</div>
            )}
          </div>

          {/* My Poin */}
          <div className="rui-poin-card">
            <div className="rui-poin-label">⭐ My Poin</div>
            <div className="rui-poin-value">
              {myPoin.toLocaleString("id-ID")}
            </div>
            <div className="rui-poin-sub">poin terkumpul</div>
            <div className="rui-poin-badges">
              <div className="rui-poin-badge">
                <GiftIcon /> Donatur Aktif
              </div>
              <div className="rui-poin-badge">🔥 {jumlahDonasi}x Donasi</div>
            </div>
            <div className="rui-poin-progress-wrap">
              <div className="rui-poin-progress-label">
                <span>Level Silver</span>
                <span>2.000 → Gold</span>
              </div>
              <div className="rui-poin-progress-bar">
                <div className="rui-poin-progress-fill" />
              </div>
            </div>
          </div>

          <div className="rui-stat-card">
            <div className="rui-stat-icon">
              <DocIcon />
            </div>
            <div>
              <div className="rui-stat-val">{jumlahDonasi}</div>
              <div className="rui-stat-lbl">Total Donasi</div>
            </div>
          </div>

          <div>
            <div className="rui-menu-title">Menu Akun</div>
            {(
              [
                {
                  key: "profil",
                  label: "Edit Profil",
                  icon: <UserIcon size={15} />,
                },
                {
                  key: "riwayat",
                  label: "Riwayat Donasi",
                  icon: <ClockIcon />,
                },
                {
                  key: "keamanan",
                  label: "Pengaturan Keamanan",
                  icon: <LockIcon />,
                },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                className={`rui-menu-item ${activeMenu === m.key ? "active" : ""}`}
                onClick={() => setActiveMenu(m.key)}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
        </aside>

        {/* CONTENT */}
        <div className="rui-content">
          {/* Form */}
          <div className="rui-form-card">
            <div className="rui-form-header">
              <div className="rui-form-header-text">
                <h2>Informasi Pribadi</h2>
                <p>
                  Perbarui data diri Anda untuk memudahkan proses penjemputan
                  barang.
                </p>
              </div>
              <div className="rui-form-header-icon">
                <DocIcon />
              </div>
            </div>
            <div className="rui-form-grid">
              <div className="rui-field">
                <label>Nama Lengkap</label>
                <input
                  className="rui-input"
                  type="text"
                  name="namaLengkap"
                  value={form.namaLengkap}
                  onChange={handleChange}
                />
              </div>
              <div className="rui-field">
                <label>Alamat Email</label>
                <input
                  className="rui-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="rui-field">
                <label>Usia</label>
                <input
                  className="rui-input"
                  type="text"
                  name="usia"
                  value={form.usia}
                  onChange={handleChange}
                />
              </div>
              <div className="rui-field">
                <label>Jenis Kelamin</label>
                <select
                  className="rui-select"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </div>
              <div className="rui-field">
                <label>Pekerjaan</label>
                <input
                  className="rui-input"
                  type="text"
                  name="pekerjaan"
                  value={form.pekerjaan}
                  onChange={handleChange}
                />
              </div>
              <div className="rui-field">
                <label>Nomor Telepon</label>
                <div className="rui-phone-row">
                  <div className="rui-phone-prefix">+62</div>
                  <input
                    className="rui-input rui-phone-input"
                    type="tel"
                    name="phine"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="rui-field full">
                <label>Alamat Rumah</label>
                <textarea
                  className="rui-textarea"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="rui-form-actions">
              <button className="rui-btn-cancel" onClick={handleCancel}>
                Batalkan
              </button>
              <button
                className="rui-btn-save"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="rui-map-card">
            <div className="rui-map-header">
              <div className="rui-map-header-icon">
                <MapPinIcon size={16} />
              </div>
              <div>
                <h3>Lokasi Alamat</h3>
                <p>
                  Klik peta atau geser pin untuk menentukan lokasi rumah Anda
                </p>
              </div>
            </div>
            <LeafletMap
              latitude={form.latitude ?? -6.9175}
              longitude={form.longitude ?? 107.6191}
              onLocationSelect={handleLocationSelect}
            />
            <div className="rui-map-coords">
              <div className="rui-coord-pill">
                <MapPinIcon size={10} /> Lat:{" "}
                <span>{(form.latitude ?? -6.9175).toFixed(5)}</span>
              </div>
              <div className="rui-coord-pill">
                <MapPinIcon size={10} /> Lng:{" "}
                <span>{(form.longitude ?? 107.6191).toFixed(5)}</span>
              </div>
            </div>
          </div>

          {/* My Poin Detail */}
          <div className="rui-poin-detail-card">
            <div className="rui-poin-detail-header">
              <div className="rui-poin-detail-icon">
                <StarIcon size={17} />
              </div>
              <div>
                <h3>Riwayat & Reward Poin</h3>
                <p>Tukarkan poin Anda dengan hadiah menarik</p>
              </div>
            </div>
            <div className="rui-poin-history">
              {poinHistory.map((item, i) => (
                <div className="rui-poin-item" key={i}>
                  <div className="rui-poin-item-left">
                    <div
                      className="rui-poin-item-dot"
                      style={{ background: item.dot }}
                    />
                    <div>
                      <div className="rui-poin-item-desc">{item.desc}</div>
                      <div className="rui-poin-item-date">{item.date}</div>
                    </div>
                  </div>
                  <div
                    className={`rui-poin-item-val ${item.val > 0 ? "pos" : "neg"}`}
                  >
                    {item.val > 0 ? "+" : ""}
                    {item.val} poin
                  </div>
                </div>
              ))}
            </div>
            <div className="rui-reward-grid">
              {rewards.map((r, i) => (
                <div className="rui-reward-item" key={i}>
                  <div className="rui-reward-emoji">{r.emoji}</div>
                  <div className="rui-reward-name">{r.name}</div>
                  <div className="rui-reward-poin">⭐ {r.poin} poin</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
