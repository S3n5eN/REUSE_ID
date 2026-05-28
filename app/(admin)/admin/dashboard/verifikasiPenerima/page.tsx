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
  CreditCard,
  Check,
  X,
  Search,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import SuccessPopup from "@/components/SuccessPopup";
import ErrorPopup from "@/components/ErrorPopup";
import ConfirmPopup from "@/components/ConfirmPopup";

// ─── Types ────────────────────────────────────────────────────────────────────

type Gender = "Pria" | "Wanita";

interface UserProfile {
  id: number;
  namaLengkap: string;
  phone: string;
  address: string;
  usia: number;
  gender: Gender;
  identityId: string;
  isVerified: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function maskId(id: string): string {
  if (!id) return "-";
  if (id.length <= 8) return id; // Jaga-jaga jika ID terlalu pendek
  return id.slice(0, 4) + "••••••••" + id.slice(-4);
}

// ─── User Card Component ──────────────────────────────────────────────────────

interface UserCardProps {
  user: UserProfile;
  index: number;
  onAction: (userId: number, action: "Approve" | "Reject") => void;
  processingData: { id: number; action: "Approve" | "Reject" } | null;
}

function UserCard({ user, index, onAction, processingData }: UserCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showId, setShowId] = useState(false);
  const isPending = processingData?.id === user.id;
  const actionType = processingData?.id === user.id ? processingData.action : null;

  const handleAction = (action: "Approve" | "Reject") => {
    onAction(user.id, action);
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
          {getInitials(user.namaLengkap)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {user.namaLengkap}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            ID: #{user.id} · {user.gender} · {user.usia} tahun
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
                <p className="text-sm font-medium text-slate-700">{user.phone}</p>
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
                  {user.usia} tahun · {user.gender}
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
                  {user.address}
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
                    {showId ? user.identityId : maskId(user.identityId)}
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
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [successPopupMsg, setSuccessPopupMsg] = useState<string | null>(null);
  const [errorPopupMsg, setErrorPopupMsg] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<{
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
  } | null>(null);
  const [processingData, setProcessingData] = useState<{
    id: number;
    action: "Approve" | "Reject";
  } | null>(null);

  useEffect(() => {
    const fetchDataUnverifidUsers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/Pengguna/getUnverifiedUser");
        if (!res.ok) throw new Error("Gagal mengambil data pengguna");
        
        const json = await res.json();
        setUsers(json.data || []);
      } catch (error) {
        console.error("Error fetching unverified users:", error);
        setErrorPopupMsg("Gagal mengambil data pengguna");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataUnverifidUsers();
  }, []);

  const filtered = users.filter((u) =>
    u.namaLengkap?.toLowerCase().includes(search.toLowerCase())
  );

  const executeAction = async (
    userId: number,
    action: "Approve" | "Reject"
  ) => {
    try {
      setProcessingData({ id: userId, action });
      const res = await fetch("/api/Admin/verifikasiDataPenerima", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      if (!res.ok) throw new Error("Gagal memverifikasi data penerima");
      
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSuccessPopupMsg(`Pengguna berhasil di-${action === "Approve" ? "verifikasi" : "tolak"}`);
    } catch {
      setErrorPopupMsg("Terjadi kesalahan, coba lagi");
    } finally {
      setProcessingData(null);
    }
  };

  const handleAction = (
    userId: number,
    action: "Approve" | "Reject"
  ) => {
    setConfirmData({
      message: action === "Approve"
        ? "Apakah Anda yakin ingin memverifikasi data penerima ini?"
        : "Apakah Anda yakin ingin menolak data penerima ini?",
      type: action === "Approve" ? "info" : "danger",
      onConfirm: () => executeAction(userId, action),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-plus-jakarta)]">
      <div className="px-4 py-8 sm:px-6">

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
                Tinjau dan verifikasi identitas pengguna sebelum mereka dapat menerima donasi.
              </p>
            </div>

            {/* Counter badge */}
            <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-2xl px-4 py-2.5 shadow-sm">
              <Users size={15} className="text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">
                {users.length}
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
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((user, i) => (
              <UserCard
                key={user.id}
                user={user}
                index={i}
                onAction={handleAction}
                processingData={processingData}
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

      {successPopupMsg && (
        <SuccessPopup
          message={successPopupMsg}
          onClose={() => setSuccessPopupMsg(null)}
        />
      )}
      {errorPopupMsg && (
        <ErrorPopup
          message={errorPopupMsg}
          onClose={() => setErrorPopupMsg(null)}
        />
      )}
      {confirmData && (
        <ConfirmPopup
          message={confirmData.message}
          type={confirmData.type}
          onConfirm={() => {
            confirmData.onConfirm();
            setConfirmData(null);
          }}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </div>
  );
}