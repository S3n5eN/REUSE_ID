"use client";

import { useEffect, useState } from "react";


// ─── Types ────────────────────────────────────────────────────────────────────

type Item = {
  id: number;
  name: string;
  category: string;
  description: string;
  createdAt: string;
  imageURL: string;
  status: string;
  quality?: string;
  user?: { name: string };
  place?: { name: string };
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
  onApprove,
  onReject,
  loading,
  index,
}: {
  item: Item;
  onApprove: (id: number, quality: QualityValue) => void;
  onReject: (id: number) => void;
  loading: boolean;
  index: number;
}) {
  const [selectedQuality, setSelectedQuality] = useState<QualityValue | "">("");
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  const handleApprove = () => {
    if (!selectedQuality) return;
    setExiting(true);
    setTimeout(() => onApprove(item.id, selectedQuality as QualityValue), 350);
  };

  const handleReject = () => {
    setExiting(true);
    setTimeout(() => onReject(item.id), 350);
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
        {item.imageURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageURL}
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
          <select
            className="text-[12px] font-medium py-[7px] px-2.5 rounded-[9px] border border-[#9FE1CB] bg-[#E1F5EE] text-[#085041] cursor-pointer flex-1 min-w-[160px] max-w-[230px] outline-none focus:border-[#1D9E75] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            value={selectedQuality}
            onChange={(e) =>
              setSelectedQuality(e.target.value as QualityValue | "")
            }
            disabled={loading}
          >
            <option value="" disabled>
              Pilih kualitas untuk verifikasi
            </option>
            {QUALITY_OPTIONS.map((q) => (
              <option key={q.value} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>

          {/* Approve — shown only when quality selected */}
          {selectedQuality && (
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
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setFetchLoading(true);
    fetch("/api/Barang/getItemPending")
      .then(async (res) => {
        const text = await res.text();
        try {
          const parsed = JSON.parse(text);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          console.error("Response bukan JSON:", text);
          return [];
        }
      })
      .then((data) => setItems(data))
      .finally(() => setFetchLoading(false));
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id: number, quality: QualityValue) => {
    try {
      setLoading(true);
      const res = await fetch("/api/verifikasiBarang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, action: "Approve", quality }),
      });
      const text = await res.text();
      if (!res.ok) { showToast("Gagal: " + text, "error"); return; }
      const data = JSON.parse(text);
      showToast(data.message ?? "Barang berhasil diverifikasi", "success");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
      showToast("Terjadi error di frontend", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch("/api/verifikasiBarang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, action: "Reject" }),
      });
      const text = await res.text();
      if (!res.ok) { showToast("Gagal: " + text, "error"); return; }
      const data = JSON.parse(text);
      showToast(data.message ?? "Barang ditolak", "success");
      setItems((prev) => prev.filter((i) => i.id !== id));
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

      <div className="max-w-full mx-auto px-6 py-8">

        {/* ── Page header ── */}
        <div className="flex items-center gap-3.5 mb-8">
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
          <ItemCard
            key={item.id}
            item={item}
            index={i}
            onApprove={handleApprove}
            onReject={handleReject}
            loading={loading}
          />
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