"use client";

import Link from "next/link";
import ProfileDropdown from "@/components/Pengguna/profileDropdown";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/public/Logo/Logo.svg";
import ReuseBot from "@/components/Chatbot/ReuseBot";
import { MapPin, Mail, Phone } from "lucide-react";
import AlertPopup from "@/components/AlertPopup";

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
  const [dbCategories, setDbCategories] = useState<string[]>([]);
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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const itemsPerPage = 20;

  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

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

  const getKategori = async () => {
    try {
      const res = await fetch("/api/Barang/getKategori");
      const data = await res.json();
      if (Array.isArray(data)) setDbCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
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
        setShowVerificationAlert(true);
        return;
      }

      router.push("/dashboard/profile");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    }
  };

  const uniqueCategories = useMemo(() => {
    const defaultCats = ["Pakaian", "Elektronik", "Perabot", "Mainan"];
    return Array.from(new Set([...defaultCats, ...dbCategories])).sort();
  }, [dbCategories]);

  const filteredItems = items.filter((item) => {
    const matchKategori = selectedKategori
      ? item.category === selectedKategori
      : true;

    const matchSearch = true;

    const matchStatus = item.status === "Tersedia";

    return matchKategori && matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const [hasAlert, setHasAlert] = useState(false);

  const checkAlerts = async () => {
    try {
      const res = await fetch("/api/Barang/getMyBarang?action=Semua");
      const body = await res.json();
      const data = body.data || [];
      
      const needsAttention = data.some((shipment: any) => {
        const isDonation = shipment.type === "donation";
        if (isDonation && shipment.status === "Pending") return true;
        if (!isDonation && shipment.status === "Pending" && !shipment.claimType) return true;
        if (!isDonation && shipment.status === "Approved" && shipment.claimType === "delivery") {
          if (shipment.paymentStatus === "Unpaid" || shipment.paymentStatus === "Failed") return true;
        }
        return false;
      });
      setHasAlert(needsAttention);
    } catch (e) {
      console.error("Gagal cek alert barang:", e);
    }
  };

  useEffect(() => {
    getPenggunaName();
    getItems();
    getKategori();
    getBerita();
    getNotifikasi();
    checkAlerts();
  }, []);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

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
          <a
            href="/dashboard/gudangPenyaluran"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-teal-600 transition-colors"
          >
            Gudang Penyaluran
          </a>

          <a
            href="#tentang-kami"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("tentang-kami")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-teal-600 transition-colors"
          >
            Tentang Kami
          </a>

          <button className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition-colors">
            <Link href="dashboard/form/tambahBarang">Donasi</Link>
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {/* NOTIF */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotif(!showNotif);
              }}
              className="relative w-8 h-8 flex items-center justify-center text-gray-600 hover:text-teal-600 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notifikasi.some((n) => !n.isRead) && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white" />
              )}
            </button>

            {showNotif && (
              <div
                className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                style={{ height: "450px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Notifikasi
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto h-full">
                  {notifikasi.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      Tidak ada notifikasi
                    </p>
                  ) : (
                    notifikasi.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          handleBacaNotif(n.id);
                          router.push(`/dashboard/berita/${n.id}`);
                        }}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition border-b border-gray-50
                        ${!n.isRead
                            ? "bg-yellow-50 hover:bg-yellow-100"
                            : "hover:bg-gray-50"
                          }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? "bg-yellow-400" : "bg-gray-200"
                            }`}
                        />

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm truncate ${!n.isRead
                                ? "font-semibold text-gray-800"
                                : "text-gray-600"
                              }`}
                          >
                            {n.title}
                          </p>

                          {n.caption && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {n.caption}
                            </p>
                          )}

                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(n.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
            {hasAlert && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}

            {isOpen && (
              <ProfileDropdown
                namapengguna={penggunaName}
                onLogout={handleLogout}
                onProfile={handleProfile}
                hasAlert={hasAlert}
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

          <h2 className="text-2xl md:text-4xl font-semibold">BARANG BEKAS</h2>

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
              onChange={(e) => {
                setSelectedKategori(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-400 outline-none bg-white"
            >
              <option value="">Semua Kategori</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {fetchingItems ? (
          <p className="text-sm text-gray-400">Memuat barang...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada barang tersedia.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-gradient-to-b from-white to-[#f0fffb] rounded-[32px] p-4 shadow-[0_10px_30px_rgba(20,184,166,0.08)] hover:shadow-[0_20px_45px_rgba(20,184,166,0.18)] transition-all duration-300 border border-teal-100 flex flex-col"
                >
                  {/* IMAGE */}
                  <div className="relative rounded-[28px] overflow-hidden border border-teal-100 h-[280px]">
                    {/* CATEGORY */}
                    <div className="absolute top-4 left-4 z-10 bg-teal-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-md">
                      {item.category}
                    </div>

                    {/* IMAGE FULL */}
                    <Image
                      src={`/api/Barang/getImage/${item.id}`}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="mt-5 flex flex-col flex-1">
                    <p className="text-sm text-teal-600 font-semibold">
                      {item.category}
                    </p>

                    <h3 className="text-2xl font-bold text-gray-800 mt-1 line-clamp-2 min-h-[64px]">
                      {item.name}
                    </h3>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>

                      <p className="text-sm text-gray-500">{item.status}</p>
                    </div>

                    <p className="text-sm text-gray-400 mt-1">
                      {item.place?.name}
                    </p>

                    {/* AJUKAN */}
                    <div className="mt-6">
                      {isVerified ? (
                        <Link
                          href={`/dashboard/konfirmasi?itemId=${item.id}&name=${encodeURIComponent(
                            item.name,
                          )}&lokasi=${encodeURIComponent(
                            item.placeId,
                          )}&img=${encodeURIComponent(
                            `/api/Barang/getImage/${item.id}`,
                          )}`}
                          className="w-full block text-center bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white py-3 rounded-full font-semibold transition-all duration-300"
                        >
                          Ajukan
                        </Link>
                      ) : (
                        <>
                          <button
                            disabled
                            className="w-full bg-gray-300 text-white py-3 rounded-full font-semibold cursor-not-allowed"
                          >
                            Ajukan
                          </button>

                          <p className="text-[11px] text-red-500 mt-2 text-center">
                            Akun belum terverifikasi
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-4">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  Sebelumnya
                </button>
                <div className="text-sm text-gray-500 font-medium flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <span>Halaman</span>
                  <input
                    type="number"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={() => {
                      let val = parseInt(pageInput);
                      if (isNaN(val) || val < 1) val = 1;
                      if (val > totalPages) val = totalPages;
                      setCurrentPage(val);
                      setPageInput(val.toString());
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-14 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 text-teal-600 font-bold p-1 hide-arrows"
                    min={1}
                    max={totalPages}
                  />
                  <span>dari {totalPages}</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                  }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
            <div className="relative w-full h-96">
              <img
                src={`/api/Admin/kelolaBerita/${beritaList[beritaIndex].id}`}
                alt={beritaList[beritaIndex].title}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {beritaIndex + 1} / {beritaList.length}
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {beritaList[beritaIndex].title}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBerita(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition text-sm"
                >
                  Tutup
                </button>
                {beritaIndex < beritaList.length - 1 ? (
                  <button
                    onClick={() => setBeritaIndex(beritaIndex + 1)}
                    className="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    Berikutnya
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
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

      {/* FOOTER */}
      <footer id="tentang-kami" className="bg-[#02142b] text-white mt-16">
        <div className="max-w-7xl mx-auto px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="mb-4">
              <Image
                src={Logo}
                alt="ReuseID"
                width={250}
                height={250}
                className="object-contain drop-shadow-[0_0_20px_rgba(0,255,204,0.8)]"
              />
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              ReuseID adalah platform donasi barang bekas yang membantu
              masyarakat berbagi barang layak pakai kepada mereka yang
              membutuhkan.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Tentang Kami</h3>

            <p className="text-sm text-gray-300 leading-relaxed">
              Kami percaya bahwa barang bekas yang masih layak dapat memberikan
              manfaat baru bagi orang lain.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Kontak</h3>

            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-teal-400 shrink-0" />
                <span>Bandung, Indonesia</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-teal-400 shrink-0" />
                <span>reuseid@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-teal-400 shrink-0" />
                <span>+62 812-3456-7890</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Social Media</h3>

            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:scale-110 hover:text-white transition-all duration-300 text-gray-300"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:scale-110 hover:text-white transition-all duration-300 text-gray-300"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0A66C2] hover:scale-110 hover:text-white transition-all duration-300 text-gray-300"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 px-8 text-center text-sm text-gray-400">
          © 2025 ReuseID. All rights reserved.
        </div>
      </footer>

      {/* CHATBOT */}
      <ReuseBot />

      {/* POPUP VERIFIKASI */}
      {showVerificationAlert && (
        <AlertPopup 
          message="Data diri Anda sedang diverifikasi oleh admin. Mohon tunggu persetujuan sebelum dapat mengakses profil penuh."
          onClose={() => setShowVerificationAlert(false)}
        />
      )}
    </div>
  );
}
