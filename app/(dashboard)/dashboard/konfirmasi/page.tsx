"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function KonfirmasiPage() {
  const params = useSearchParams();
  const router = useRouter();

  const itemId = params.get("itemId"); // ✅ WAJIB ADA
  const name = params.get("name") || "";
  const lokasi = params.get("lokasi") || "";
  const img = params.get("img") || "";

  const handleKonfirmasi = async () => {
    if (!itemId) {
      alert("Item tidak ditemukan (itemId kosong)");
      return;
    }

    try {
      const res = await fetch("/api/Barang/claimBarang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: Number(itemId), 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Tangkap shipmentId dari response backend
        // (Asumsi backend kamu merespons dengan: { message: "...", shipmentId: 123 })
        const newShipmentId = data.shipmentId || data.data?.id; 

        if (!newShipmentId) {
          alert("Gagal mendapatkan ID pengiriman dari server. Pastikan backend mengembalikan shipmentId.");
          return;
        }

        // ✅ Lanjut ke form pengiriman dengan membawa itemId DAN shipmentId di URL
        router.push(`/dashboard/form/pilihPengiriman?itemId=${itemId}&shipmentId=${newShipmentId}`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menghubungi server");
    }
  };

  return (
    <div className="bg-[#f5f0e8] min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-6">

        {/* Header */}
        <h1 className="text-xl font-bold text-gray-800 mb-1">
          Konfirmasi Pengajuan
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Pastikan barang yang kamu ajukan sudah benar.
        </p>

        {/* Foto & Info Barang */}
        <div className="flex gap-4 items-center bg-[#f5f0e8] rounded-xl p-4 mb-6">
          <img
            src={img}
            alt={name}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <div>
            <h2 className="font-semibold text-gray-800">{name}</h2>
            <p className="text-sm text-gray-500">Keadaan: Baik</p>
            <p className="text-sm text-gray-500">Lokasi: {lokasi}</p>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="border border-gray-200 rounded-xl p-4 mb-6 space-y-2">
          <h3 className="font-semibold text-gray-700 mb-3">
            Ringkasan Pengajuan
          </h3>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="text-teal-600 font-medium">
              Menunggu Konfirmasi
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Jenis Pengajuan</span>
            <span className="text-gray-800 font-medium">
              Penerimaan Barang
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Barang</span>
            <span className="text-gray-800 font-medium">{name}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Lokasi Barang</span>
            <span className="text-gray-800 font-medium">{lokasi}</span>
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={handleKonfirmasi}
          className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-colors mb-3"
        >
          Konfirmasi Pengajuan
        </button>

        <button
          onClick={() => router.back()}
          className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}