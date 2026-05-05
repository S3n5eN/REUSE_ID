"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FormDataDiri() {
  const router = useRouter();

  const [form, setForm] = useState({
    namaLengkap: "",
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

  // format +62 jadi 0
  const formatNoHp = (no) => {
    if (no.startsWith("+62")) {
      return "0" + no.slice(3);
    }
    return no;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      dataDiri: {
        namaLengkap: form.namaLengkap,
        usia: Number(form.usia),
        nomorTelpon: formatNoHp(form.noHp),
        alamat: form.alamat,
        gender: form.gender,
        NIK: form.nik,
        pekerjaan: form.pekerjaan,
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
        // langsung ke dashboard
        router.replace("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition";

  return (
    <div className="flex items-center justify-center bg-gray-50 p-10">
      <div className="relative bg-white w-full p-10 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <h2 className="text-center text-sm font-semibold tracking-widest uppercase text-gray-700 mb-8">
          Data Diri Penerima
        </h2>

        <form onSubmit={handleSubmit} className="relative z-10">
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

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              onChange={handleChange}
              className={inputClass}
            />

            {/* NIK */}
            <input
              type="text"
              name="nik"
              placeholder="NIK"
              onChange={handleChange}
              className={inputClass}
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

            {/* Pekerjaan */}
            <input
              type="text"
              name="pekerjaan"
              placeholder="Pekerjaan (opsional)"
              onChange={handleChange}
              className={inputClass}
            />

            {/* Alamat */}
            <div className="col-span-2">
              <input
                type="text"
                name="alamat"
                placeholder="Alamat lengkap"
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Link href="/dashboard">
              <button
                type="button"
                className="px-6 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
              >
                Kembali
              </button>
            </Link>

            <button
              type="submit"
              className="px-8 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            >
              Ambil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}