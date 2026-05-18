"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Truck,
  Store,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Navigation,
  Package,
  Landmark,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

const bankAccounts = [
  { code: "BCA", name: "Bank Central Asia", accountNumber: "1234567890", holder: "REUSEID INDONESIA" },
  { code: "BNI", name: "Bank Negara Indonesia", accountNumber: "8800123456", holder: "REUSEID INDONESIA" },
  { code: "BRI", name: "Bank Rakyat Indonesia", accountNumber: "002301234567890", holder: "REUSEID INDONESIA" },
  { code: "MANDIRI", name: "Bank Mandiri", accountNumber: "1410012345678", holder: "REUSEID INDONESIA" },
];

export default function FormPilihPengiriman() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const shipmentId = searchParams.get("shipmentId");
  const itemId = searchParams.get("itemId");

  const [form, setForm] = useState({
    jenisPengiriman: "",
    alamat: "",
    lat: "",
    lng: "",
  });

  const [originCoords, setOriginCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [ongkirData, setOngkirData] = useState<{ distance: number; ongkir: number } | null>(null);
  const [loadingOngkir, setLoadingOngkir] = useState(false);
  const [selectedBank, setSelectedBank] = useState(bankAccounts[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAlamat = await fetch("/api/Pengguna/getAlamatByUserId");
        if (resAlamat.ok) {
          const dataAlamat = await resAlamat.json();
          setForm((prev) => ({
            ...prev,
            alamat: dataAlamat.address || "",
            lat: dataAlamat.lat || "",
            lng: dataAlamat.lng || "",
          }));
        }

        if (itemId) {
          const resItem = await fetch(`/api/Barang/getItemByID?itemId=${itemId}`);
          if (resItem.ok) {
            const dataItem = await resItem.json();
            if (dataItem.place) {
              setOriginCoords({
                lat: Number(dataItem.place.latitude),
                lng: Number(dataItem.place.longitude),
              });
            }
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data awal:", error);
      }
    };
    fetchData();
  }, [itemId]);

  useEffect(() => {
    const fetchOngkir = async () => {
      if (form.lat && form.lng && itemId) {
        setLoadingOngkir(true);
        try {
          const res = await fetch(`/api/Pengguna/kalkulasiOngkir?itemId=${itemId}&lat=${form.lat}&lng=${form.lng}`);
          if (res.ok) {
            const data = await res.json();
            setOngkirData({ distance: data.distance, ongkir: data.ongkir });
          } else {
            setOngkirData(null);
          }
        } catch {
          setOngkirData(null);
        } finally {
          setLoadingOngkir(false);
        }
      }
    };
    fetchOngkir();
  }, [form.lat, form.lng, itemId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentId) {
      setErrorMsg("ID Pengiriman tidak ditemukan. Silakan ulangi dari halaman sebelumnya.");
      return;
    }
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/Pengguna/pilihPengiriman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentId: Number(shipmentId),
          itemId: Number(itemId),
          jenisPengiriman: form.jenisPengiriman,
          alamat: form.jenisPengiriman === "delivery" ? form.alamat : undefined,
          lat: form.jenisPengiriman === "delivery" ? Number(form.lat) : undefined,
          lng: form.jenisPengiriman === "delivery" ? Number(form.lng) : undefined,
          paymentMethod: form.jenisPengiriman === "delivery" ? "ATM" : undefined,
          transferBankCode: form.jenisPengiriman === "delivery" ? selectedBank.code : undefined,
          transferBankName: form.jenisPengiriman === "delivery" ? selectedBank.name : undefined,
          transferAccountNumber: form.jenisPengiriman === "delivery" ? selectedBank.accountNumber : undefined,
          transferAccountHolder: form.jenisPengiriman === "delivery" ? selectedBank.holder : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(
          form.jenisPengiriman === "delivery"
            ? "Invoice pembayaran berhasil dibuat!"
            : "Jenis pengiriman berhasil dipilih!",
        );
        setForm({ jenisPengiriman: "", alamat: "", lat: "", lng: "" });
        setTimeout(() => {
          if (form.jenisPengiriman === "delivery") {
            router.push(`/dashboard/form/uploadBuktiTransfer?shipmentId=${shipmentId}`);
            return;
          }
          router.push("/dashboard");
        }, 1200);
      } else {
        setErrorMsg(data.message || "Terjadi kesalahan pada server.");
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server. Periksa koneksi internetmu.");
    } finally {
      setLoading(false);
    }
  };

  const isDelivery = form.jenisPengiriman === "delivery";
  const isPickup = form.jenisPengiriman === "pickup";
  const hasCoords = originCoords.lat && originCoords.lng && form.lat && form.lng;
  const formattedOngkir = ongkirData
    ? `Rp ${ongkirData.ongkir.toLocaleString("id-ID")}`
    : "Menunggu kalkulasi";

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">

      {/* navbar */}
      <div className="shrink-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center gap-4 z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition text-zinc-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-zinc-900">Pilih Metode Pengiriman</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Tentukan cara kamu menerima barang</p>
        </div>
      </div>

      {/* Container Utama form + map */}
      <div className="flex flex-1 overflow-hidden">

        {/* Form panel */}
        <div className="w-full md:w-[400px] shrink-0 border-r border-zinc-100 overflow-y-auto flex flex-col">
          <div className="flex-1 px-6 py-6 flex flex-col gap-5">

            {/* Status messages */}
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 px-4 py-3 bg-[#007582]/5 border border-[#007582]/20 rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#007582] shrink-0" />
                  <p className="text-sm text-[#007582] font-medium">{successMsg}</p>
                </motion.div>
              )}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">

              {/* Jenis Pengiriman */}
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Metode Penerimaan</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "delivery", label: "Delivery", sub: "Diantar ke alamat", Icon: Truck },
                    { value: "pickup", label: "Pickup", sub: "Ambil di gudang", Icon: Store },
                  ].map(({ value, label, sub, Icon }) => {
                    const active = form.jenisPengiriman === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, jenisPengiriman: value }))}
                        className={`relative flex flex-col items-start gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 text-left
                          ${active
                            ? "border-[#007582] bg-[#007582]/5"
                            : "border-zinc-200 hover:border-zinc-300 bg-white"
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active ? "bg-[#007582] text-white" : "bg-zinc-100 text-zinc-400"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${active ? "text-[#007582]" : "text-zinc-700"}`}>{label}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>
                        </div>
                        {active && (
                          <div className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full bg-[#007582] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Informasi Pickup */}
              <AnimatePresence>
                {isPickup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                      <Package className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-zinc-700">Ambil di Gudang</p>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                          Datang langsung ke gudang sesuai jam operasional. Bawa bukti klaim saat pengambilan.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Alamat */}
              <AnimatePresence>
                {isDelivery && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        Alamat Tujuan
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          name="alamat"
                          placeholder="Masukkan alamat lengkap"
                          value={form.alamat}
                          onChange={handleChange}
                          required={isDelivery}
                          className="w-full pl-10 pr-4 py-3 text-sm border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-[#007582]/20 focus:border-[#007582] transition bg-zinc-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Distance*/}
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Info Jarak</p>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex-1">
                    <div className="w-7 h-7 rounded-lg bg-[#007582]/10 flex items-center justify-center shrink-0">
                      <Navigation className="w-3.5 h-3.5 text-[#007582]" />
                    </div>
                    {loadingOngkir ? (
                      <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                    ) : (
                      <div>
                        <p className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">Jarak</p>
                        <p className="text-sm font-bold text-zinc-900">
                          {ongkirData ? `${ongkirData.distance.toFixed(1)} km` : "—"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Ongkir — hanya kalau delivery */}
                  <AnimatePresence>
                    {isDelivery && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, width: 0 }}
                        animate={{ opacity: 1, scale: 1, width: "auto" }}
                        exit={{ opacity: 0, scale: 0.95, width: 0 }}
                        className="flex items-center gap-2.5 p-3 bg-[#007582]/5 border border-[#007582]/20 rounded-xl overflow-hidden flex-1"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#007582] flex items-center justify-center shrink-0">
                          <span className="text-white text-[9px] font-bold">Rp</span>
                        </div>
                        {loadingOngkir ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#007582] animate-spin" />
                        ) : (
                          <div>
                            <p className="text-[9px] text-[#007582]/60 font-medium uppercase tracking-wider">Ongkir</p>
                            <p className="text-sm font-bold text-[#007582]">
                              {ongkirData ? ongkirData.ongkir.toLocaleString("id-ID") : "—"}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Pembayaran ATM */}
              <AnimatePresence>
                {isDelivery && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl border border-[#007582]/20 bg-[#007582]/[0.04] p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#007582] text-white flex items-center justify-center shrink-0">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900">Pembayaran Transfer ATM</p>
                          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                            Bayar ongkos kirim melalui transfer ATM. Status pembayaran akan menunggu verifikasi setelah pengiriman dikonfirmasi.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {bankAccounts.map((bank) => {
                          const active = selectedBank.code === bank.code;
                          return (
                            <button
                              key={bank.code}
                              type="button"
                              onClick={() => setSelectedBank(bank)}
                              className={`rounded-xl border px-3 py-2.5 text-left transition ${
                                active
                                  ? "border-[#007582] bg-white shadow-sm"
                                  : "border-zinc-200 bg-white/70 hover:border-zinc-300"
                              }`}
                            >
                              <p className={`text-xs font-bold ${active ? "text-[#007582]" : "text-zinc-700"}`}>
                                {bank.code}
                              </p>
                              <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{bank.name}</p>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 rounded-xl bg-white border border-zinc-200 divide-y divide-zinc-100">
                        <div className="flex items-center justify-between gap-3 px-3 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <ReceiptText className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span className="text-xs text-zinc-500">Total transfer</span>
                          </div>
                          <span className="text-sm font-bold text-zinc-900">
                            {loadingOngkir ? "Menghitung..." : formattedOngkir}
                          </span>
                        </div>
                        <div className="px-3 py-3">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Nomor Rekening</p>
                          <p className="text-base font-bold tracking-wide text-zinc-900">{selectedBank.accountNumber}</p>
                          <p className="text-xs text-zinc-500 mt-1">a.n. {selectedBank.holder}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-start gap-2 text-xs text-zinc-500 leading-relaxed">
                        <ShieldCheck className="w-4 h-4 text-[#007582] shrink-0 mt-0.5" />
                        <span>Pastikan nominal transfer sesuai ongkir agar pembayaran mudah diverifikasi.</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1" />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !shipmentId || !form.jenisPengiriman || (isDelivery && (!ongkirData || loadingOngkir))}
                className="w-full py-3.5 bg-[#007582] hover:bg-[#005f6b] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#007582]/20"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                  : isDelivery ? "Konfirmasi & Gunakan Transfer ATM" : "Konfirmasi Pengiriman"
                }
              </button>
            </form>
          </div>
        </div>

        {/*  Map  */}
        <div className="hidden md:flex flex-1 relative bg-zinc-50">
          {hasCoords ? (
            <div className="absolute inset-0 p-2">
              <RouteMap
                originLat={originCoords.lat!}
                originLng={originCoords.lng!}
                destLat={Number(form.lat)}
                destLng={Number(form.lng)}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 w-full">
              <Loader2 className="w-6 h-6 text-zinc-300 animate-spin" />
              <p className="text-sm text-zinc-400">Menyiapkan peta...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
