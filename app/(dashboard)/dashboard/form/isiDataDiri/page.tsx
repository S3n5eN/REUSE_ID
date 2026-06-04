"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AlertPopup from "@/components/AlertPopup";

// Dynamic import biar aman di Next.js
const LocationPickerMap = dynamic(
  () => import("@/components/locationPickerMap"),
  {
    ssr: false,
  },
);

export default function FormDataDiri() {
  const router = useRouter();

  const [form, setForm] = useState({
    namaLengkap: "",
    usia: "",
    gender: "",
    nik: "",
    alamat: "",
    noHp: "",
  });

  // state lokasi map
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // format +62 jadi 0
  const formatNoHp = (no: string) => {
    if (no.startsWith("+62")) {
      return "0" + no.slice(3);
    }
    return no;
  };

  // handle pilih lokasi map
  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi nama lengkap
    if (!form.namaLengkap.trim()) {
      setErrorMsg("Nama lengkap tidak boleh kosong");
      return;
    } else if (!/^[A-Za-z\s]+$/.test(form.namaLengkap)) {
      setErrorMsg("Nama lengkap hanya boleh berisi huruf alfabet");
      return;
    } else if (form.namaLengkap.length < 4) {
      setErrorMsg("Nama lengkap minimal terdiri dari 4 karakter");
      return;
    }

    // Validasi gender
    if (!form.gender) {
      setErrorMsg("Gender wajib dipilih");
      return;
    }

    // Validasi NIK
    if (!form.nik) {
      setErrorMsg("NIK tidak boleh kosong");
      return;
    }
    if (!/^\d{16}$/.test(form.nik)) {
      setErrorMsg("NIK harus terdiri dari 16 digit angka");
      return;
    }

    // Validasi nomor HP
    if (!form.noHp.trim()) {
      setErrorMsg("Nomor HP tidak boleh kosong");
      return;
    }

    // Validasi alamat
    if (!form.alamat.trim()) {
      setErrorMsg("Alamat lengkap tidak boleh kosong");
      return;
    }

    // Validasi usia minimal 17 tahun
    if (!form.usia || Number(form.usia) < 17) {
      setErrorMsg("Usia minimal 17 tahun");
      return;
    }

    // Validasi lokasi
    if (!selectedLocation) {
      setErrorMsg("Lokasi wajib dipilih pada peta");
      return;
    }

    setErrorMsg("");

    const payload = {
      dataDiri: {
        namaLengkap: form.namaLengkap,
        usia: Number(form.usia),
        nomorTelpon: formatNoHp(form.noHp),
        alamat: form.alamat,
        gender: form.gender,
        NIK: form.nik,

        // sesuai API
        latitude: selectedLocation[0],
        longitude: selectedLocation[1],
      },
    };

    try {
      const res = await fetch("/api/Pengguna/isiDataDiri", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setShowPopup(true);
      } else {
        setErrorMsg(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Terjadi kesalahan saat mengirim data");
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-10">
      <div className="relative bg-white w-full max-w-6xl p-10 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Title */}
        <h2 className="text-center text-sm font-semibold tracking-widest uppercase text-gray-700 mb-8">
          Data Diri Penerima
        </h2>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10" noValidate>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {/* Nama Lengkap */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Nama Lengkap
              </label>

              <input
                type="text"
                name="namaLengkap"
                placeholder="Masukkan nama lengkap"
                onChange={handleChange}
                className={inputClass}
                minLength={4}
                pattern="^[A-Za-z\s]+$"
                title="Nama lengkap hanya boleh berisi huruf alfabet dan minimal 4 karakter"
                required
              />
            </div>

            {/* Usia */}
            <input
              type="number"
              name="usia"
              placeholder="Usia"
              onChange={handleChange}
              className={inputClass}
              min="17"
              required
            />

            {/* Gender */}
            <select
              name="gender"
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Pilih Gender</option>
              <option value="Pria">Pria</option>
              <option value="Wanita">Wanita</option>
            </select>

            {/* NIK */}
            <input
              type="text"
              name="nik"
              placeholder="NIK"
              onChange={handleChange}
              className={inputClass}
              maxLength={16}
              minLength={16}
              pattern="\d{16}"
              title="NIK harus terdiri dari 16 digit"
              required
            />

            {/* Nomor HP */}
            <input
              type="text"
              name="noHp"
              placeholder="08xxxxxxxx"
              onChange={handleChange}
              className={inputClass}
              required
            />

            {/* Alamat */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Alamat Lengkap
              </label>

              <textarea
                name="alamat"
                placeholder="Masukkan alamat lengkap"
                onChange={handleChange}
                className={inputClass + " resize-none min-h-[110px]"}
                required
              />
            </div>

            {/* Map Picker */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-3">
                Pilih Lokasi Rumah
              </label>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <LocationPickerMap
                  onLocationSelect={handleLocationSelect}
                  initialLocation={selectedLocation}
                />
              </div>

              {selectedLocation && (
                <p className="text-xs text-teal-600 mt-2">
                  Latitude: {selectedLocation[0].toFixed(6)} | Longitude:{" "}
                  {selectedLocation[1].toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            {/* Button Kembali */}
            <Link href="/dashboard">
              <button
                type="button"
                className="px-6 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
              >
                Kembali
              </button>
            </Link>

            {/* Button Submit */}
            <button
              type="submit"
              className="px-8 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {showPopup && (
        <AlertPopup 
          message="Data diri Anda berhasil dikirim dan sedang diverifikasi oleh admin. Mohon tunggu persetujuan sebelum dapat mengakses fitur penuh."
          onClose={() => router.replace("/dashboard")}
        />
      )}
    </div>
  );
}
