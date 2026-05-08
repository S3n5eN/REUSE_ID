"use client";
import { useEffect, useState } from "react";

type UserProfile = {
  namaLengkap: string;
  phone: string;
  pekerjaan: string;
  usia: number;
  gender: string;
  address: string;
  identityId?: string | null;
};

type Shipment = {
  id: number;
  status: string;
  type: string;
  claimType?: string;
  deliveredDate?: string;
  shipmentCost?: number | null;
  userProfile?: UserProfile;
  item?: { name: string };
};

export default function KonfirmasiPenerimaPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [blurred, setBlurred] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/Pengguna/getPenerimaApprove")
      .then((res) => res.json())
      .then((data) => {
        console.log("Data shipments:", data);
        const list: Shipment[] = data.data;
        setShipments(list);
        const exp: Record<number, boolean> = {};
        const blr: Record<number, boolean> = {};
        setBlurred(blr);
        list.forEach((s) => {
          (exp[s.id] = false);
          (blr[s.id] = true);
        });
        setExpanded(exp);
      })
      .catch((err) => console.error("Error fetch shipments:", err));
  }, []);

  // ── aksi-reaksi dari kode asli, tidak diubah ──
  const handleConfirm = async (shipmentId: number) => {
    try {
      setLoading(true);
      const res = await fetch("/api/Admin/konfirmasiTerima", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId }),
      });

      const data = await res.json();
      console.log("Response konfirmasi:", data);

      if (!res.ok) {
        alert("Error: " + data.message);
        return;
      }

      alert(`${data.message} | Poin diberikan: ${data.poinDiberikan}`);
      setShipments((prev) => prev.filter((s) => s.id !== shipmentId));
    } catch (err) {
      console.error("Error konfirmasi:", err);
      alert("Terjadi error di frontend");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (shipmentId: number) => {
    try {
      setLoading(true);
      const res = await fetch("/api/rejectShipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId }),
      });

      const data = await res.json();
      console.log("Response tolak:", data);

      if (!res.ok) {
        alert("Error: " + data.message);
        return;
      }

      alert(data.message);
      setShipments((prev) => prev.filter((s) => s.id !== shipmentId));
    } catch (err) {
      console.error("Error tolak:", err);
      alert("Terjadi error di frontend");
    } finally {
      setLoading(false);
    }
  };
  // ── akhir aksi-reaksi ──

  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const filtered = shipments.filter((s) =>
    s.userProfile?.namaLengkap?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-8">
      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="text-xs font-semibold text-teal-600 tracking-widest mb-1">
            REUSEID · ADMIN
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Konfirmasi Penerima</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tinjau lalu konfirmasi identitas pengguna saat pengiriman diproses
          </p>
        </div>
        <div className="flex items-center gap-2 border border-yellow-400 rounded-full px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <span>{shipments.length} menunggu</span>
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
        </div>
      </div>

      <div className="border-t-2 border-teal-500 my-5" />

      {/* ── Search ── */}
      <div className="relative mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Cari nama pengguna..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-24 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
          {filtered.length} hasil
        </span>
      </div>

      {loading && (
        <p className="text-sm text-teal-600 mb-3 flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block" />
          Memproses...
        </p>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <p className="text-center text-gray-400 mt-10 text-sm">
          {search.trim() !== ""
            ? "Pengguna tidak ditemukan."
            : "Belum ada penerima untuk dikonfirmasi"
          }
        </p>
      )}

      {/* ── Cards ── */}
      <div className="space-y-4">
        {filtered.map((s) => {
          const p = s.userProfile;
          const isExpanded = expanded[s.id];

          return (
            <div
              key={s.id}
              className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow duration-200 ${!isExpanded ? "hover:shadow-md cursor-pointer" : ""
                }`}
            >
              {/* Card Header */}
              <div
                className="flex items-center px-5 py-4 cursor-pointer gap-4"
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
                }
              >
                <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {p ? getInitials(p.namaLengkap) : "?"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {p?.namaLengkap ?? "-"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {s.item?.name} · {p?.gender} · {p?.usia} tahun
                  </p>
                </div>
                <span className="text-xs font-medium border rounded-full px-3 py-1 mr-2 text-yellow-700 bg-yellow-50 border-yellow-300">
                  ● Belum terkonfirmasi
                </span>
                {isExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                )}
              </div>

              {/* Card Detail */}
              {isExpanded && (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isExpanded ? "1fr" : "0fr",
                      transition: "grid-template-rows 0.45s ease-out",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <div className="grid grid-cols-2 gap-3 px-5 pt-1">
                        {/* Telepon */}
                        <div className="border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 bg-white">
                          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 tracking-widest">TELEPON</p>
                            <p className="text-sm font-medium text-gray-800">{p?.phone ?? "-"}</p>
                          </div>
                        </div>

                        {/* Pekerjaan */}
                        <div className="border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 bg-white">
                          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 tracking-widest">PEKERJAAN</p>
                            <p className="text-sm font-medium text-gray-800">{p?.pekerjaan ?? "-"}</p>
                          </div>
                        </div>

                        {/* Usia */}
                        <div className="border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 bg-white">
                          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 tracking-widest">USIA</p>
                            <p className="text-sm font-medium text-gray-800">{p?.usia ?? "-"} tahun · {p?.gender ?? "-"}</p>
                          </div>
                        </div>

                        {/* Alamat */}
                        <div className="border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 bg-white">
                          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 tracking-widest">ALAMAT</p>
                            <p className="text-sm font-medium text-gray-800">{p?.address ?? "-"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Baris bawah: NIK + Ongkos Pengiriman sejajar */}
                      <div className="grid grid-cols-2 gap-3 mx-5 mt-3">
                        {/* NIK */}
                        <div className="rounded-lg px-4 py-3 flex items-center gap-3 bg-yellow-50 border border-yellow-200">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-yellow-700 tracking-widest">NOMOR IDENTITAS (NIK)</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p
                                className="text-sm font-medium text-yellow-800 truncate transition-all duration-300"
                                style={{ filter: blurred[s.id] ? "blur(6px)" : "none", userSelect: blurred[s.id] ? "none" : "text" }}
                              >
                                {p?.identityId ?? "-"}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBlurred((prev) => ({ ...prev, [s.id]: !prev[s.id] }));
                                }}
                                className="flex-shrink-0 text-yellow-600 hover:text-yellow-800 transition"
                                aria-label={blurred[s.id] ? "Tampilkan NIK" : "Sembunyikan NIK"}
                              >
                                {blurred[s.id] ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Ongkos Pengiriman */}
                        <div className="rounded-lg px-4 py-3 flex items-center gap-3 bg-yellow-50 border border-yellow-200">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-yellow-700 tracking-widest">ONGKOS PENGIRIMAN</p>
                            <p className="text-sm font-medium text-yellow-800">
                              {s.shipmentCost != null
                                ? `Rp ${s.shipmentCost.toLocaleString("id-ID")}`
                                : "Tidak ada ongkos pengiriman"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center px-5 py-4">
                        <span className="text-xs text-gray-400 flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          Menunggu konfirmasi admin
                        </span>
                        <div className="flex gap-3">
                          <button
                            disabled={loading}
                            onClick={() => handleReject(s.id)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-red-400 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                            Tolak
                          </button>
                          <button
                            disabled={loading}
                            onClick={() => handleConfirm(s.id)}
                            className="flex items-center gap-1.5 px-5 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800 transition disabled:opacity-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Konfirmasi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}