"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type BeritaDetail = {
  id: number;
  title: string;
  caption: string | null;
  createdAt: string;
};

export default function BeritaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [berita, setBerita] = useState<BeritaDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const res = await fetch("/api/Pengguna/getNotifikasi");
        const data = await res.json();
        const found = data.find((n: BeritaDetail) => n.id === Number(id));
        if (found) setBerita(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBerita();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Memuat...</p>
    </div>
  );

  if (!berita) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Berita tidak ditemukan</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navbar */}
      <div className="sticky top-0 z-50 flex items-center px-6 py-3 bg-[#fafafa] shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
      </div>

      {/* Gambar full width */}
      <div className="w-full bg-gray-100">
        <img
          src={`/api/Admin/kelolaBerita/${berita.id}`}
          alt={berita.title}
          className="w-full max-h-[500px] object-contain mx-auto"
        />
      </div>

      {/* Konten */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{berita.title}</h1>
        <p className="text-sm text-gray-400 mb-6">
          {new Date(berita.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
        {berita.caption && (
          <p className="text-gray-700 leading-relaxed break-words">{berita.caption}</p>
        )}
      </div>
    </div>
  );
}