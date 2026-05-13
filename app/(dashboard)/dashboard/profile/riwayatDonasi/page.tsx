"use client";
import { useEffect, useState } from "react";
const HistoryIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
export default function RiwayatDonasiPage() {
    const [riwayat, setRiwayat] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchRiwayat = async () => {
            try {
                const res = await fetch("/api/Pengguna/riwayatDonasi", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const json = await res.json();
                if (json.success) {
                    setRiwayat(json.data);
                } else {
                    console.error(json.message);
                }
            } catch (error) {
                console.error("Error fetching riwayat:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRiwayat();
    }, []);
    return (
        <div className="flex flex-col gap-4">
            {/* Riwayat Donasi Card */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-[34px] h-[34px] rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                        <HistoryIcon size={17} />
                    </div>
                    <div>
                        <h3 className="text-[.92rem] font-extrabold text-teal-800">Riwayat Donasi</h3>
                        <p className="text-[.73rem] text-gray-500">Daftar barang yang pernah Anda donasikan</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    {loading ? (
                        <div className="text-[.8rem] text-gray-500 text-center py-6 animate-pulse">Memuat riwayat donasi...</div>
                    ) : riwayat.length === 0 ? (
                        <div className="text-[.8rem] text-gray-500 text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            Belum ada riwayat donasi. Ayo mulai donasi pertamamu!
                        </div>
                    ) : (
                        riwayat.map((item, i) => (
                            <div key={item.id || i} className="flex flex-col gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition rounded-xl border border-gray-200">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-[.9rem] font-extrabold text-gray-800">{item.namaBarang}</div>
                                        <div className="text-[.7rem] text-gray-500 flex items-center gap-1.5 mt-0.5">
                                            <span>{new Date(item.tanggalDonasi).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{item.kategori}</span>
                                        </div>
                                    </div>
                                    <div className={`text-[.65rem] font-bold px-2 py-1 rounded-md ${item.statusBarang?.toLowerCase().includes("selesai") || item.statusBarang?.toLowerCase().includes("diterima") || item.statusBarang?.toLowerCase().includes("tersedia")
    ? "bg-teal-100 text-teal-700 border border-teal-200"
    : item.statusBarang?.toLowerCase().includes("diambil")
        ? "bg-gray-100 text-gray-700 border border-gray-200"
        : item.statusBarang?.toLowerCase().includes("tolak")
            ? "bg-red-100 text-red-700 border border-red-200"
            : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                                        {item.statusBarang || "Pending"}
                                    </div>
                                </div>
                                {item.deskripsi && (
                                    <div className="text-[.78rem] text-gray-600 line-clamp-2 leading-relaxed">
                                        {item.deskripsi}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="text-[.68rem] bg-white border border-gray-200 px-2 py-0.5 rounded flex items-center gap-1 text-gray-600 font-semibold shadow-sm">
                                        <span className="opacity-60">📍</span> {item.tempatDonasi}
                                    </div>
                                    <div className="text-[.68rem] bg-white border border-gray-200 px-2 py-0.5 rounded flex items-center gap-1 text-gray-600 font-semibold shadow-sm">
                                        <span className="opacity-60">🏷️</span> {item.kualitas}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}