"use client";

import { useEffect, useState, useRef } from "react";
import { Download, Award, Lock } from "lucide-react";
import { toPng } from "html-to-image";
import CertificateCard from "@/components/Sertifikat/CertificateCard";

export default function SertifikatPage() {
  const [loading, setLoading] = useState(true);
  const [poin, setPoin] = useState(0);
  const [name, setName] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certNo, setCertNo] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const targetPoin = 1000;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/Pengguna", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (res.ok) {
          setPoin(data.poin || 0);
          setName(data.namalengkap || data.name || "Pahlawan Hijau");

          const date = new Date(data.createdAt || Date.now());
          const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
          setCertDate(`Jakarta, ${date.toLocaleDateString("id-ID", options)}`);

          const userId = data.id || 1;
          const paddedId = String(userId).padStart(3, "0");
          const stableHash = btoa(`${userId}-${data.name || "user"}`)
            .replace(/[^a-zA-Z0-9]/g, "")
            .toUpperCase()
            .substring(0, 10);
          setCertNo(`REUSEID/${date.getFullYear()}/${paddedId}-${stableHash}`);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f8f9f4",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Sertifikat_${name.replace(/\s+/g, "_")}.png`;
      link.click();
    } catch (err) {
      console.error("Gagal mendownload sertifikat", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  const isUnlocked = poin >= targetPoin;
  const progress = Math.min((poin / targetPoin) * 100, 100);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[1.2rem] font-extrabold text-teal-700 mb-1">Sertifikat Penghargaan</h2>
          <p className="text-[.85rem] text-gray-500">
            Dapatkan sertifikat eksklusif dengan mengumpulkan poin dari donasi Anda.
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
          <Award size={22} />
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8 bg-gray-50 rounded-xl p-5 border border-gray-100">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-sm font-semibold text-gray-600">Progress Poin</span>
            <div className="text-2xl font-bold text-teal-700 mt-1">
              {poin}{" "}
              <span className="text-sm font-medium text-gray-500">/ {targetPoin} pts</span>
            </div>
          </div>
          {isUnlocked ? (
            <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <Award size={16} /> Terbuka
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
              <Lock size={16} /> Terkunci
            </div>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div
            className="bg-teal-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {!isUnlocked && (
          <p className="text-xs text-gray-500 mt-3 font-medium">
            Kumpulkan {targetPoin - poin} poin lagi untuk mendapatkan sertifikat ini!
          </p>
        )}
      </div>

      {isUnlocked ? (
        <div className="flex flex-col items-center gap-6">
          {/* Certificate preview - scroll horizontally on small screens */}
          <div className="w-full overflow-x-auto">
            <div className="flex justify-center min-w-max mx-auto">
              <div className="shadow-xl rounded-sm border border-gray-200">
                <CertificateCard ref={certRef} name={name} certDate={certDate} certNo={certNo} />
              </div>
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-800 active:scale-95 transition-all shadow-sm font-[inherit] border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            {isDownloading ? "Menyiapkan..." : "Unduh Sertifikat"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Lock size={32} />
          </div>
          <h4 className="text-lg font-bold text-gray-700 mb-2">Sertifikat Belum Terbuka</h4>
          <p className="text-sm text-gray-500 max-w-md">
            Anda harus mencapai minimum {targetPoin} poin untuk mendapatkan sertifikat penghargaan ini. Terus lakukan donasi untuk mengumpulkan poin!
          </p>
        </div>
      )}
    </div>
  );
}
