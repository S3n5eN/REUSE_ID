"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PlaceSelectorMap = dynamic(
  () => import("@/components/placeSelector"),
  {
    ssr: false,
  }
);

export default function FormInformasiBarang() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "",
    desc: "",
    placeId: "",
  });

  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);

  const [customCategory, setCustomCategory] = useState("");

  const [lokasiList, setLokasiList] = useState<any[]>([]);

  const [foto, setFoto] = useState<File | null>(null);

  const [preview, setPreview] = useState("");

  const [fileError, setFileError] = useState("");

  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  // FETCH LOKASI
  useEffect(() => {
    const fetchLokasi = async () => {
      try {
        const res = await fetch(
          "/api/LokasiPengumpulan/getPlace"
        );

        const data = await res.json();

        setLokasiList(data);
      } catch (err) {
        console.error(
          "Gagal fetch lokasi:",
          err
        );
      }
    };

    fetchLokasi();
  }, []);

  // HANDLE INPUT
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE SELECT PLACE DARI MAP
  const handleSelectPlace = (
    placeId: number
  ) => {
    setSelectedPlace(placeId);

    setForm({
      ...form,
      placeId: String(placeId),
    });
  };

  // HANDLE FILE
  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    // VALIDASI FORMAT
    if (!allowed.includes(file.type)) {
      setFileError(
        "Format file harus PNG, JPG, atau JPEG"
      );

      setFoto(null);

      setPreview("");

      e.target.value = "";

      return;
    }

    // VALIDASI SIZE
    if (file.size > 2 * 1024 * 1024) {
      setFileError(
        "Ukuran file maksimal 2 MB"
      );

      setFoto(null);

      setPreview("");

      e.target.value = "";

      return;
    }

    // VALID
    setFileError("");

    setFoto(file);

    const imageUrl =
      URL.createObjectURL(file);

    setPreview(imageUrl);
  };

  // HANDLE SUBMIT
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // VALIDASI FOTO
    if (!foto) {
      setErrorMsg(
        "Foto wajib diupload dan harus valid"
      );

      return;
    }

    // VALIDASI LOKASI
    if (!form.placeId) {
      setErrorMsg(
        "Lokasi wajib dipilih"
      );

      return;
    }

    // VALIDASI KATEGORI CUSTOM
    if (
      form.category === "Lainnya" &&
      !customCategory
    ) {
      setErrorMsg(
        "Kategori lainnya wajib diisi"
      );

      return;
    }

    setLoading(true);

    setErrorMsg("");

    try {
      const formData = new FormData();

      formData.append(
        "name",
        form.name
      );

      formData.append(
        "desc",
        form.desc
      );

      // KATEGORI
      formData.append(
        "category",
        form.category === "Lainnya"
          ? customCategory
          : form.category
      );

      formData.append(
        "placeId",
        form.placeId
      );

      formData.append(
        "foto",
        foto
      );

      const res = await fetch(
        "/api/Barang/simpanBarang",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        router.replace("/dashboard");
      } else {
        setErrorMsg(
          data.message ||
            "Terjadi kesalahan."
        );
      }
    } catch (err) {
      setErrorMsg(
        "Gagal terhubung ke server."
      );
    } finally {
      setLoading(false);
    }
  };

  // STYLE
  const inputClass =
    "w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition";

  const labelClass =
    "text-sm font-medium text-gray-700 w-40 shrink-0 pt-2";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-10">
      <div className="bg-white w-full p-10 rounded-2xl shadow-sm border border-gray-100">

        {/* JUDUL */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Informasi Barang
        </h1>

        {/* ERROR */}
        {errorMsg && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg">
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >

          {/* NAMA BARANG */}
          <div className="flex items-start gap-4">
            <label className={labelClass}>
              Nama barang
            </label>

            <span className="pt-2 text-gray-500">
              :
            </span>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {/* KATEGORI */}
          <div className="flex items-start gap-4">
            <label className={labelClass}>
              Kategori
            </label>

            <span className="pt-2 text-gray-500">
              :
            </span>

            <div className="w-full flex flex-col gap-3">

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">
                  Pilih Kategori
                </option>

                <option value="Pakaian">
                  Pakaian
                </option>

                <option value="Elektronik">
                  Elektronik
                </option>

                <option value="Perabot">
                  Perabot
                </option>

                <option value="Mainan">
                  Mainan
                </option>

                <option value="Lainnya">
                  Lainnya
                </option>
              </select>

              {/* INPUT CUSTOM */}
              {form.category ===
                "Lainnya" && (
                <input
                  type="text"
                  placeholder="Masukkan kategori lainnya"
                  value={
                    customCategory
                  }
                  onChange={(e) =>
                    setCustomCategory(
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              )}
            </div>
          </div>

          {/* DESKRIPSI */}
          <div className="flex items-start gap-4">
            <label className={labelClass}>
              Deskripsi
            </label>

            <span className="pt-2 text-gray-500">
              :
            </span>

            <textarea
              name="desc"
              value={form.desc}
              onChange={handleChange}
              rows={4}
              required
              className={
                inputClass +
                " resize-none"
              }
            />
          </div>

          {/* LOKASI */}
          <div className="flex items-start gap-4">
            <label className={labelClass}>
              Lokasi
            </label>

            <span className="pt-2 text-gray-500">
              :
            </span>

            <div className="w-full flex flex-col gap-4">

              {/* DROPDOWN */}
              <select
                name="placeId"
                value={form.placeId}
                onChange={(e) => {
                  handleChange(e);

                  setSelectedPlace(
                    Number(
                      e.target.value
                    )
                  );
                }}
                required
                className={inputClass}
              >
                <option value="">
                  Pilih Lokasi
                </option>

                {lokasiList.map(
                  (lokasi) => (
                    <option
                      key={lokasi.id}
                      value={
                        lokasi.id
                      }
                    >
                      {lokasi.name}
                    </option>
                  )
                )}
              </select>

              {/* MAP */}
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <PlaceSelectorMap
                  places={
                    lokasiList
                  }
                  onSelectPlace={
                    handleSelectPlace
                  }
                />
              </div>

              {/* INFO */}
              {selectedPlace && (
                <div className="text-sm text-teal-600 font-medium">
                  Lokasi
                  terpilih ID:{" "}
                  {
                    selectedPlace
                  }
                </div>
              )}
            </div>
          </div>

          {/* UPLOAD FOTO */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Gambar Produk
            </label>

            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFile}
              className="block text-sm text-gray-500 
              file:mr-3 
              file:py-1.5 
              file:px-4 
              file:rounded-md 
              file:border-0 
              file:bg-teal-500 
              file:text-white 
              hover:file:bg-teal-600 
              cursor-pointer"
            />

            {/* INFO */}
            <p className="text-xs text-gray-500 mt-1">
              Maksimal ukuran file
              2 MB (PNG, JPG,
              JPEG)
            </p>

            {/* ERROR */}
            {fileError && (
              <p className="text-xs text-red-500 mt-1">
                {fileError}
              </p>
            )}

            {/* PREVIEW */}
            {preview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Preview Gambar
                </p>

                <img
                  src={preview}
                  alt="Preview"
                  className="w-52 h-52 object-cover rounded-xl border border-gray-200 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* TOMBOL */}
          <div className="flex justify-between items-center pt-6 mt-4 border-t">

            {/* KEMBALI */}
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard"
                )
              }
              className="px-12 py-3 bg-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-300"
            >
              KEMBALI
            </button>

            {/* SIMPAN */}
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-3 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-600 disabled:opacity-60"
            >
              {loading
                ? "Menyimpan..."
                : "SIMPAN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}