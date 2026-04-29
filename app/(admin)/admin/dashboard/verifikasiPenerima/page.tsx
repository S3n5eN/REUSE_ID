"use client";

import { useState, useTransition, useEffect } from "react";
import {
  ChevronDown,
  ShieldCheck,
  ShieldX,
  Clock,
  Phone,
  MapPin,
  User,
  Briefcase,
  CreditCard,
  Check,
  X,
  Search,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Gender = "Laki-laki" | "Perempuan";

interface UserProfile {
  id: number;
  namaLengkap: string;
  phone: string;
  pekerjaan?: string;
  address: string;
  usia: number;
  gender: Gender;
  identityId: string;
  isVerified: boolean;
}

interface PendingItem {
  shipmentId: number;
  userProfile: UserProfile;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DATA: PendingItem[] = [
  {
    shipmentId: 1,
    userProfile: {
      id: 1,
      namaLengkap: "Budi Santoso",
      phone: "081234567890",
      pekerjaan: "Guru SD",
      address: "Jl. Merdeka No. 12, Bandung, Jawa Barat 40111",
      usia: 34,
      gender: "Laki-laki",
      identityId: "3201234567890001",
      isVerified: false,
    },
  },
  {
    shipmentId: 2,
    userProfile: {
      id: 2,
      namaLengkap: "Siti Rahayu",
      phone: "085678901234",
      pekerjaan: "Ibu Rumah Tangga",
      address: "Jl. Kebon Jeruk No. 7, Jakarta Barat 11530",
      usia: 29,
      gender: "Perempuan",
      identityId: "3171987654321002",
      isVerified: false,
    },
  },
  {
    shipmentId: 3,
    userProfile: {
      id: 3,
      namaLengkap: "Ahmad Fauzi",
      phone: "087712345678",
      pekerjaan: "Buruh Harian",
      address: "Jl. Pahlawan RT.03 No. 4, Surabaya, Jawa Timur 60272",
      usia: 42,
      gender: "Laki-laki",
      identityId: "3578234512346789",
      isVerified: false,
    },
  },
  {
    shipmentId: 4,
    userProfile: {
      id: 4,
      namaLengkap: "Dewi Lestari",
      phone: "082298765432",
      pekerjaan: "Pelajar",
      address: "Jl. Flamboyan No. 19, Yogyakarta 55281",
      usia: 21,
      gender: "Perempuan",
      identityId: "3404200102030001",
      isVerified: false,
    },
  },
  {
    shipmentId: 5,
    userProfile: {
      id: 5,
      namaLengkap: "Rudi Hartono",
      phone: "089912356789",
      pekerjaan: "Nelayan",
      address: "Jl. Pantai Indah Blok C No. 2, Makassar 90111",
      usia: 38,
      gender: "Laki-laki",
      identityId: "7371381501820003",
      isVerified: false,
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function maskId(id: string): string {
  return id.slice(0, 4) + "••••••••" + id.slice(-4);
}

// ─── Toast Component ──────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type: "success" | "error" | null;
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (!type) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${
        type === "success"
          ? "bg-teal-800 text-teal-100"
          : "bg-red-800 text-red-100"
      }`}
    >
      {type === "success" ? (
        <ShieldCheck size={16} />
      ) : (
        <ShieldX size={16} />
      )}
      {message}
    </div>
  );
}

// ─── User Card Component ──────────────────────────────────────────────────────

interface UserCardProps {
  item: PendingItem;
  index: number;
  onAction: (shipmentId: number, action: "Approve" | "Reject") => Promise<void>;
}

function UserCard({ item, index, onAction }: UserCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showId, setShowId] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState<"Approve" | "Reject" | null>(null);
  const p = item.userProfile;

  const handleAction = (action: "Approve" | "Reject") => {
    setActionType(action);
    startTransition(async () => {
      await onAction(item.shipmentId, action);
      setActionType(null);
    });
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-teal-200"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-teal-400 via-teal-300 to-transparent" />

      {/* Header row */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/60 transition-colors duration-150 cursor-pointer"
      >
        {/* Avatar */}
        <div className="w-11 h-11 min-w-[44px] rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold tracking-wide shadow-inner">
          {getInitials(p.namaLengkap)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {p.namaLengkap}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Shipment #{item.shipmentId} · {p.gender} · {p.usia} tahun
          </p>
        </div>

        {/* Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Belum terverifikasi
        </div>

        {/* Chevron */}
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 transition-all duration-300 ${
            isOpen ? "rotate-180 bg-teal-50 text-teal-600" : "bg-slate-50"
          }`}
        >
          <ChevronDown size={16} />
        </div>
      </button>

      {/* Expandable body */}
      <div
        className={`overflow-hidden transition-all duration-350 ease-in-out ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5">
          <div className="h-px bg-gradient-to-r from-slate-100 via-teal-100 to-slate-100 mb-5" />

          {/* Data grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* Phone */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center mt-0.5">
                <Phone size={13} className="text-teal-700" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-0.5">
                  Telepon
                </p>
                <p className="text-sm font-medium text-slate-700">{p.phone}</p>
              </div>
            </div>

            {/* Pekerjaan */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center mt-0.5">
                <Briefcase size={13} className="text-teal-700" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-0.5">
                  Pekerjaan
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {p.pekerjaan || "—"}
                </p>
              </div>
            </div>

            {/* Usia */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center mt-0.5">
                <User size={13} className="text-teal-700" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-0.5">
                  Usia
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {p.usia} tahun · {p.gender}
                </p>
              </div>
            </div>

            {/* Alamat */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center mt-0.5">
                <MapPin size={13} className="text-teal-700" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-0.5">
                  Alamat
                </p>
                <p className="text-sm font-medium text-slate-700 leading-snug">
                  {p.address}
                </p>
              </div>
            </div>

            {/* Identity ID */}
            <div className="sm:col-span-2 flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center mt-0.5">
                <CreditCard size={13} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-amber-600 font-medium mb-0.5">
                  Nomor Identitas (KTP)
                </p>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-mono font-medium text-slate-700 transition-all duration-200 ${
                      showId ? "" : "blur-sm select-none"
                    }`}
                  >
                    {showId ? p.identityId : maskId(p.identityId)}
                  </p>
                  <button
                    onClick={() => setShowId((v) => !v)}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-amber-100 text-amber-500 transition-colors"
                    title={showId ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showId ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 mr-auto">
              <Clock size={11} className="inline mr-1 mb-0.5" />
              Menunggu tinjauan admin
            </span>

            <button
              onClick={() => handleAction("Reject")}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {isPending && actionType === "Reject" ? (
                <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <X size={14} />
              )}
              Tolak
            </button>

            <button
              onClick={() => handleAction("Approve")}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-all duration-150 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 active:scale-95"
            >
              {isPending && actionType === "Approve" ? (
                <span className="w-3.5 h-3.5 border-2 border-teal-300 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Verifikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VerifikasiPenerimaPage() {
  const [items, setItems] = useState<PendingItem[]>(MOCK_DATA);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  const filtered = items.filter((item) =>
    item.userProfile.namaLengkap.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (
    shipmentId: number,
    action: "Approve" | "Reject"
  ) => {
    try {
      // ── Replace this with real fetch ──────────────────────────────────────
      // const res = await fetch("/api/admin/verifikasi-penerima", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ shipmentId, action }),
      // });
      // if (!res.ok) throw new Error();
      // ─────────────────────────────────────────────────────────────────────

      await new Promise((r) => setTimeout(r, 1100)); // simulated delay

      setItems((prev) => prev.filter((i) => i.shipmentId !== shipmentId));
      setToast({
        message:
          action === "Approve"
            ? "Pengguna berhasil diverifikasi"
            : "Pengajuan ditolak",
        type: action === "Approve" ? "success" : "error",
      });
    } catch {
      setToast({ message: "Terjadi kesalahan, coba lagi", type: "error" });
    }
  };

  return (
    <div className="min-h-screen  bg-slate-50 font-[family-name:var(--font-plus-jakarta)]">
      <div className=" px-4 py-8 sm:px-6">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-8 ">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-600 mb-2">
                ReuseID · Admin
              </p>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                Verifikasi Penerima
              </h1>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                Tinjau dan verifikasi identitas pengguna sebelum pengiriman
                diproses
              </p>
            </div>

            {/* Counter badge */}
            <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-2xl px-4 py-2.5 shadow-sm">
              <Users size={15} className="text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">
                {items.length}
              </span>
              <span className="text-xs text-slate-400">menunggu</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
          </div>

          {/* Decorative line */}
          <div className="mt-5 h-px bg-gradient-to-r from-teal-200 via-slate-200 to-transparent" />
        </div>

        {/* ── Search Bar ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pengguna..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-150"
            />
          </div>
          <div className="h-10 px-4 flex items-center rounded-xl bg-white border border-slate-200 text-sm text-slate-500 whitespace-nowrap">
            <span className="font-semibold text-teal-700 mr-1">
              {filtered.length}
            </span>
            hasil
          </div>
        </div>

        {/* ── User List ────────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((item, i) => (
              <UserCard
                key={item.shipmentId}
                item={item}
                index={i}
                onAction={handleAction}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <ShieldCheck size={28} className="text-teal-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-700">
                {search
                  ? "Tidak ada hasil ditemukan"
                  : "Semua pengguna sudah terverifikasi"}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {search
                  ? `Tidak ada pengguna dengan nama "${search}"`
                  : "Tidak ada pengajuan yang perlu ditinjau saat ini"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: null })}
      />
    </div>
  );
}