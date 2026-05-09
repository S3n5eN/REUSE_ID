"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function FormPilihPengiriman() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // ✅ Tangkap variabel dari URL yang dikirim oleh halaman Konfirmasi
  const shipmentId = searchParams.get("shipmentId");
  const itemId = searchParams.get("itemId");

  const [form, setForm] = useState({
    jenisPengiriman: "",
    alamat: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi jika user masuk ke halaman ini tanpa membawa ID yang benar
    if (!shipmentId) {
      setErrorMsg("ID Pengiriman tidak ditemukan. Silakan ulangi proses dari halaman sebelumnya.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/Pengguna/pilihPengiriman", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // ✅ Masukkan shipmentId ke payload yang dikirim ke backend
          shipmentId: Number(shipmentId),
          itemId: Number(itemId), 
          jenisPengiriman: form.jenisPengiriman,
          alamat: form.jenisPengiriman === "delivery" ? form.alamat : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Jenis pengiriman berhasil dipilih!");
        setForm({ jenisPengiriman: "", alamat: "" });
        
        // Opsional: Redirect ke halaman dashboard atau history jika sudah berhasil
        // setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setErrorMsg(data.message || "Terjadi kesalahan pada server.");
      }
    } catch (err) {
      setErrorMsg("Gagal terhubung ke server. Periksa koneksi internetmu.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition";
  const labelClass = "text-sm font-medium text-gray-700 w-40 shrink-0 pt-2";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-10">
      <div className="max-w-2xl w-full">

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Pilih Pengiriman
        </h1>

        {successMsg && (
          <div className="mb-4 px-4 py-3 bg-teal-50 border border-teal-300 text-teal-700 text-sm rounded-lg">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Jenis Pengiriman */}
          <div className="flex items-start gap-4">
            <label className={labelClass}>Jenis Pengiriman</label>
            <span className="pt-2 text-gray-500">:</span>
            <select
              name="jenisPengiriman"
              value={form.jenisPengiriman}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Pilih Jenis Pengiriman</option>
              <option value="delivery">Delivery (Diantar)</option>
              <option value="pickup">Pickup (Diambil)</option>
            </select>
          </div>

          {/* Alamat — hanya muncul jika delivery */}
          {form.jenisPengiriman === "delivery" && (
            <div className="flex items-start gap-4">
              <label className={labelClass}>Alamat Lengkap</label>
              <span className="pt-2 text-gray-500">:</span>
              <input
                type="text"
                name="alamat"
                placeholder="Masukkan alamat lengkap tujuan pengiriman"
                value={form.alamat}
                onChange={handleChange}
                required={form.jenisPengiriman === "delivery"}
                className={inputClass}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-12 py-3 bg-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-300 transition tracking-widest uppercase"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading || !shipmentId}
              className="px-12 py-3 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-600 transition tracking-widest uppercase disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}