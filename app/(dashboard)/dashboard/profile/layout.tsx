"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

// ── Icons ────────────────────────────────────────────────────────────────────
const ChevronLeftIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="15 18 9 12 15 6" />
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
        alert("Foto profile berhasil diupload");
        setProfileImage(`/api/Pengguna/photoProfile?t=${Date.now()}`);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.log(error); alert("Terjadi kesalahan");
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm("Yakin ingin menghapus foto profile?")) return;
    try {
      const res = await fetch("/api/Pengguna/photoProfile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const response = await res.json();
      if (res.ok) {
        alert("Foto berhasil dihapus");
        setProfileImage("https://i.pinimg.com/236x/56/2e/be/562ebed9cd49b9a09baa35eddfe86b00.jpg");
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.log(error); alert("Terjadi kesalahan");
    }
  };

  useEffect(() => {
    getPenggunaName();
    setProfileImage(`/api/Pengguna/photoProfile?t=${Date.now()}`);
  }, []);

  const menus = [
    { key: "/dashboard/profile", label: "Edit Profil", icon: <UserIcon size={15} /> },
    { key: "/dashboard/profile/riwayatDonasi", label: "Riwayat Donasi", icon: <ClockIcon /> },
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
            <div className="relative w-[72px] h-[72px] mx-auto mb-2">
              <img
                src={profileImage}
                alt={penggunaName}
                onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/104?img=68"; }}
                className="w-[72px] h-[72px] rounded-full object-cover border-[3px] border-teal-100"
              />
              <div className="absolute bottom-0.5 right-0.5 bg-teal-700 rounded-full w-[18px] h-[18px] flex items-center justify-center border-2 border-white text-white">
                <CheckIcon />
              </div>
            </div>

            <input
              type="file" accept="image/*" ref={fileInputRef}
              className="hidden" onChange={handleUploadPhoto}
            />
            <div className="flex justify-center gap-2 mt-2.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-teal-700 text-white border-none px-3 py-1.5 rounded-lg cursor-pointer font-semibold text-xs transition hover:bg-teal-800"
              >
                Ganti Foto
              </button>
              <button
                onClick={handleDeletePhoto}
                className="bg-red-500 text-white border-none px-3 py-1.5 rounded-lg cursor-pointer font-semibold text-xs transition hover:bg-red-600"
              >
                Hapus
              </button>
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
    </div>
  );
}
