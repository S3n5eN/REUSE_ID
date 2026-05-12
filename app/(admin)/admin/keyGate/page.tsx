"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoKeySharp } from "react-icons/io5";

export default function page() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/Admin/keyValidation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyLocation: key }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Key tidak valid");
      }
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen relative w-full overflow-hidden">
      <Image
        src="/KeyvalidBG.webp"
        alt="Background"
        layout="fill"
        objectFit="cover"
        priority
      />
      <div className="absolute inset-0 bg-[#007582]/50 z-10" />

      <div className="relative z-20 flex items-center justify-center h-full px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-5">
          
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-[#007582]/10 rounded-full p-4">
              <IoKeySharp className="text-[#007582] text-3xl" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">Validasi Key Lokasi</h1>
            <p className="text-sm text-gray-500 mt-1">
              Masukkan key lokasi gudang untuk mengakses dashboard. Key dapat diperoleh dari manajer gudang.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Key Lokasi
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Masukkan key lokasi gudang..."
                className="border border-gray-200 bg-gray-50 p-3 rounded-lg text-sm text-black outline-none focus:ring-2 focus:ring-[#007582] focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !key}
              className="bg-[#007582] hover:bg-[#005f6b] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-semibold transition"
            >
              {loading ? "Memvalidasi..." : "Masuk ke Dashboard"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}