"use client";
import { useEffect, useState } from "react";

type ItemDetail = {
  name: string;
  category: string;
  weight: number | null;
  imageBase64: string | null;
  imageType: string | null;
  rakNomor: string | null;
};

type Props = {
  itemId: number;
  claimType?: string;
  onClose: () => void;
};

export default function ItemDetailModal({ itemId, claimType, onClose }: Props) {
  const [detail, setDetail] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/Barang/getItemDetail?id=${itemId}`)
      .then((res) => res.json())
      .then((json) => setDetail(json.data))
      .catch((err) => console.error("Error fetch item detail:", err))
      .finally(() => setLoading(false));
  }, [itemId]);

  const claimTypeLabel =
    claimType === "pickup" ? "Ambil Sendiri (Pickup)" :
    claimType === "delivery" ? "Diantar (Delivery)" :
    claimType ?? "-";

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      {/* Modal box — stopPropagation agar klik dalam modal tidak menutup */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Detail Barang & Pengiriman</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Tutup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Isi modal */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
            <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block" />
            Memuat data...
          </div>
        ) : !detail ? (
          <div className="py-12 text-center text-gray-400 text-sm">Data tidak ditemukan.</div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {/* Gambar barang */}
            <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              {detail.imageBase64 && detail.imageType ? (
                <img
                  src={`data:${detail.imageType};base64,${detail.imageBase64}`}
                  alt={detail.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">Tidak ada gambar</span>
              )}
            </div>

            {/* Info barang */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Nama Barang", value: detail.name },
                { label: "Kategori", value: detail.category },
                { label: "Berat", value: detail.weight != null ? `${detail.weight} kg` : "-" },
                { label: "Rak", value: detail.rakNomor ?? "-" },
                { label: "Tipe Pengiriman", value: claimTypeLabel },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-[10px] font-semibold text-gray-400 tracking-widest">{label.toUpperCase()}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}