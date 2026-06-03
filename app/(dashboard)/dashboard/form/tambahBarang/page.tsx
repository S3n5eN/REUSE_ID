"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import InformationBoxPopup from "@/components/InformationBoxPopup";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  UploadCloud,
  MapPin,
  Warehouse,
  Navigation,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Package,
  Search,
} from "lucide-react";

const WarehouseMap = dynamic(
  () => import("@/components/WarehouseMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-2xl">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    ),
  }
);

interface Place {
  id: number;
  name: string;
  address?: string;
  latitude: number | null;
  longitude: number | null;
}

interface UserProfile {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function FormInformasiBarang() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    desc: "",
  });

  const [customCategory, setCustomCategory] = useState("");

  const [lokasiList, setLokasiList] = useState<Place[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [routeDistance, setRouteDistance] = useState<number | null>(null);

  const [warehouseSearch, setWarehouseSearch] = useState("");

  const filteredWarehouses = lokasiList.filter((place) =>
    warehouseSearch.trim()
      ? place.name.toLowerCase().includes(warehouseSearch.toLowerCase()) ||
      (place.address || "").toLowerCase().includes(warehouseSearch.toLowerCase())
      : true
  );

  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/Pengguna/profile");
        if (res.ok) {
          const data = await res.json();
          // API returns { hasProfile, isVerified, data: { latitude, longitude, address, ... } }
          if (data?.data) {
            setUserProfile({
              name: data.data.namaLengkap || "",
              address: data.data.address || "",
              latitude: data.data.latitude ?? null,
              longitude: data.data.longitude ?? null,
            });
          }
        }
      } catch (err) {
        console.error("Gagal fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Fetch lokasi/gudang
  useEffect(() => {
    const fetchLokasi = async () => {
      try {
        const res = await fetch("/api/LokasiPengumpulan/getPlace");
        const data = await res.json();
        setLokasiList(data);
      } catch (err) {
        console.error("Gagal fetch lokasi:", err);
      }
    };
    fetchLokasi();
  }, []);

  const [dbCategories, setDbCategories] = useState<string[]>([]);
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await fetch("/api/Barang/getKategori");
        const data = await res.json();
        if (Array.isArray(data)) setDbCategories(data);
      } catch (err) {
        console.error("Gagal fetch kategori:", err);
      }
    };
    fetchKategori();
  }, []);

  const uniqueCategories = useMemo(() => {
    const defaultCats = ["Pakaian", "Elektronik", "Perabot", "Mainan"];
    return Array.from(new Set([...defaultCats, ...dbCategories])).sort();
  }, [dbCategories]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
  };

  // File handling
  const validateFile = (file: File): string | null => {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      return "Format file harus PNG, JPG, atau JPEG";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Ukuran file maksimal 5 MB";
    }
    return null;
  };

  const processFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setFoto(null);
      setPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFileError("");
    setFoto(file);
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeFile = () => {
    setFoto(null);
    setPreview("");
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foto) {
      setErrorMsg("Foto wajib diupload dan harus valid");
      return;
    }
    if (!selectedPlace) {
      setErrorMsg("Gudang pengambilan wajib dipilih pada peta");
      return;
    }
    if (form.category === "Lainnya" && !customCategory.trim()) {
      setErrorMsg("Kategori lainnya wajib diisi");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("desc", form.desc);

      let finalCategory =
        form.category === "Lainnya" ? customCategory.trim() : form.category;
      if (finalCategory) {
        finalCategory =
          finalCategory.charAt(0).toUpperCase() +
          finalCategory.slice(1).toLowerCase();
      }
      formData.append("category", finalCategory);

      formData.append("placeId", String(selectedPlace.id));
      formData.append("foto", foto);

      const res = await fetch("/api/Barang/simpanBarang", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setShowInfoPopup(true);
      } else {
        setErrorMsg(data.message || "Terjadi kesalahan.");
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button — Top Left */}
      <div className="px-6 pt-6">
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </motion.button>
      </div>

      <div className="px-6 pb-10 pt-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-teal-600" />
            </div>
            Donasikan Barang
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Lengkapi data barang di bawah ini. Foto yang jelas membantu
            calon penerima memahami kondisi barang dengan lebih baik. Setelah
            dikirim, tim kami akan meninjau dan menghubungkan barangmu dengan
            penerima yang sesuai.
          </p>
        </motion.div>

        {/* Error Banner */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
          {/* LEFT — Form */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6 min-h-0"
          >
            {/* Nama Barang */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Nama Barang
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Contoh: Jas hujan anak ukuran 8-10"
                className={inputClass}
              />
            </div>

            {/* Kategori */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Kategori
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Pilih Kategori</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Lainnya">Lainnya</option>
              </select>
              {form.category === "Lainnya" && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  type="text"
                  placeholder="Ketik kategori lainnya"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>

            {/* Deskripsi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Deskripsi
              </label>
              <textarea
                name="desc"
                value={form.desc}
                onChange={handleChange}
                rows={4}
                required
                placeholder="Jelaskan kondisi, ukuran, merk, atau informasi lain yang relevan"
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Upload Foto */}
            <div className="flex flex-col gap-1.5 flex-1 min-h-0">
              <label className="text-sm font-semibold text-gray-700">
                Foto Barang
              </label>

              <AnimatePresence mode="wait">
                {!preview ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                      relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                      transition-all duration-200
                      ${isDragging
                        ? "border-teal-400 bg-teal-50"
                        : fileError
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50/40"
                      }
                    `}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${isDragging ? "bg-teal-100" : "bg-gray-100"
                        }`}>
                        <UploadCloud className={`w-6 h-6 transition-colors duration-200 ${isDragging ? "text-teal-500" : "text-gray-400"
                          }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {isDragging ? "Lepaskan file di sini" : "Seret & lepas atau klik untuk upload"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, JPEG — maksimal 5 MB
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-gray-200">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay remove button */}
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-150 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                      {/* Success indicator */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-teal-500 rounded-full">
                        <CheckCircle className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">Terupload</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors duration-150 cursor-pointer"
                    >
                      Ganti foto
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File error */}
              <AnimatePresence>
                {fileError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-500 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {fileError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors duration-150 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Donasikan Barang"
                )}
              </button>
            </div>
          </motion.div>

          {/* RIGHT — Map & Warehouse Selection */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:w-[480px] flex flex-col gap-4 min-h-0"
          >
            {/* Map Container */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Pilih Gudang Pengambilan
                  </p>
                  <p className="text-xs text-gray-400">
                    Klik pin gudang pada peta untuk memilih lokasi
                  </p>
                </div>
              </div>
              <div className="h-[340px]">
                <WarehouseMap
                  places={lokasiList}
                  userLocation={
                    userProfile?.latitude && userProfile?.longitude
                      ? {
                        lat: userProfile.latitude,
                        lng: userProfile.longitude,
                        address: userProfile.address || userProfile.name,
                      }
                      : undefined
                  }
                  selectedPlace={selectedPlace}
                  onSelectPlace={handleSelectPlace}
                  onRouteUpdate={setRouteDistance}
                />
              </div>

              {/* Legend */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-teal-500" />
                  <span className="text-xs text-gray-500">Gudang</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-gray-500">Lokasimu</span>
                </div>
                {selectedPlace && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-3 h-3 rounded-full ring-2 ring-teal-400 bg-white" />
                    <span className="text-xs text-teal-600 font-medium">Terpilih</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warehouse List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                  <Warehouse className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    Daftar Gudang
                  </p>
                  <p className="text-xs text-gray-400">
                    {filteredWarehouses.length} dari {lokasiList.length} gudang
                  </p>
                </div>
              </div>

              {/* Search bar */}
              <div className="px-4 pt-3 pb-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari gudang..."
                    value={warehouseSearch}
                    onChange={(e) => setWarehouseSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                {filteredWarehouses.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">
                    {warehouseSearch ? "Gudang tidak ditemukan" : "Tidak ada gudang tersedia"}
                  </div>
                ) : (
                  filteredWarehouses.map((place) => {
                    const isSelected = selectedPlace?.id === place.id;
                    return (
                      <motion.button
                        key={place.id}
                        type="button"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleSelectPlace(place)}
                        className={`
                          w-full px-4 py-3 flex items-start gap-3 text-left transition-all duration-150 cursor-pointer
                          ${isSelected
                            ? "bg-teal-50"
                            : "hover:bg-gray-50"
                          }
                        `}
                      >
                        <div className={`
                          w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-150
                          ${isSelected
                            ? "bg-teal-500 text-white"
                            : "bg-gray-100 text-gray-500"
                          }
                        `}>
                          {isSelected ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Navigation className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate transition-colors duration-150 ${isSelected ? "text-teal-700" : "text-gray-800"
                            }`}>
                            {place.name}
                          </p>
                          {place.address && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                              {place.address}
                            </p>
                          )}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </form>
      </div>
      {showInfoPopup && (
        <InformationBoxPopup
          message="Terimakasih Telah Berdonasi"
          onClose={() => {
            setShowInfoPopup(false);
            router.replace("/dashboard");
          }} />
      )}
    </div>
  );
}
