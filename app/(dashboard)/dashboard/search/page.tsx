"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Item = {
  id: number;
  name: string;
  category: string;
  description: string;
  status: string;
  placeId: number;
  place: { name: string };
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/Barang/getItem?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const checkVerified = async () => {
    try {
      const res = await fetch("/api/Pengguna/isVerified");
      if (res.ok) {
        const data = await res.json();
        setIsVerified(data.data?.isVerified ?? false);
      }
    } catch (err) {
      console.error(err);
    }
  };
  checkVerified();
    if (q) fetchItems();
    else setLoading(false);
  }, [q]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navbar */}
      <div className="sticky top-0 z-50 flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-100 shadow-sm">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium text-[#0F6E56] hover:text-[#04342C] transition shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        {/* Search bar */}
        <div className="flex-1 flex items-center gap-2 border border-gray-200 bg-[#f5f9f7] px-4 py-2 rounded-full">
          <svg className="w-4 h-4 text-[#1D9E75] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Cari barang..."
            className="flex-1 text-sm focus:outline-none bg-transparent text-gray-700"
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Hasil */}
      <div className="px-6 py-8">
        <p className="text-sm text-gray-500 mb-6">
          {loading ? "Mencari..." : `${items.length} hasil untuk `}
          {!loading && <span className="font-semibold text-[#04342C]">"{q}"</span>}
        </p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1,2,3,4,5].map((n) => (
              <div key={n} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-[#E1F5EE]" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-[#E1F5EE] rounded w-3/4" />
                  <div className="h-3 bg-[#E1F5EE] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E1F5EE] border border-[#9FE1CB] flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <p className="text-[15px] font-bold text-[#085041] mb-1">Barang tidak ditemukan</p>
            <p className="text-sm text-[#0F6E56]">Coba kata kunci yang berbeda</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-[#e8f5ef] hover:shadow-md hover:border-[#5DCAA5] transition-all">
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={`/api/Barang/getImage/${item.id}`}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {item.category}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-[#04342C] text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-[#0F6E56] mt-0.5">{item.place?.name}</p>
                {isVerified ? (
                  <Link
                    href={`/dashboard/konfirmasi?itemId=${item.id}&name=${encodeURIComponent(item.name)}&lokasi=${encodeURIComponent(item.placeId)}&img=${encodeURIComponent(`/api/Barang/getImage/${item.id}`)}`}
                    className="mt-3 block text-center bg-[#1D9E75] text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0F6E56] transition"
                  >
                    Ajukan
                  </Link>
                ) : (
                <div className="mt-3">
                 <button  disabled className="w-full bg-gray-300 text-white py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed">
                  Ajukan
                 </button>
                <p className="text-[10px] text-red-500 mt-1 text-center">Akun belum terverifikasi</p>
                </div>
                )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}