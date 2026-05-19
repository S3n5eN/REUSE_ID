"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SuccessPopup from "@/components/SuccessPopup";
import ErrorPopup from "@/components/ErrorPopup";
import ConfirmPopup from "@/components/ConfirmPopup";

// Lazy load map to avoid SSR issues
const LocationPickerMap = dynamic(() => import("@/components/locationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm text-gray-400">
      Memuat peta…
    </div>
  ),
});

interface FormData {
  namaLengkap: string;
  email: string;
  usia: number | "";
  gender: string;
  pekerjaan: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

const DocIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="9" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="15" y2="11" /><line x1="9" y1="15" x2="12" y2="15" />
  </svg>
);
const MapPinIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const COUNTRIES = [
  { code: "+62", iso: "id", name: "Indonesia" },
  { code: "+1", iso: "us", name: "United States" },
  { code: "+60", iso: "my", name: "Malaysia" },
  { code: "+65", iso: "sg", name: "Singapore" },
  { code: "+81", iso: "jp", name: "Japan" },
  { code: "+61", iso: "au", name: "Australia" },
  { code: "+44", iso: "gb", name: "United Kingdom" },
  { code: "+49", iso: "de", name: "Germany" },
  { code: "+33", iso: "fr", name: "France" },
  { code: "+82", iso: "kr", name: "South Korea" },
  { code: "+86", iso: "cn", name: "China" },
  { code: "+91", iso: "in", name: "India" },
  { code: "+966", iso: "sa", name: "Saudi Arabia" },
  { code: "+971", iso: "ae", name: "UAE" },
];

export default function ProfileContent() {
  const [isSaving, setIsSaving] = useState(false);
  const [countryCode, setCountryCode] = useState("+62");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  
  const [popupSuccess, setPopupSuccess] = useState<string | null>(null);
  const [popupError, setPopupError] = useState<string | null>(null);
  const [showConfirmSave, setShowConfirmSave] = useState(false);

  const [form, setForm] = useState<FormData>({
    namaLengkap: "",
    email: "",
    usia: "",
    gender: "Laki-laki",
    pekerjaan: "",
    phone: "",
    address: "",
    latitude: -6.9175,
    longitude: 107.6191,
  });
  const [originalForm, setOriginalForm] = useState<FormData>(form);

  const getProfilData = async () => {
    try {
      const res = await fetch("/api/Pengguna/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const response = await res.json();
      let profileData: any = {};
      if (res.ok && response.hasProfile && response.data) profileData = response.data;

      const fullPhone = profileData.phone ?? "";
      let foundCode = "+62";
      let localPhone = fullPhone;

      const matchedCountry = COUNTRIES
        .slice()
        .sort((a, b) => b.code.length - a.code.length)
        .find(c => fullPhone.startsWith(c.code));

      if (matchedCountry) {
        foundCode = matchedCountry.code;
        localPhone = fullPhone.substring(matchedCountry.code.length);
      } else if (fullPhone.startsWith("0")) {
        foundCode = "+62";
        localPhone = fullPhone.substring(1);
      }

      setCountryCode(foundCode);

      const filled: FormData = {
        namaLengkap: profileData.namaLengkap ?? "",
        email: profileData.email ?? "",
        usia: profileData.usia ?? "",
        gender: profileData.gender ?? "Laki-laki",
        pekerjaan: profileData.pekerjaan ?? "",
        phone: localPhone,
        address: profileData.address ?? "",
        latitude: profileData.latitude ?? -6.9175,
        longitude: profileData.longitude ?? 107.6191,
      };
      setForm(filled);
      setOriginalForm(filled);
    } catch (error) {
      console.error("Error fetching profil:", error);
      setForm({ namaLengkap: "", email: "", usia: "", gender: "Laki-laki", pekerjaan: "", phone: "", address: "", latitude: -6.9175, longitude: 107.6191 });
    }
  };

  const validataForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.namaLengkap.trim()) {
      newErrors.namaLengkap = "Nama lengkap wajib diisi";
    } else {
      const namaRegex = /^[A-Za-z\s]{4,}$/;
      if (!namaRegex.test(form.namaLengkap.trim())) {
        newErrors.namaLengkap = "Nama minimal 4 huruf dan hanya boleh alfabet";
      }
    }

    const usiaNumber = Number(form.usia);
    if (!form.usia) {
      newErrors.usia = "Usia wajib diisi";
    } else if (isNaN(usiaNumber) || usiaNumber < 17) {
      newErrors.usia = "Usia minimal 17 tahun";
    }

    if (!form.phone) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else {
      const phoneRegex = /^[1-9][0-9]{7,15}$/;
      if (!phoneRegex.test(form.phone)) {
        newErrors.phone = "Nomor telepon tidak boleh dimulai dari 0 dan minimal 8 digit";
      }
    }

    if (!form.address.trim()) {
      newErrors.address = "Alamat wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const requestSave = () => {
    if (validataForm()) {
      setShowConfirmSave(true);
    }
  };

  const handleSave = async () => {
    setShowConfirmSave(false);
    setErrors({});
    setIsSaving(true);
    try {
      const res = await fetch("/api/Pengguna/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          ...form,
          phone: `${countryCode}${form.phone}`
        }),
      });
      const response = await res.json();
      if (res.ok && response.success) {
        setOriginalForm(form);
        setPopupSuccess(!response.data?.isVerified ? "Profile berhasil disimpan! Data sedang menunggu verifikasi admin." : "Perubahan berhasil disimpan!");
      } else {
        setPopupError(response.message || "Gagal menyimpan perubahan.");
      }
    } catch (error) {
      console.error("Error saving profil:", error);
      setPopupError("Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => setForm(originalForm);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleLocationSelect = (lat: number, lng: number) =>
    setForm(p => ({ ...p, latitude: lat, longitude: lng }));

  useEffect(() => {
    getProfilData();
  }, []);

  const mapPosition: [number, number] = [form.latitude ?? -6.9175, form.longitude ?? 107.6191];

  const inputCls = "w-full text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 focus:bg-white font-[inherit]";

  return (
    <>
      {/* Form card */}
      <div className="bg-white rounded-xl shadow-sm p-5 md:p-6">
        <div className="flex items-start justify-between mb-3.5">
          <div>
            <h2 className="text-[1.05rem] font-extrabold text-teal-700 mb-0.5">Informasi Pribadi</h2>
            <p className="text-[.76rem] text-gray-500">Perbarui data diri Anda untuk memudahkan proses penjemputan barang.</p>
          </div>
          <span className="text-gray-400"><DocIcon /></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[.76rem] font-semibold">Nama Lengkap</label>
            <input className={`${inputCls} ${errors.namaLengkap ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`} type="text" name="namaLengkap" value={form.namaLengkap} onChange={handleChange} />
            {errors.namaLengkap && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.namaLengkap}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[.76rem] font-semibold">Alamat Email</label>
            <input className="w-full text-sm text-gray-600 bg-gray-200 border border-gray-300 rounded-lg px-3 py-2 outline-none cursor-not-allowed font-[inherit]" type="email" name="email" value={form.email} readOnly disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[.76rem] font-semibold">Usia</label>
            <input className={`${inputCls} ${errors.usia ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`} type="number" min="17" name="usia" value={form.usia} onChange={handleChange} />
            {errors.usia && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.usia}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[.76rem] font-semibold">Jenis Kelamin</label>
            <select className={inputCls} name="gender" value={form.gender} onChange={handleChange}>
              <option>Laki-laki</option>
              <option>Perempuan</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[.76rem] font-semibold">Pekerjaan</label>
            <input className={inputCls} type="text" name="pekerjaan" value={form.pekerjaan} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[.76rem] font-semibold">Nomor Telepon</label>
            <div className="flex gap-1.5">
              {/* Custom Country Dropdown with real SVG flags */}
              <div className="relative">
                <div
                  onClick={() => setShowCountryMenu(!showCountryMenu)}
                  className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-[.83rem] font-bold text-gray-800 cursor-pointer transition hover:border-teal-600 focus-within:border-teal-600 select-none w-[95px] h-[38px]"
                >
                  <div className="flex items-center gap-1.5">
                    <img 
                      src={`https://flagcdn.com/w40/${COUNTRIES.find(c => c.code === countryCode)?.iso || 'id'}.png`}
                      alt="flag"
                      className="w-[18px] h-[12px] object-cover rounded-sm border border-gray-200 flex-shrink-0 shadow-sm"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span>{countryCode}</span>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${showCountryMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {showCountryMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCountryMenu(false)} />
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-1 z-50 max-h-60 overflow-y-auto">
                      {COUNTRIES.map(c => (
                        <div 
                          key={c.code}
                          onClick={() => {
                            setCountryCode(c.code);
                            setShowCountryMenu(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-teal-50 transition-all text-[.83rem] select-none"
                        >
                          <img 
                            src={`https://flagcdn.com/w40/${c.iso}.png`}
                            alt={c.name}
                            className="w-[18px] h-[12px] object-cover rounded-sm border border-gray-100 shadow-sm flex-shrink-0"
                          />
                          <span className="font-bold text-gray-800">{c.code}</span>
                          <span className="text-gray-400 text-[.72rem] truncate font-medium">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <input
                className={`${inputCls} flex-1 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                type="tel"
                name="phone"
                value={form.phone}
                onChange={(e) => {
                  let value = e.target.value;
                  value = value.replace(/\D/g, "");
                  if (value.startsWith("0")) {
                    value = value.substring(1);
                  }
                  setForm((p) => ({ ...p, phone: value }));
                }} />
            </div>
            {errors.phone && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.phone}</p>}
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-[.76rem] font-semibold">Alamat Rumah</label>
            <textarea
              className={`${inputCls} resize-none h-16 leading-relaxed ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
              name="address" value={form.address} onChange={handleChange}
            />
            {errors.address && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.address}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-3.5 pt-3 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="bg-white text-gray-800 border border-gray-300 rounded-lg px-4 py-1.5 text-[.83rem] font-semibold cursor-pointer transition hover:border-teal-700 hover:text-teal-700 font-[inherit]"
          >
            Batalkan
          </button>
          <button
            onClick={requestSave}
            disabled={isSaving}
            className="bg-teal-700 text-white border-none rounded-lg px-6 py-1.5 text-[.83rem] font-bold cursor-pointer transition hover:bg-teal-800 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 font-[inherit]"
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      {/* Map card */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 flex-shrink-0">
            <MapPinIcon size={16} />
          </div>
          <div>
            <h3 className="text-[.92rem] font-extrabold text-teal-700 mb-px">Lokasi Alamat</h3>
            <p className="text-[.73rem] text-gray-500">Klik peta atau geser pin untuk menentukan lokasi rumah Anda</p>
          </div>
        </div>

        <LocationPickerMap
          initialLocation={mapPosition}
          onLocationSelect={handleLocationSelect}
        />

        <div className="flex gap-2 mt-2">
          <div className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-[.7rem] font-semibold text-gray-500 flex items-center gap-1">
            <MapPinIcon size={10} />
            Lat: <span className="text-gray-800">{(form.latitude ?? -6.9175).toFixed(5)}</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-[.7rem] font-semibold text-gray-500 flex items-center gap-1">
            <MapPinIcon size={10} />
            Lng: <span className="text-gray-800">{(form.longitude ?? 107.6191).toFixed(5)}</span>
          </div>
        </div>
      </div>

      {popupSuccess && <SuccessPopup message={popupSuccess} onClose={() => setPopupSuccess(null)} />}
      {popupError && <ErrorPopup message={popupError} onClose={() => setPopupError(null)} />}
      {showConfirmSave && (
        <ConfirmPopup
          message="Apakah Anda yakin ingin menyimpan seluruh perubahan pada profil Anda?"
          confirmText="Ya, Simpan"
          cancelText="Batal"
          type="info"
          onConfirm={handleSave}
          onCancel={() => setShowConfirmSave(false)}
        />
      )}
    </>
  );
}
