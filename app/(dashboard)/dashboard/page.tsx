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
  caption?: string;
};

export default function DashboardPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [penggunaName, setPenggunaName] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [fetchingItems, setFetchingItems] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState("");
  const [search, setSearch] = useState("");
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
   if (e.key === "Enter" && search.trim()) {
    router.push(`/dashboard/search?q=${encodeURIComponent(search.trim())}`);
    }
  };
  const [beritaList, setBeritaList] = useState<{ id: number; title: string }[]>(
    [],
  );
  const [beritaIndex, setBeritaIndex] = useState(0);
  const [showBerita, setShowBerita] = useState(false);
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  const [isVerified, setIsVerified] = useState(false);

  const router = useRouter();

  const getPenggunaName = async () => {
    try {
      const res = await fetch("/api/Pengguna");
      const data = await res.json();

      setPenggunaName(data.namalengkap || data.name || "");
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

      if (res.ok) {
        sessionStorage.removeItem("beritaSudahMuncul");
        router.push("/");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleProfile = async () => {
    try {
      const res = await fetch("/api/Pengguna/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!data.hasProfile) {
        router.push("/dashboard/form/isiDataDiri");
        return;
      }

      if (data.hasProfile && !data.isVerified) {
        alert("Data diri sedang diverifikasi admin");
        return;
      }

      router.push("/dashboard/profile");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchKategori = selectedKategori
      ? item.category === selectedKategori
      : true;

    const matchSearch = true;   

    const matchStatus = item.status === "Tersedia";

    return matchKategori && matchSearch && matchStatus;
  });

  const getBerita = async () => {
    if (sessionStorage.getItem("beritaSudahMuncul")) {
      console.log("berita sudah muncul, skip");
      return;
    }

    try {
      const res = await fetch("/api/Pengguna/getBerita");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setBeritaList(data);
        setShowBerita(true);
        sessionStorage.setItem("beritaSudahMuncul", "true");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newsId }),
      });

      setNotifikasi((prev) =>
        prev.map((n) => (n.id === newsId ? { ...n, isRead: true } : n)),
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
    <div
      className="bg-[#fafafa] min-h-screen"
      onClick={() => setShowNotif(false)}
    >
      {/* NAVBAR */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#fafafa] shadow-sm">
        <div className="flex items-center justify-center relative h-10 w-32">
          <Image src={Logo} alt="Logo ReuseID" className="object-contain" />
        </div>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700 items-center">
          <a href="#" className="hover:text-teal-600 transition-colors">
            Cara Donasi
          </a>

          <a href="#" className="hover:text-teal-600 transition-colors">
            Penyaluran
          </a>

          <a
            href="#tentang-kami"
            className="hover:text-teal-600 transition-colors"
          >
            Tentang Kami
          </a>

          <button className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition-colors">
            <Link href="dashboard/form/tambahBarang">Donasi</Link>
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {/* SEARCH */}
          <div className="flex items-center gap-2 border border-gray-300 bg-white px-3 py-1 rounded-full">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z"
              />
            </svg>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search here..."
              className="text-sm focus:outline-none bg-transparent w-36"
            />
          </div>

          {/* PROFILE */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-8 h-8 cursor-pointer"
          >
            <img
              src="/api/Pengguna/photoProfile"
              alt={penggunaName}
              onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(penggunaName)}&background=0D8ABC&color=fff`; }}
              className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm hover:ring-2 hover:ring-teal-500 transition-all"
            />

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
          <h1 className="text-4xl md:text-6xl font-bold">DONASI</h1>

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
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
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
          <p className="text-sm text-gray-400">Memuat barang...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-sm text-gray-400">
            Belum ada barang tersedia.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-3xl p-4 shadow-md border border-gray-100"
              >
                <div className="relative rounded-3xl overflow-hidden h-[280px]">
                  <Image
                    src={`/api/Barang/getImage/${item.id}`}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="mt-5">
                  <p className="text-sm text-teal-600 font-semibold">
                    {item.category}
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-400 mt-1">
                    {item.place?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer
        id="tentang-kami"
        className="bg-[#02142b] text-white mt-16"
      >
        <div className="max-w-7xl mx-auto px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={Logo}
                alt="ReuseID"
                width={50}
                height={50}
                className="object-contain"
              />

              <h2 className="text-2xl font-bold text-teal-400">
                ReuseID
              </h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              ReuseID adalah platform donasi barang bekas yang membantu
              masyarakat berbagi barang layak pakai kepada mereka yang
              membutuhkan.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">
              Tentang Kami
            </h3>

            <p className="text-sm text-gray-300 leading-relaxed">
              Kami percaya bahwa barang bekas yang masih layak dapat
              memberikan manfaat baru bagi orang lain.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">
              Kontak
            </h3>

            <div className="space-y-3 text-sm text-gray-300">
              <p>📍 Bandung, Indonesia</p>
              <p>✉️ reuseid@gmail.com</p>
              <p>📞 +62 812-3456-7890</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">
              Social Media
            </h3>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                f
              </div>

              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                ig
              </div>

              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                in
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 px-8 text-center text-sm text-gray-400">
          © 2025 ReuseID. All rights reserved.
        </div>
      </footer>

      {/* CHATBOT */}
      <ReuseBot />
    </div>
  );
}