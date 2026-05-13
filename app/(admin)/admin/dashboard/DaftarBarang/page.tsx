"use client";

import { useEffect, useState } from "react";


// ─── Types ────────────────────────────────────────────────────────────────────

type Item = {
  shipmentId: number;
  id: number;
  name: string;
  category: string;
  description: string;
  createdAt: string;
  imageURL: string;
  status: string;
  quality?: string;
  weight?: string;
  user?: { name: string };
  place?: { id: number; name: string };
  rak?: { nomor: string };
};

type Rak = {
  id: number;
  nomor: string;
  kapasitasMax: number;
  kapasitasSekarang: number;
};

type QualityValue = "SangatBaik" | "Baik" | "CukupBaik" | "Layak" | "CukupLayak";

const QUALITY_OPTIONS: { value: QualityValue; label: string }[] = [
  { value: "SangatBaik", label: "Sangat Baik" },
  { value: "Baik", label: "Baik" },
  { value: "CukupBaik", label: "Cukup Baik" },
  { value: "Layak", label: "Layak" },
  { value: "CukupLayak", label: "Cukup Layak" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImagePlaceholder() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[140px] bg-[#E1F5EE]">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1D9E75"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9.5px] font-bold tracking-[0.07em] uppercase text-[#1D9E75]">
        {label}
      </span>
      <span className="text-[12px] font-semibold text-[#04342C]">{value}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="grid grid-cols-[10px_1fr] bg-white border border-[#e8f5ef] rounded-2xl overflow-hidden mb-3.5 animate-pulse">
      <div className="w-[180px] min-h-[200px] bg-[#E1F5EE]" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 w-3/5 rounded-md bg-[#E1F5EE]" />
        <div className="h-3 w-2/5 rounded-md bg-[#E1F5EE]" />
        <div className="h-3 w-1/2 rounded-md bg-[#E1F5EE]" />
        <div className="flex gap-2 mt-1">
          <div className="h-8 flex-1 max-w-[200px] rounded-lg bg-[#E1F5EE]" />
          <div className="h-8 w-20 rounded-lg bg-[#E1F5EE]" />
          <div className="h-8 w-16 rounded-lg bg-[#E1F5EE]" />
        </div>
      </div>
    </div>
  );
}

function ItemCard({
  item,
  raks,
  onApprove,
  onReject,
  loading,
  index,
}: {
  item: Item;
  raks: Rak[];
  onApprove: (id: number, quality: QualityValue, rakId: number, weight: string) => void;
  onReject: (id: number) => void;
  loading: boolean;
  index: number;
}) {
  const [selectedQuality, setSelectedQuality] = useState<QualityValue | "">("");
  const [weight, setWeight] = useState<string>("");
  const [selectedRak, setSelectedRak] = useState<number | "">("");
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);



  const handleApprove = () => {
    if (!selectedQuality || !selectedRak || weight === "" || parseFloat(weight) < 0) return;
    setExiting(true);

    setTimeout(() => onApprove(item.shipmentId, selectedQuality as QualityValue, selectedRak as number, parseFloat(weight));
  };

  const handleReject = () => {
    setExiting(true);
    setTimeout(() => onReject(item.shipmentId), 350);
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={[
        "relative grid grid-cols-[180px_1fr] bg-white border rounded-2xl overflow-hidden mb-3.5",
        "transition-all duration-300 ease-out",
        "hover:border-[#5DCAA5] hover:shadow-[0_4px_20px_rgba(29,158,117,0.08)]",
        "border-[#e8f5ef]",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        exiting ? "opacity-0 translate-x-3" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Teal accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#1D9E75] to-[#5DCAA5] rounded-l-2xl z-10" />

      {/* Image */}
      <div className="relative w-[180px] min-h-[200px] overflow-hidden shrink-0">
        {item.imageType ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/Barang/getImage/${item.id}`}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-[14px_16px_12px]">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2.5">
          <h2 className="text-[15px] font-bold text-[#04342C] leading-tight tracking-tight">
            {item.name}
          </h2>
          <span className="font-mono text-[9.5px] font-medium tracking-wider px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB] whitespace-nowrap shrink-0">
            {item.status}
          </span>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-y-1 gap-x-4">
          <MetaField label="Kategori" value={item.category} />
          <MetaField label="Donatur" value={item.user?.name ?? "—"} />
          <MetaField label="Lokasi" value={item.place?.name ?? "—"} />
          <MetaField
            label="Kualitas"
            value={item.quality ?? "Belum diverifikasi"}
          />
          <MetaField label="Berat Barang" value={item.weight ? `${item.weight} kg` : "—"} />
          <MetaField label="Lokasi Rak" value={item.rak ? `Rak ${item.rak.nomor}` : "—"} />
        </div>

        {/* Description */}
        <div className="flex items-center gap-2 flex-wrap border-t border-[#E1F5EE] pt-2 text-[11.5px] text-[#5a7a70] leading-relaxed">
          <span>{item.description}</span>
          <span className="font-mono text-[10px] text-[#0F6E56] bg-[#E1F5EE] border border-[#9FE1CB] rounded-[5px] px-1.5 py-0.5 whitespace-nowrap">
            {formattedDate}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          {/* Input Berat */}
          <div className="relative flex-1 min-w-[100px] max-w-[120px]">
            <input
              type="number"
              step="0.1"
              min="0.0"
              placeholder="Berat (kg)"
              className="w-full text-[12px] font-medium py-[7px] px-2.5 rounded-[9px] border border-[#9FE1CB] bg-[#E1F5EE] text-[#085041] outline-none focus:border-[#1D9E75] transition-colors"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={loading}
              onBlur={(e) => {
                // Memastikan jika user input minus, otomatis jadi 0
                if (parseFloat(e.target.value) < 0) setWeight("0");
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#1D9E75] font-bold">KG</span>
          </div>

          <select
            className="text-[12px] font-medium py-[7px] px-2.5 rounded-[9px] border border-[#9FE1CB] bg-[#E1F5EE] text-[#085041] cursor-pointer flex-1 min-w-[140px] max-w-[200px] outline-none focus:border-[#1D9E75] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            value={selectedQuality}
            onChange={(e) =>
              setSelectedQuality(e.target.value as QualityValue | "")
            }
            disabled={loading}
          >
            <option value="" disabled>
              Pilih kualitas
            </option>
            {QUALITY_OPTIONS.map((q) => (
              <option key={q.value} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>

          <select
            className="text-[12px] font-medium py-[7px] px-2.5 rounded-[9px] border border-[#9FE1CB] bg-[#E1F5EE] text-[#085041] cursor-pointer flex-1 min-w-[140px] max-w-[200px] outline-none focus:border-[#1D9E75] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            value={selectedRak}
            onChange={(e) =>
              setSelectedRak(Number(e.target.value))
            }
            disabled={loading}
          >
            <option value="" disabled>
              Pilih Rak
            </option>
            {raks.map((r) => (
              <option key={r.id} value={r.id} disabled={r.kapasitasSekarang >= r.kapasitasMax}>
                Rak {r.nomor} ({r.kapasitasSekarang}/{r.kapasitasMax})
              </option>
            ))}
          </select>

          {/* Approve — shown only when quality and rak selected */}
          {selectedQuality && selectedRak && (
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex items-center gap-1.5 text-[12px] font-semibold py-[7px] px-3.5 rounded-[9px] border border-[#5DCAA5] bg-[#1D9E75] text-white whitespace-nowrap transition-colors hover:bg-[#0F6E56] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Verifikasi
            </button>
          )}

          {/* Reject */}
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex items-center gap-1.5 text-[12px] font-semibold py-[7px] px-3.5 rounded-[9px] border border-[#F09595] bg-[#FCEBEB] text-[#A32D2D] whitespace-nowrap transition-colors hover:bg-[#F7C1C1] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 3l6 6M9 3l-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Tolak
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={[
        "fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-xl",
        "text-[13px] font-semibold text-white z-50",
        "shadow-lg animate-[toastIn_0.3s_ease_both]",
        type === "success" ? "bg-[#1D9E75]" : "bg-[#E24B4A]",
      ].join(" ")}
    >
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {message}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DaftarBarangPendingPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [pendingItems, setPendingItems] = useState<Item[]>([]);
  const [approvedItems, setApprovedItems] = useState<Item[]>([]);
  const [places, setPlaces] = useState<{ id: number; name: string }[]>([]);
  const [raks, setRaks] = useState<Rak[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Tambahkan fallback [] agar tidak error saat data belum siap
  const items = (activeTab === "pending" ? (pendingItems ?? []) : (approvedItems ?? []))
    .filter((item) => selectedPlace ? item.place?.id === selectedPlace : true)
    .filter((item) => search ? item.name.toLowerCase().includes(search.toLowerCase()) : true);

  const fetchItems = async () => {
    setFetchLoading(true);
    try {
      const [pendingRes, approvedRes, placesRes, rakRes] = await Promise.all([
        fetch("/api/Barang/getItemPending"),
        fetch("/api/Barang/getItemApprove"),
        fetch("/api/LokasiPengumpulan/getPlace"),
        fetch("/api/Admin/kelolaRak")
      ]);

      // Fungsi pembantu agar tidak repetitif dan aman
      const safeParse = async (res) => {
        try {
          const text = await res.text();
          if (!res.ok) {
            console.error(`API Error (${res.status}):`, text);
            return [];
          }
          const data = JSON.parse(text);
          return Array.isArray(data) ? data : [];
        } catch (e) {
          console.error("Parse Error:", e);
          return [];
        }
      };

      // Eksekusi parse untuk masing-masing response
      const pendingData = await safeParse(pendingRes);
      const approvedData = await safeParse(approvedRes);
      const placesData = await safeParse(placesRes);

      let rakData = [];
      if (rakRes.ok) {
        const parsedRak = await rakRes.json();
        rakData = parsedRak.data || [];
      }

      // Set ke state menggunakan variabel asli
      setPendingItems(pendingData);
      setApprovedItems(approvedData);
      setPlaces(placesData);
      setRaks(rakData);

    } catch (error) {
      console.error("Network/Unexpected Error:", error);
      setPendingItems([]);
      setApprovedItems([]);
      setPlaces([]);
      setRaks([]);
    } finally {
      setFetchLoading(false);
    }
  };
  useEffect(() => {
    fetchItems();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (shipmentId: number, quality: QualityValue, rakId: number) => {
    try {
      setLoading(true);
      const res = await fetch("/api/Admin/verifikasiBarang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId, action: "Approve", quality, rakId }),
      });
      const text = await res.text();
      if (!res.ok) { showToast("Gagal: " + text, "error"); return; }
      const data = JSON.parse(text);
      showToast(data.message ?? "Barang berhasil diverifikasi", "success");
      setPendingItems((prev) => prev.filter((i) => i.shipmentId !== shipmentId));
    } catch (err) {
      console.error(err);
      showToast("Terjadi error di frontend", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (shipmentId: number) => {
    try {
      setLoading(true);
      const res = await fetch("/api/Admin/verifikasiBarang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId, action: "Reject" }),
      });
      const text = await res.text();
      if (!res.ok) { showToast("Gagal: " + text, "error"); return; }
      const data = JSON.parse(text);
      showToast(data.message ?? "Barang ditolak", "success");
      setPendingItems((prev) => prev.filter((i) => i.shipmentId !== shipmentId));
    } catch (err) {
      console.error(err);
      showToast("Terjadi error di frontend", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* toastIn keyframe — Tailwind v4 arbitrary animation support */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="grid grid-cols-2 gap-3 max-w-full mx-auto px-6 py-8">

        {/* ── Page header ── */}
        <div className="flex col-span-2 items-center gap-3.5 mb-8">
          <div className="w-11 h-11 rounded-xl bg-[#E1F5EE] border border-[#9FE1CB] flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              <path d="M16 3H8L6 7h12l-2-4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-[1.35rem] font-bold text-[#04342C] tracking-tight leading-snug">
              Daftar Barang Pending
            </h1>
            <p className="text-[0.78rem] text-[#0F6E56] font-medium mt-0.5">
              Verifikasi barang donasi yang masuk
            </p>
          </div>
          {!fetchLoading && (
            <span className="ml-auto font-mono text-[12px] font-medium bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB] rounded-full px-3.5 py-1">
              {items.length} item
            </span>
          )}
        </div>
        {/* Tab + Search */}
        <div className="col-span-2 flex items-center justify-between gap-2 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors border
        ${activeTab === "pending"
                  ? "bg-[#1D9E75] text-white border-[#1D9E75]"
                  : "bg-white text-[#0F6E56] border-[#9FE1CB] hover:bg-[#E1F5EE]"
                }`}
            >
              Pending
              <span className="ml-2 font-mono text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {pendingItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("approved")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors border
        ${activeTab === "approved"
                  ? "bg-[#1D9E75] text-white border-[#1D9E75]"
                  : "bg-white text-[#0F6E56] border-[#9FE1CB] hover:bg-[#E1F5EE]"
                }`}
            >
              Tersedia
              <span className="ml-2 font-mono text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {approvedItems.length}
              </span>
            </button>
          </div>

          {/* Search — kanan */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-[#9FE1CB] rounded-lg px-3 py-1.5 bg-[#E1F5EE]">
              <svg className="w-3.5 h-3.5 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama barang..."
                className="text-sm text-[#085041] bg-transparent outline-none w-48"
              />
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-[#0F6E56] hover:text-[#04342C] transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        {/* ── Processing indicator ── */}
        {loading && (
          <div className="flex items-center gap-2 text-[12px] text-[#0F6E56] font-semibold mb-5">
            <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
            Memproses permintaan...
          </div>
        )}

        {/* ── Skeleton loading ── */}
        {fetchLoading && [1, 2, 3].map((n) => <SkeletonCard key={n} />)}

        {/* ── Item list ── */}
        {!fetchLoading && items.map((item, i) => (
          activeTab === "pending" ? (
            <ItemCard
              key={item.id}
              item={item}
              raks={raks}
              index={i}
              onApprove={handleApprove}
              onReject={handleReject}
              loading={loading}
            />
          ) : (
            <div
              key={item.id}
              className="relative grid grid-cols-[180px_1fr] bg-white border border-[#e8f5ef] rounded-2xl overflow-hidden mb-3.5 hover:border-[#5DCAA5] hover:shadow-[0_4px_20px_rgba(29,158,117,0.08)] transition-all"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#1D9E75] to-[#5DCAA5] rounded-l-2xl z-10" />
              <div className="relative w-[180px] min-h-[160px] overflow-hidden shrink-0">
                <img
                  src={`/api/Barang/getImage/${item.id}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 p-[14px_16px_12px]">
                <div className="flex items-start justify-between gap-2.5">
                  <h2 className="text-[15px] font-bold text-[#04342C] leading-tight">{item.name}</h2>
                  <span className="font-mono text-[9.5px] font-medium px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB] whitespace-nowrap shrink-0">
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                  <MetaField label="Kategori" value={item.category} />
                  <MetaField label="Donatur" value={item.user?.name ?? "—"} />
                  <MetaField label="Lokasi" value={item.place?.name ?? "—"} />
                  <MetaField label="Kualitas" value={item.quality ?? "—"} />
                </div>
                <p className="text-[11.5px] text-[#5a7a70] border-t border-[#E1F5EE] pt-2">{item.description}</p>
              </div>
            </div>
          )
        ))}

        {/* ── Empty state ── */}
        {!fetchLoading && items.length === 0 && (
          <div className="flex flex-col items-center py-16 px-8 text-center">
            <div className="w-14 h-14 rounded-[14px] bg-[#E1F5EE] border border-[#9FE1CB] flex items-center justify-center mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
              </svg>
            </div>
            <p className="text-[14px] font-bold text-[#085041] mb-1">
              Semua barang sudah diverifikasi
            </p>
            <p className="text-[12px] text-[#0F6E56]">
              Tidak ada barang yang menunggu approval saat ini
            </p>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}