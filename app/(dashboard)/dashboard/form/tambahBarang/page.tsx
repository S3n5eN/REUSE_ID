"use client";
import { useState, useEffect } from "react";

export default function FormInformasiBarang() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    desc: "",
    placeId: "",
  });
  const [lokasiList, setLokasiList] = useState([]);
  const [foto, setFoto] = useState(null);
  const [fileError, setFileError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch lokasi dari API LokasiPengumpulan
  useEffect(() => {
    const fetchLokasi = async () => {
      try {
        const res = await fetch("/api/LokasiPengumpulan/getPlace", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setLokasiList(data); // sesuaikan dengan struktur response API-nya
      } catch (err) {
        console.error("Gagal fetch lokasi:", err);
      }
    };
    fetchLokasi();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowed = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowed.includes(file.type)) {
        setFileError(true);
        setFoto(null);
      } else {
        setFileError(false);
        setFoto(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("desc", form.desc);
      formData.append("category", form.category);
      formData.append("placeId", form.placeId);
      if (foto) formData.append("foto", foto);

      const res = await fetch("/api/Barang/simpanBarang", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Barang berhasil disimpan!");
        setForm({ name: "", category: "", desc: "", placeId: "" });
        setFoto(null);
      } else {
        setErrorMsg(data.message || "Terjadi kesalahan.");
      }
    } catch (err) {
      setErrorMsg("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition";
  const labelClass = "text-sm font-medium text-gray-700 w-40 shrink-0 pt-2";

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-10">
      <div className="bg-white w-full p-10 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
        Informasi Barang
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">

        {/* Nama Barang */}
        <div className="flex items-start gap-4">
          <label className={labelClass}>Nama barang</label>
          <span className="pt-2 text-gray-500">:</span>
          <input type="text" name="name" placeholder="Nama barang" value={form.name} onChange={handleChange} required className={inputClass} />
        </div>

        {/* Kategori */}
        <div className="flex items-start gap-4">
          <label className={labelClass}>Kategori</label>
          <span className="pt-2 text-gray-500">:</span>
          <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
            <option value="">Pilih Kategori</option>
            <option value="Pakaian">Pakaian</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Perabot">Perabot</option>
            <option value="Mainan">Mainan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        {/* Deskripsi */}
        <div className="flex items-start gap-4">
          <label className={labelClass}>Deskripsi</label>
          <span className="pt-2 text-gray-500">:</span>
          <textarea name="desc" value={form.desc} onChange={handleChange} rows={4} placeholder="Deskripsi barang" required className={inputClass + " resize-none"} />
        </div>

        {/* Lokasi */}
        <div className="flex items-start gap-4">
          <label className={labelClass}>Lokasi</label>
          <span className="pt-2 text-gray-500">:</span>
          <select name="placeId" value={form.placeId} onChange={handleChange} required className={inputClass}>
            <option value="">Pilih Lokasi</option>
            {lokasiList.map((lokasi) => (
              <option key={lokasi.id} value={lokasi.id}>
                {lokasi.name} {/* sesuaikan field nama dari response API */}
              </option>
            ))}
          </select>
        </div>

        {/* Gambar Produk */}
        <div className="pt-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Gambar Produk</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFile}
            className="block text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-teal-500 file:text-white hover:file:bg-teal-600 cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">File yang didukung: .jpg, .jpeg, .png</p>
          {fileError && <p className="text-xs text-red-500 mt-1">*Format file tidak didukung</p>}
        </div>

        {/* Buttons */}
        <div className="flex flex-1 justify-between items-center pt-6 mt-4 border-t border-gray-100">
          <button type="button" className="px-12 py-3 bg-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-300 transition tracking-widest uppercase">
            Kembali
          </button>
          <button type="submit" disabled={loading} className="px-12 py-3 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-600 transition tracking-widest uppercase disabled:opacity-60">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>

      </form>
      </div>
    </div>
  );
}