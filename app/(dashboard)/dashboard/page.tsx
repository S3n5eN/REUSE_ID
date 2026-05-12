"use client";

import Link from "next/link";
import ProfileDropdown from "@/components/Pengguna/profileDropdown";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/public/Logo/Logo.svg";
import ReuseBot from "@/components/Chatbot/ReuseBot";

type Item = {
  id: number;
  name: string;
  category: string;
  description: string;
  imageURL: string;
  status: string;
  placeId: number;
  place: {
    name: string;
  };
};

type Notifikasi = {
  id: number;
  title: string;
  createdAt: string;
  isRead: boolean;
};

export default function DashboardPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [penggunaName, setPenggunaName] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [fetchingItems, setFetchingItems] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState("");
  const [search, setSearch] = useState("");
  const [beritaList, setBeritaList] = useState<{ id: number; title: string }[]>([]);
  const [beritaIndex, setBeritaIndex] = useState(0);
  const [showBerita, setShowBerita] = useState(false);
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  // STATUS VERIFIKASI USER
  // ubah jadi true kalau user sudah verified
  const [isVerified, setIsVerified] = useState(false);

  const router = useRouter();

  const getPenggunaName = async () => {
    try {
      const res = await fetch("/api/Pengguna");
      const data = await res.json();

      setPenggunaName(data.name);

      // AMBIL STATUS VERIFIED DARI API
      // pastikan backend punya field isVerified
      setIsVerified(data.isVerified ?? false);
    } catch (error) {
      console.error("Error fetching pengguna name:", error);
    }
  };

  const getItems = async () => {
    setFetchingItems(true);

    try {
      const res = await fetch("/api/Barang/getItem");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setFetchingItems(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (res.ok){
       sessionStorage.removeItem("beritaSudahMuncul");
       router.push("/");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleProfile = async () => {

  try {

    const res = await fetch(
      "/api/Pengguna/profile",
      {

        method: "GET",

        headers: {

          Authorization:
            `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    const data = await res.json();

    // ==========================
    // BELUM ISI DATA DIRI
    // ==========================

    if (!data.hasProfile) {

      router.push(
        "/dashboard/form/isiDataDiri"
      );

      return;
    }

    // ==========================
    // BELUM VERIFIED
    // ==========================

    if (
      data.hasProfile &&
      !data.isVerified
    ) {

      alert(
        "Data diri sedang diverifikasi admin"
      );

      return;
    }

    // ==========================
    // VERIFIED
    // ==========================

    router.push(
      "/dashboard/profile"
    );

  } catch (error) {

    console.error(error);

    alert("Terjadi kesalahan");
  }
};

  const filteredItems = items.filter((item) => {
    const matchKategori = selectedKategori
      ? item.category === selectedKategori
      : true;

    const matchSearch = search
      ? item.name.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchStatus = item.status === "Tersedia";

    return matchKategori && matchSearch && matchStatus;
  });

  const getBerita = async () => {
    if(sessionStorage.getItem("beritaSudahMuncul")) {
      console.log("berita sudah muncul, skip");
      return;
    }

  try {
    const res = await fetch("/api/Pengguna/getBerita");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      setBeritaList(data);
      setShowBerita(true);
      sessionStorage.setItem("beritaSudahMuncul","true");
    }
  } catch (err) {
    console.error("Gagal fetch berita:", err);
  }
  };

  const getNotifikasi = async () => {
  try {
    const res = await fetch("/api/Pengguna/getNotifikasi");
    const data = await res.json();
    if (Array.isArray(data)) setNotifikasi(data);
  } catch (err) {
    console.error("Gagal fetch notifikasi:", err);
  }
};

const handleBacaNotif = async (newsId: number) => {
  try {
    await fetch("/api/Pengguna/bacaNotifikasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsId }),
    });
    setNotifikasi((prev) =>
      prev.map((n) => (n.id === newsId ? { ...n, isRead: true } : n))
    );
  } catch (err) {
    console.error("Gagal baca notifikasi:", err);
  }
};

  useEffect(() => {
    getPenggunaName();
    getItems();
    getBerita();
    getNotifikasi();
  }, []);

  return (
    <div className="bg-[#fafafa] min-h-screen" onClick={() => setShowNotif(false)}>
      {/* NAVBAR */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#fafafa] shadow-sm">
        <div className="flex items-center justify-center relative h-10 w-32">
          <Image
            src={Logo}
            alt="Logo ReuseID"
            className="object-contain"
          />
        </div>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700 items-center">
          <a
            href="#"
            className="hover:text-teal-600 transition-colors"
          >
            Cara Donasi
          </a>

          <a
            href="#"
            className="hover:text-teal-600 transition-colors"
          >
            Penyaluran
          </a>

          <a
            href="#"
            className="hover:text-teal-600 transition-colors"
          >
            Tentang Kami
          </a>

          <button className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition-colors">
            <Link href="dashboard/form/tambahBarang">
              Donasi
            </Link>
          </button>
        </nav>

       <div className="flex items-center gap-3">
    {/* Notifikasi */}
<div className="relative">
  <button
    onClick={(e) => {e.stopPropagation(); setShowNotif(!showNotif)}}
    className="relative w-8 h-8 flex items-center justify-center text-gray-600 hover:text-teal-600 transition"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
    {/* Titik kuning — muncul kalau ada yang belum dibaca */}
    {notifikasi.some((n) => !n.isRead) && (
      <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white" />
    )}
  </button>

  {/* Dropdown notifikasi */}
  {showNotif && (
    <div
      className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
      style={{ height: "calc(450px)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">Notifikasi</h3>
      </div>

      <div className="flex-1 overflow-y-auto h-full">
        {notifikasi.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Tidak ada notifikasi</p>
        ) : (
          (notifikasi).map((n) => (
            <div
              key={n.id}
              onClick={() => {
              handleBacaNotif(n.id);
            router.push(`/dashboard/berita/${n.id}`);
            }}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition border-b border-gray-50
                ${!n.isRead ? "bg-yellow-50 hover:bg-yellow-100" : "hover:bg-gray-50"}`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? "bg-yellow-400" : "bg-gray-200"}`} />
              <div className="flex-1 min-w-0">
               <p className={`text-sm truncate ${!n.isRead ? "font-semibold text-gray-800" : "text-gray-600"}`}>
              {n.title}
              </p>
              {n.caption && (
             <p className="text-xs text-gray-400 mt-0.5 truncate">{n.caption}</p>
              )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )}
</div>


  <div className="flex items-center gap-2 border border-gray-300 bg-white px-3 py-1 rounded-full">
    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
    </svg>

    
    
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search here..."
      className="text-sm focus:outline-none bg-transparent w-36"
    />
  </div>
  <div
    onClick={() => setIsOpen(!isOpen)}
    className="w-8 h-8 relative rounded-full object-cover cursor-pointer bg-cyan-300 flex items-center justify-center text-white font-bold"
  >
    {penggunaName.charAt(0)}
    {isOpen && (
      <ProfileDropdown
        namapengguna={penggunaName}
        onLogout={handleLogout}
        onProfile={handleProfile}
      />
    )}
  </div>
</div>
      </div>

      {/* HERO */}
      <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden">
        <div className="grid grid-cols-2 h-full">
          <img
            src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800"
            alt="Donasi"
            className="w-full h-full object-cover"
          />

          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800"
            alt="Komunitas"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/85 to-teal-600/75 flex flex-col items-center justify-center text-white text-center px-10">
          <h1 className="text-4xl md:text-6xl font-bold">
            DONASI
          </h1>

          <h2 className="text-2xl md:text-4xl font-semibold">
            BARANG BEKAS
          </h2>

          <div className="mt-4 inline-block bg-orange-400 text-black px-4 py-2 rounded-full font-semibold">
            BERBAGI UNTUK SESAMA
          </div>

          <p className="mt-4 text-sm md:text-base">
            PAKAIAN • BUKU • MAINAN • PERALATAN
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Rekomendasi Barang:
          </h2>

          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>

            <select
              value={selectedKategori}
              onChange={(e) =>
                setSelectedKategori(e.target.value)
              }
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-400 outline-none bg-white"
            >
              <option value="">Semua Kategori</option>
              <option value="Pakaian">Pakaian</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Perabot">Perabot</option>
              <option value="Mainan">Mainan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        {fetchingItems ? (
          <p className="text-sm text-gray-400">
            Memuat barang...
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="text-sm text-gray-400">
            Belum ada barang tersedia.
          </p>
        ) : (
          <div className="grid grid-cols-6 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex flex-col"
              >
                <div className="w-full aspect-square overflow-hidden rounded-md">
                  <Image
                    src={`/api/Barang/getImage/${item.id}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    width={300}
                    height={300}
                  />
                </div>

                <h3 className="font-semibold mt-2 text-gray-800 text-sm truncate">
                  {item.name}
                </h3>

                <p className="text-xs text-gray-500">
                  {item.category}
                </p>

                <p className="text-xs text-gray-500">
                  {item.status}
                </p>

                <button className="mt-2 w-full bg-teal-600 text-white py-1 rounded-lg text-xs hover:bg-teal-700 transition-colors">
                  Hubungi Pemilik
                </button>

                {/* BUTTON AJUKAN */}
                <div className="mt-2 flex flex-col items-center">
                  {isVerified ? (
                    <Link
                      href={`/dashboard/konfirmasi?itemId=${item.id}&name=${encodeURIComponent(
                        item.name
                      )}&lokasi=${encodeURIComponent(
                        item.placeId
                      )}&img=${encodeURIComponent(
                        `/api/Barang/getImage/${item.id}`
                      )}`}
                      className="bg-green-500 text-white px-5 py-1.5 rounded-lg text-sm hover:bg-green-600 transition-colors"
                    >
                      Ajukan
                    </Link>
                  ) : (
                    <>
                      <button
                        disabled
                        className="bg-gray-400 text-white px-5 py-1.5 rounded-lg text-sm cursor-not-allowed"
                      >
                        Ajukan
                      </button>

                      <p className="text-[10px] text-red-500 mt-1 text-center">
                        Akun belum terverifikasi
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* berita */}
      {/* Popup Berita */}
{showBerita && beritaList.length > 0 && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => {
      if (beritaIndex < beritaList.length - 1) {
        setBeritaIndex(beritaIndex + 1);
      } else {
        setShowBerita(false);
      }
    }}
  >
    <div
      className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Gambar */}
      <div className="relative w-full h-64">
        <img
          src={`/api/Admin/kelolaBerita/${beritaList[beritaIndex].id}`}
          alt={beritaList[beritaIndex].title}
          className="w-full h-full object-contain"
        />
        {/* Counter */}
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {beritaIndex + 1} / {beritaList.length}
        </div>
      </div>

      {/* Konten */}
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{beritaList[beritaIndex].title}</h2>

        <div className="flex gap-3">
          {/* Tombol tutup/skip */}
          <button
            onClick={() => setShowBerita(false)}
            className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition text-sm"
          >
            Tutup
          </button>

          {/* Tombol next atau selesai */}
          {beritaIndex < beritaList.length - 1 ? (
            <button
              onClick={() => setBeritaIndex(beritaIndex + 1)}
              className="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition text-sm font-semibold flex items-center justify-center gap-2"
            >
              Berikutnya
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setShowBerita(false)}
              className="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition text-sm font-semibold"
            >
              Selesai
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}

      {/* CHATBOT */}
      <ReuseBot />
    </div>
  );
}