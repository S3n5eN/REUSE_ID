"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import SuccessPopup from "@/components/SuccessPopup";
import ErrorPopup from "@/components/ErrorPopup";
import ConfirmPopup from "@/components/ConfirmPopup";

// ── Icons ────────────────────────────────────────────────────────────────────
const ChevronLeftIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const PencilIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
  </svg>
);
const UserIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const GiftIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const DocIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="9" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="15" y2="11" /><line x1="9" y1="15" x2="12" y2="15" />
  </svg>
);
const AwardIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profileImage, setProfileImage] = useState("/api/Pengguna/photoProfile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [penggunaName, setPenggunaName] = useState("");
  const [isVerified, setIsVerified] = useState(true);
  const [jumlahDonasi, setJumlahDonasi] = useState(0);
  const [myPoin, setMyPoin] = useState(0);
  const [streak, setStreak] = useState(0);
  const [memberSinceYear, setMemberSinceYear] = useState(new Date().getFullYear());
  
  // Modal Photo States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [popupSuccess, setPopupSuccess] = useState<string | null>(null);
  const [popupError, setPopupError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const getPenggunaName = async () => {
    try {
      const res = await fetch("/api/Pengguna");
      if (!res.ok) { console.warn("Failed to fetch pengguna data:", res.status); return; }
      const data = await res.json();
      setPenggunaName(data.namalengkap || data.profile?.nama || "—");
      setIsVerified(data.isVerified ?? false);
      if (data.hasProfileImage) setProfileImage("/api/Pengguna/photoProfile");
      setJumlahDonasi(data.totalDonasi ?? 0);
      setMyPoin(data.poin ?? 0);
      setStreak(data.streak ?? 0);
      if (data.createdAt) {
        setMemberSinceYear(new Date(data.createdAt).getFullYear());
      }
    } catch (error) {
      console.error("Error fetching pengguna:", error);
      setPenggunaName("—"); setIsVerified(false); setJumlahDonasi(0); setMyPoin(0);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("foto", file);
      const res = await fetch("/api/Pengguna/photoProfile", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const response = await res.json();
      if (res.ok) {
        setPopupSuccess("Foto profile berhasil diupload");
        setProfileImage(`/api/Pengguna/photoProfile?t=${Date.now()}`);
      } else {
        setPopupError(response.message);
      }
    } catch (error) {
      console.log(error); setPopupError("Terjadi kesalahan");
    }
  };

  const handleDeletePhoto = async () => {
    setShowConfirmDelete(false);
    try {
      const res = await fetch("/api/Pengguna/photoProfile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const response = await res.json();
      if (res.ok) {
        setPopupSuccess("Foto berhasil dihapus");
        setProfileImage(`/api/Pengguna/photoProfile?t=${Date.now()}`);
        setIsModalOpen(false);
      } else {
        setPopupError(response.message);
      }
    } catch (error) {
      console.log(error); setPopupError("Terjadi kesalahan");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("foto", selectedFile);
      const res = await fetch("/api/Pengguna/photoProfile", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const response = await res.json();
      if (res.ok) {
        setPopupSuccess("Foto profile berhasil disimpan");
        setProfileImage(`/api/Pengguna/photoProfile?t=${Date.now()}`);
        setIsModalOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setPopupError(response.message);
      }
    } catch (error) {
      console.error(error);
      setPopupError("Terjadi kesalahan saat mengupload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleModalDelete = async () => {
    setShowConfirmDelete(true);
  };

  useEffect(() => {
    getPenggunaName();
    setProfileImage(`/api/Pengguna/photoProfile?t=${Date.now()}`);
  }, []);

  const menus = [
    { key: "/dashboard/profile", label: "Edit Profil", icon: <UserIcon size={15} /> },
    { key: "/dashboard/profile/riwayatDonasi", label: "Riwayat Donasi", icon: <ClockIcon /> },
    { key: "/dashboard/profile/sertifikat", label: "Sertifikat", icon: <AwardIcon /> },
    { key: "/dashboard/profile/keamanan", label: "Pengaturan Keamanan", icon: <LockIcon /> },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 font-[Plus_Jakarta_Sans,sans-serif] text-gray-800">
      {/* Back bar */}
      <div className="flex-shrink-0 px-5 py-2.5 bg-white border-b border-gray-200">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-teal-700 font-semibold text-sm transition hover:opacity-70"
        >
          <ChevronLeftIcon /> Kembali ke Dashboard
        </button>
      </div>

      {/* Main */}
      <div className="flex flex-1 min-h-0 overflow-hidden max-lg:flex-col max-lg:overflow-auto">
        {/* ── SIDEBAR ── */}
        <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex flex-col gap-3 p-4 max-lg:w-full max-lg:overflow-visible">
          {/* Profile card */}
          <div className="text-center">
            <div className="relative w-[180px] h-[180px] mx-auto mb-3 group cursor-pointer" onClick={() => setIsModalOpen(true)}>
              <img
                src={profileImage}
                alt={penggunaName}
                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(penggunaName)}&background=EBF4F1&color=007582&size=180`; }}
                className="w-[180px] h-[180px] rounded-full object-cover border-[4px] border-teal-100 transition-all group-hover:border-teal-600 shadow-sm"
              />
              <div className="absolute bottom-1 right-1 bg-teal-700 text-white rounded-full w-10 h-10 flex items-center justify-center border-[3px] border-white shadow-md transition-all transform group-hover:scale-110">
                <PencilIcon />
              </div>
            </div>

            <div className="text-[.98rem] font-extrabold mt-2 mb-0.5">{penggunaName || "—"}</div>
            <div className="text-[.72rem] text-gray-500 mb-2">Donatur Aktif sejak {memberSinceYear}</div>

            {isVerified ? (
              <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-full px-3 py-1 text-[.67rem] font-bold tracking-wide">
                <ShieldIcon /> AKUN TERVERIFIKASI
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full px-3 py-1 text-[.67rem] font-bold">
                ⏳ MENUNGGU VERIFIKASI
              </div>
            )}
          </div>

          {/* Poin card */}
          <div className="relative bg-gradient-to-br from-teal-700 to-teal-900 rounded-xl p-3.5 text-white overflow-hidden">
            <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/[.07] rounded-full" />
            <div className="absolute -bottom-6 right-2.5 w-[90px] h-[90px] bg-white/[.04] rounded-full" />
            <div className="text-[.65rem] font-bold tracking-[1px] uppercase opacity-70 mb-1">⭐ My Poin</div>
            <div className="text-[1.7rem] font-extrabold leading-none mb-0.5">{myPoin.toLocaleString("id-ID")}</div>
            <div className="text-[.7rem] opacity-65">poin terkumpul</div>
            <div className="flex gap-1.5 mt-2.5 flex-wrap">
              <div className="bg-white/10 border border-white/20 rounded-full px-2 py-0.5 text-[.62rem] font-semibold flex items-center gap-1">
                <GiftIcon /> Donatur Aktif
              </div>
              <div className="bg-white/10 border border-white/20 rounded-full px-2 py-0.5 text-[.62rem] font-semibold flex items-center gap-1">
                🔥 {streak} Hari Beruntun
              </div>
            </div>
          </div>

          {/* Stat */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 flex-shrink-0">
              <DocIcon />
            </div>
            <div>
              <div className="text-[1.05rem] font-extrabold">{jumlahDonasi}</div>
              <div className="text-[.65rem] text-gray-500 font-semibold uppercase tracking-[.5px]">Total Donasi</div>
            </div>
          </div>

          {/* Menu */}
          <div>
            <div className="text-[.65rem] font-bold text-gray-400 tracking-[.8px] uppercase px-1 mb-1">Menu Akun</div>
            {menus.map(m => (
              <Link
                key={m.key}
                href={m.key}
                className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[.82rem] font-medium border-none cursor-pointer transition-all font-[inherit] ${
                  pathname === m.key
                    ? "bg-teal-700 text-white font-bold"
                    : "bg-transparent text-gray-800 hover:bg-teal-50 hover:text-teal-700"
                }`}
              >
                <span className={pathname === m.key ? "text-white" : "text-gray-400"}>{m.icon}</span>
                {m.label}
              </Link>
            ))}
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 flex flex-col gap-3.5 max-lg:overflow-visible">
          {children}
        </div>
      </div>

      {/* Modal Upload Photo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-[350px] p-6 shadow-2xl flex flex-col items-center relative animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-[1.05rem] font-extrabold text-teal-700 mb-4">Ubah Foto Profil</h3>
            
            <div className="w-[180px] h-[180px] rounded-full border-4 border-teal-50 overflow-hidden mb-4 flex-shrink-0 shadow-sm">
              <img 
                src={previewUrl || profileImage} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(penggunaName)}&background=EBF4F1&color=007582&size=180`; }}
              />
            </div>

            <input 
              type="file" accept="image/*" 
              className="hidden" id="modal-photo-upload" 
              onChange={handleFileSelect}
            />
            <label 
              htmlFor="modal-photo-upload" 
              className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-all mb-5 w-full flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {selectedFile ? "Ganti Pilihan Gambar" : "Pilih Gambar Baru"}
            </label>
            
            <div className="flex w-full gap-3 pt-3 border-t border-gray-100">
              <button 
                onClick={handleModalDelete}
                className="flex-1 py-2.5 rounded-lg border border-red-100 text-red-600 font-bold text-xs hover:bg-red-50 transition cursor-pointer"
              >
                Hapus
              </button>
              <button 
                onClick={handleSavePhoto}
                disabled={!selectedFile || isUploading}
                className="flex-1 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isUploading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => { setIsModalOpen(false); setPreviewUrl(null); setSelectedFile(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {popupSuccess && <SuccessPopup message={popupSuccess} onClose={() => setPopupSuccess(null)} />}
      {popupError && <ErrorPopup message={popupError} onClose={() => setPopupError(null)} />}
      {showConfirmDelete && (
        <ConfirmPopup
          message="Apakah Anda yakin ingin menghapus foto profil Anda? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          type="danger"
          onConfirm={handleDeletePhoto}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </div>
  );
}
