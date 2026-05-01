"use client";
import Link from "next/link";
import { useState } from "react";

export default function FormDataDiri() {
  const [form, setForm] = useState({
    namaDepan: "",
    namaBelakang: "",
    usia: "",
    email: "",
    gender: "",
    nik: "",
    alamat: "",
    noHp: "",
    pekerjaan: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/Pengguna/isiDataDiri", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Berhasil disimpan");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition";

  return (
    <div className=" flex items-center justify-center bg-gray-50 p-10">
      <div className="relative bg-white w-full p-10 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute w-56 h-56 bg-teal-400 opacity-10 rounded-full -top-16 -right-16 pointer-events-none" />
        <div className="absolute w-36 h-36 bg-teal-400 opacity-10 rounded-full -bottom-10 left-8 pointer-events-none" />

        <h2 className="text-center text-sm font-semibold tracking-widest uppercase text-gray-700 mb-8">
          Data Diri Penerima
        </h2>

        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {/* Nama — full width */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Nama
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  name="namaDepan"
                  placeholder="Nama depan"
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  type="text"
                  name="namaBelakang"
                  placeholder="Nama belakang"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Usia */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Usia
              </label>
              <input
                type="number"
                name="usia"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Gender
              </label>
              <select
                name="gender"
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Pilih</option>
                <option value="MALE">Pria</option>
                <option value="FEMALE">Wanita</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* NIK */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                NIK
              </label>
              <input
                type="text"
                name="nik"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Nomor HP */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Nomor HP
              </label>
              <input
                type="text"
                name="noHp"
                placeholder="+62 xxxx xxxx"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Pekerjaan */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Pekerjaan (opsional)
              </label>
              <input
                type="text"
                name="pekerjaan"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Alamat — full width */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Alamat
              </label>
              <input
                type="text"
                name="alamat"
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              className="px-6 py-2 bg-white rounded-sm text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              <Link href="/dashboard">Kembali</Link>
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-teal-500 text-white rounded-sm text-sm font-medium hover:bg-teal-600 transition"
              onClick={handleSubmit}
            >
              Ambil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
