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
  <div className="min-h-screen bg-[#f5f9f7]">
    {/* Navbar */}
    <div className="sticky top-0 z-50 flex items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-[#e8f5ef]">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-[#0F6E56] hover:text-[#04342C] transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </button>
      <span className="mx-auto text-sm font-semibold text-[#04342C] tracking-wide">Berita ReuseID</span>
    </div>

    {/* Hero Gambar */}
    <div className="w-full bg-[#E1F5EE] flex items-center justify-center" style={{ minHeight: "400px" }}>
      <img
        src={`/api/Admin/kelolaBerita/${berita.id}`}
        alt={berita.title}
        className="w-full max-h-[500px] object-contain"
      />
    </div>

    {/* Konten */}
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Badge tanggal */}
      <div className="inline-flex items-center gap-1.5 bg-[#E1F5EE] text-[#0F6E56] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#9FE1CB] mb-4">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {new Date(berita.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
      </div>

      {/* Judul */}
      <h1 className="text-3xl font-bold text-[#04342C] leading-tight mb-6">{berita.title}</h1>

      {/* Divider */}
      <div className="w-12 h-1 bg-gradient-to-r from-[#1D9E75] to-[#5DCAA5] rounded-full mb-6" />

      {/* Caption */}
      {berita.caption ? (
        <p className="text-[#2d5a4a] leading-relaxed text-base break-words">{berita.caption}</p>
      ) : (
        <p className="text-gray-400 italic text-sm">Tidak ada keterangan tambahan.</p>
      )}

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-[#E1F5EE]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-[#1D9E75] hover:text-[#04342C] transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  </div>
);
}