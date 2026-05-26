"use client";

import { useRouter } from "next/navigation";

export default function SuksesPage() {
  const router = useRouter();

  return (
    <div className="bg-[#f5f0e8] min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8 text-center">

        {/* Icon */}
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-teal-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Pengajuan Berhasil!
        </h1>
        <p className="text-gray-500 text-sm mb-2">
          Pengajuan kamu telah berhasil dikirim.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Pemilik barang akan segera menghubungi kamu untuk proses selanjutnya.
        </p>

        {/* Badge status */}
        <div className="inline-block bg-teal-50 text-teal-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
          Status: Menunggu Konfirmasi Pemilik
        </div>

        {/* Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}