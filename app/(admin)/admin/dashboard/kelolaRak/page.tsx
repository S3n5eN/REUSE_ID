"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  X,
  Loader2,
  Search,
  Check,
  ChevronRight,
  Package,
  MoveRight,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import SuccessPopup from "@/components/SuccessPopup";
import ErrorPopup from "@/components/ErrorPopup";
import ConfirmPopup from "@/components/ConfirmPopup";

interface Item {
  id: number;
  name: string;
  category: string;
  description: string;
  status: string;
  weight?: number;
}

interface Rak {
  id: number;
  nomor: string;
  kapasitasMax: number;
  kapasitasSekarang: number;
  item: Item[];
}

export default function KelolaRakPage() {
  const [shelves, setShelves] = useState<Rak[]>([]);
  const [placeInfo, setPlaceInfo] = useState<{
    name: string;
    address: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRak, setActiveRak] = useState<Rak | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newRaks, setNewRaks] = useState<
    { nomorRak: string; kapasitasMax: number | "" }[]
  >([{ nomorRak: "", kapasitasMax: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tooltip, setTooltip] = useState<{
    rak: Rak;
    x: number;
    y: number;
  } | null>(null);

  // Pindah Barang States
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedItemsToMove, setSelectedItemsToMove] = useState<number[]>([]);
  const [targetRakId, setTargetRakId] = useState<number | "">("");
  const [isMoving, setIsMoving] = useState(false);

  // Edit Rak States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNomorRak, setEditNomorRak] = useState("");
  const [editKapasitasMax, setEditKapasitasMax] = useState<number | "">("");
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const [successPopupMsg, setSuccessPopupMsg] = useState<string | null>(null);
  const [errorPopupMsg, setErrorPopupMsg] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<{
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
  } | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);

  const fetchShelves = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/Admin/kelolaRak");
      const data = await response.json();
      if (response.ok) {
        setShelves(data.data || []);
        if (data.place) setPlaceInfo(data.place);
      }
    } catch {
      setErrorPopupMsg("Gagal mengambil data rak");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShelves();
  }, []);

  const toggleSelect = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/Admin/kelolaRak?ids=${selectedIds.join(",")}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (res.ok) {
        setShelves((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
        setSelectedIds([]);
        if (activeRak && selectedIds.includes(activeRak.id)) setActiveRak(null);
        setSuccessPopupMsg("Rak berhasil dihapus");
      } else {
        setErrorPopupMsg(
          data.message || "Gagal menghapus rak karena sebagian masih terisi.",
        );
      }
    } catch {
      setErrorPopupMsg("Terjadi kesalahan saat menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    if (!selectedIds.length) return;
    setConfirmData({
      message: "Hapus rak terpilih? Pastikan rak dalam keadaan kosong.",
      type: "danger",
      onConfirm: executeDelete,
    });
  };

  const handleAddSubmit = async () => {
    const validRaks = newRaks.filter(
      (r) =>
        r.nomorRak.trim() !== "" &&
        typeof r.kapasitasMax === "number" &&
        r.kapasitasMax > 0,
    );
    if (!validRaks.length) {
      setErrorPopupMsg("Mohon isi nomor dan kapasitas dengan benar");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/Admin/kelolaRak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arrRak: validRaks }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewRaks([{ nomorRak: "", kapasitasMax: "" }]);
        fetchShelves();
        setSuccessPopupMsg("Rak berhasil ditambahkan");
      } else {
        const d = await res.json();
        setErrorPopupMsg(d.message || "Gagal menambahkan rak");
      }
    } catch {
      setErrorPopupMsg("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeMove = async (targetId: number, itemIds: number[]) => {
    if (!activeRak) return;
    setIsMoving(true);
    try {
      const res = await fetch(`/api/Admin/kelolaRak/${activeRak.id}/pindah`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rakTujuanId: targetId,
          itemIds: itemIds
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsMoveModalOpen(false);
        setActiveRak(null);
        fetchShelves();
        setSuccessPopupMsg("Barang berhasil dipindahkan");
      } else {
        setErrorPopupMsg(data.message || "Gagal memindahkan barang");
      }
    } catch {
      setErrorPopupMsg("Terjadi kesalahan saat memindahkan barang");
    } finally {
      setIsMoving(false);
    }
  };

  const handleMoveSubmit = () => {
    if (!activeRak) return;
    if (selectedItemsToMove.length === 0) {
      setErrorPopupMsg("Pilih setidaknya satu barang untuk dipindahkan");
      return;
    }
    if (targetRakId === "") {
      setErrorPopupMsg("Pilih rak tujuan");
      return;
    }

    const targetShelvesNum = shelves.find((s) => s.id === targetRakId)?.nomor || "";

    setConfirmData({
      message: `Apakah Anda yakin ingin memindahkan ${selectedItemsToMove.length} barang ke Rak ${targetShelvesNum}?`,
      type: "warning",
      onConfirm: () => executeMove(Number(targetRakId), selectedItemsToMove),
    });
  };

  const handleOpenEditModal = () => {
    if (!activeRak) return;
    setEditNomorRak(activeRak.nomor);
    setEditKapasitasMax(activeRak.kapasitasMax);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!activeRak) return;
    if (editNomorRak.trim() === "" || typeof editKapasitasMax !== "number" || editKapasitasMax <= 0) {
      setErrorPopupMsg("Mohon isi nomor dan kapasitas dengan benar");
      return;
    }
    
    // Validasi format nomor rak dan kapasitas seperti TambahRak
    if (editNomorRak.length < 2 || editNomorRak.length > 10) {
      setErrorPopupMsg("Nomor rak harus 2-10 karakter");
      return;
    }
    if (!editNomorRak.match(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/)) {
      setErrorPopupMsg("Nomor rak wajib mengandung kombinasi huruf dan angka tanpa spasi/simbol");
      return;
    }
    if (editKapasitasMax < 10 || editKapasitasMax > 100) {
      setErrorPopupMsg("Kapasitas minimal 10 dan maksimal 100");
      return;
    }
    if (editKapasitasMax < activeRak.kapasitasSekarang) {
      setErrorPopupMsg(`Kapasitas tidak boleh kurang dari jumlah item yang ada saat ini (${activeRak.kapasitasSekarang} item)`);
      return;
    }

    setIsEditSubmitting(true);
    try {
      const res = await fetch(`/api/Admin/kelolaRak/${activeRak.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorRak: editNomorRak,
          maxKapasitas: editKapasitasMax,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditModalOpen(false);
        setActiveRak(null);
        fetchShelves();
        setSuccessPopupMsg("Rak berhasil diperbarui");
      } else {
        setErrorPopupMsg(data.message || "Gagal memperbarui rak");
      }
    } catch {
      setErrorPopupMsg("Terjadi kesalahan saat memperbarui rak");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const filteredShelves = shelves.filter((s) =>
    s.nomor.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Fill percentage => color on map
  const getFillColor = (rak: Rak) => {
    const pct = rak.kapasitasSekarang / rak.kapasitasMax;
    if (pct === 0)
      return {
        bg: "#F0FDF4",
        border: "#86EFAC",
        text: "#166534",
        label: "Kosong",
      };
    if (pct < 0.5)
      return {
        bg: "#F0FDF4",
        border: "#4ADE80",
        text: "#166534",
        label: "Tersedia",
      };
    if (pct < 0.85)
      return {
        bg: "#FFFBEB",
        border: "#FCD34D",
        text: "#92400E",
        label: "Hampir Penuh",
      };
    return {
      bg: "#FEF2F2",
      border: "#FCA5A5",
      text: "#991B1B",
      label: "Penuh",
    };
  };

  // Compute cell size based on kapasitasMax for visual weight
  const getCellSize = (max: number) => {
    if (max >= 50) return { w: 120, h: 90 };
    if (max >= 30) return { w: 100, h: 80 };
    if (max >= 20) return { w: 88, h: 72 };
    return { w: 76, h: 64 };
  };

  // Arrange racks into rows of ~6 per row for map grid
  const COLS = 5;
  const rows: Rak[][] = [];
  for (let i = 0; i < filteredShelves.length; i += COLS) {
    rows.push(filteredShelves.slice(i, i + COLS));
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm">
        <div className="px-8 py-5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#007582] to-[#005f6b] shadow-md shadow-[#007582]/20 flex items-center justify-center shrink-0">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                  {placeInfo ? placeInfo.name : "Memuat Gudang..."}
                </h1>
                <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md font-bold uppercase tracking-widest border border-zinc-200">
                  {shelves.length} Rak
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-zinc-500 mt-1.5 font-medium">
                {placeInfo ? (
                  <>
                    <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-md bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100 text-zinc-600">
                      {placeInfo.address}
                    </span>
                  </>
                ) : (
                  <span className="animate-pulse bg-zinc-100 h-5 w-48 rounded"></span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {/* Search */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nomor rak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-sm border-2 border-zinc-100 rounded-xl outline-none focus:border-[#007582] transition w-full sm:w-56 bg-zinc-50 focus:bg-white"
              />
            </div>

            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 border border-red-200 px-4 py-2.5 rounded-xl transition text-sm font-bold shadow-sm"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Hapus ({selectedIds.length})
                </motion.button>
              )}
            </AnimatePresence>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#007582] to-[#005f6b] hover:from-[#005f6b] hover:to-[#004a54] text-white px-5 py-2.5 rounded-xl transition text-sm font-bold shadow-md shadow-[#007582]/20"
            >
              <Plus className="w-4 h-4" /> Tambah Rak
            </button>
          </div>
        </div>

        {/* Legend Bar */}
        <div className="px-8 py-2.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium overflow-x-auto">
          <div className="flex items-center gap-6 shrink-0">
            <span className="uppercase tracking-widest text-[10px] text-zinc-400 font-bold mr-2">
              Indikator Kapasitas:
            </span>
            {[
              { color: "#86EFAC", label: "Kosong", bg: "#F0FDF4" },
              { color: "#4ADE80", label: "Tersedia", bg: "#F0FDF4" },
              { color: "#FCD34D", label: "Hampir Penuh", bg: "#FFFBEB" },
              { color: "#FCA5A5", label: "Penuh", bg: "#FEF2F2" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded shadow-sm border-2"
                  style={{ backgroundColor: l.bg, borderColor: l.color }}
                />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold shrink-0">
            <span>* Klik kontainer rak untuk membuka panel detail isi rak</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Map Area */}
        <div
          ref={mapRef}
          className="flex-1 overflow-auto relative"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-[#007582] animate-spin mb-3" />
              <p className="text-sm text-zinc-400">Memuat denah gudang...</p>
            </div>
          ) : filteredShelves.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-16 h-16 border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center">
                <Package className="w-7 h-7 text-zinc-300" />
              </div>
              <p className="text-sm text-zinc-400 font-medium">
                Belum ada rak di gudang ini
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs text-[#007582] hover:underline"
              >
                Tambah rak sekarang →
              </button>
            </div>
          ) : (
            <div className="p-6 md:p-8 min-h-full w-full">
              <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[160px] grid-flow-dense w-full">
                {filteredShelves.map((rak, index) => {
                  const color = getFillColor(rak);
                  const isSelected = selectedIds.includes(rak.id);
                  const isActive = activeRak?.id === rak.id;
                  const pct = Math.round(
                    (rak.kapasitasSekarang / rak.kapasitasMax) * 100,
                  );

                  // Bento sizing: packed dense grid
                  let spanClass = "col-span-1 row-span-1";
                  if (rak.kapasitasMax >= 50) {
                    spanClass = "col-span-2 row-span-2"; // Paling besar
                  } else if (rak.kapasitasMax >= 25) {
                    spanClass = "col-span-2 row-span-1"; // Lebar ke samping
                  } else if (rak.kapasitasMax >= 15 && index % 2 === 0) {
                    spanClass = "col-span-1 row-span-2"; // Tinggi ke bawah (variasi)
                  }

                  // Determine layout sizes based on span to adjust font and padding
                  const isLarge =
                    spanClass.includes("col-span-2") &&
                    spanClass.includes("row-span-2");
                  const isWide = spanClass.includes("col-span-2");
                  const isTall = spanClass.includes("row-span-2");

                  return (
                    <motion.div
                      key={rak.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveRak(isActive ? null : rak)}
                      style={{
                        backgroundColor: color.bg,
                        borderColor: isActive
                          ? "#007582"
                          : isSelected
                            ? "#374151"
                            : color.border,
                      }}
                      className={`relative cursor-pointer border-2 rounded flex flex-col justify-between transition-all duration-300 select-none shadow-sm hover:shadow-md overflow-hidden
                        ${spanClass}
                        ${isLarge || isTall ? "p-6" : "p-4"}
                        ${isActive ? "ring-2 ring-[#007582] ring-offset-2 shadow-lg shadow-[#007582]/10 z-10" : ""}
                        ${activeRak && !isActive ? "opacity-40 grayscale-[0.4]" : "opacity-100"}
                      `}
                    >
                      {/* Shelf lines - visual detail */}
                      <div
                        className={`absolute inset-x-4 h-px opacity-20 ${isTall ? "bottom-16" : "bottom-10"}`}
                        style={{ backgroundColor: color.border }}
                      />
                      <div
                        className={`absolute inset-x-4 h-px opacity-10 ${isTall ? "bottom-24" : "bottom-14"}`}
                        style={{ backgroundColor: color.border }}
                      />

                      {/* Top row: label + checkbox */}
                      <div className="flex justify-between items-start z-10 relative">
                        <div>
                          <span
                            className={`font-bold tracking-widest rounded-md mb-2 inline-block uppercase ${isLarge ? "text-[10px] px-2 py-1" : "text-[9px] px-1.5 py-0.5"}`}
                            style={{
                              backgroundColor: "rgba(255,255,255,0.6)",
                              color: color.text,
                              border: `1px solid ${color.border}`,
                            }}
                          >
                            {color.label}
                          </span>
                          <h3
                            className={`font-black mt-1 leading-none ${isLarge ? "text-3xl" : "text-xl"}`}
                            style={{ color: color.text }}
                          >
                            Rak {rak.nomor}
                          </h3>
                        </div>
                        <div
                          onClick={(e) => toggleSelect(e, rak.id)}
                          className={`rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${isLarge ? "w-7 h-7" : "w-5 h-5"}
                            ${isSelected ? "bg-zinc-800 border-zinc-800" : "border-zinc-300 hover:border-zinc-500 bg-white"}`}
                        >
                          {isSelected && (
                            <Check
                              className={`${isLarge ? "w-4 h-4" : "w-3 h-3"} text-white`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Bottom: fill bar */}
                      <div className="z-10 relative mt-auto pt-4">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex flex-col">
                            <span
                              className={`font-medium mb-0.5 ${isLarge ? "text-xs" : "text-[10px]"}`}
                              style={{ color: color.text }}
                            >
                              Kapasitas
                            </span>
                            <span
                              className={`font-bold leading-none ${isLarge ? "text-xl" : "text-base"}`}
                              style={{ color: color.text }}
                            >
                              {rak.kapasitasSekarang}{" "}
                              <span className="text-xs opacity-60">
                                / {rak.kapasitasMax}
                              </span>
                            </span>
                          </div>
                          <span
                            className={`font-bold ${isLarge ? "text-xl" : "text-sm"}`}
                            style={{ color: color.text }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div
                          className={`w-full bg-white/60 rounded-full overflow-hidden ${isLarge || isTall ? "h-2" : "h-1.5"}`}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              duration: 0.8,
                              ease: "easeOut",
                            }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: color.border }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>

        {/* Right Panel — Detail */}
        <AnimatePresence>
          {activeRak && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="border-l border-zinc-100 bg-white shrink-0 flex flex-col overflow-hidden"
            >
              {/* Panel header */}
              <div className="px-5 py-4 border-b border-zinc-100 flex items-start justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: getFillColor(activeRak).bg,
                        color: getFillColor(activeRak).text,
                        border: `1px solid ${getFillColor(activeRak).border}`,
                      }}
                    >
                      {getFillColor(activeRak).label}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Rak {activeRak.nomor}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {activeRak.kapasitasSekarang} dari {activeRak.kapasitasMax}{" "}
                    slot terisi
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={handleOpenEditModal}
                    className="p-1.5 hover:bg-zinc-100 rounded-lg transition text-zinc-500 hover:text-zinc-700"
                    title="Ubah Rak"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveRak(null)}
                    className="p-1.5 hover:bg-zinc-100 rounded-lg transition text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Capacity visual */}
              <div className="px-5 py-4 border-b border-zinc-100 shrink-0">
                <div className="flex justify-between items-center mb-2 text-xs text-zinc-500">
                  <span>Kapasitas</span>
                  <span className="font-medium text-zinc-900">
                    {Math.round(
                      (activeRak.kapasitasSekarang / activeRak.kapasitasMax) *
                      100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(activeRak.kapasitasSekarang / activeRak.kapasitasMax) * 100}%`,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: getFillColor(activeRak).border }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 mt-1.5">
                  <span>0</span>
                  <span>{activeRak.kapasitasMax}</span>
                </div>
              </div>

              {/* Item list */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-5 py-3 border-b border-zinc-50">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Isi Rak ({activeRak.item?.length || 0} item)
                  </p>
                </div>

                {!activeRak.item || activeRak.item.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-12 h-12 border border-dashed border-zinc-200 rounded flex items-center justify-center mb-3">
                      <Package className="w-5 h-5 text-zinc-300" />
                    </div>
                    <p className="text-sm text-zinc-400 font-medium">
                      Rak kosong
                    </p>
                    <p className="text-xs text-zinc-300 mt-1">
                      Belum ada barang di rak ini
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-50">
                    {activeRak.item.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="px-5 py-3 hover:bg-zinc-50/80 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-sm font-medium text-zinc-900 leading-tight line-clamp-1">
                            {item.name}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded font-medium">
                            {item.category}
                          </span>
                          {item.weight && (
                            <span className="text-[10px] text-zinc-400">
                              {item.weight} kg
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Panel footer actions */}
              <div className="px-5 py-4 border-t border-zinc-100 shrink-0 flex gap-2">
                <button
                  onClick={(e) => toggleSelect(e as never, activeRak.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${selectedIds.includes(activeRak.id)
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    }`}
                >
                  {selectedIds.includes(activeRak.id)
                    ? "✓ Dipilih"
                    : "Pilih Rak"}
                </button>
                {activeRak.kapasitasSekarang > 0 && (
                  <button
                    onClick={() => {
                      setSelectedItemsToMove([]);
                      setTargetRakId("");
                      setIsMoveModalOpen(true);
                    }}
                    className="flex-1 py-2 rounded-lg text-xs font-medium border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Pindah Barang
                  </button>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col border border-zinc-200 overflow-hidden"
            >
              {/* Modal header */}
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center shrink-0">
                <div className="w-full">
                  <h2 className="text-base font-semibold">Tambah Rak Baru</h2>
                  <p className="text-xs text-zinc-400 mt-0.5 mb-3">
                    Tambahkan satu atau beberapa rak sekaligus.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-3 text-xs leading-relaxed max-w-lg">
                    <p className="font-bold mb-1">Ketentuan Pengisian:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li><strong>Nomor Rak:</strong> Wajib kombinasi huruf dan angka (min. 1 huruf & 1 angka), tanpa simbol atau spasi.</li>
                      <li><strong>Kapasitas:</strong> Minimal 10 item dan maksimal 100 item per rak.</li>
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg transition text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_1fr_32px] gap-3 mb-2 px-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Nomor / Label
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Kapasitas Maks.
                  </p>
                  <div />
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {newRaks.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-[1fr_1fr_32px] gap-3 items-center"
                      >
                        <input
                          type="text"
                          placeholder="Cth: A01, B02"
                          value={r.nomorRak}
                          onChange={(e) => {
                            const arr = [...newRaks];
                            arr[i].nomorRak = e.target.value;
                            setNewRaks(arr);
                          }}
                          className="w-full border border-zinc-200 px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-[#007582] focus:border-[#007582] text-sm transition bg-zinc-50 focus:bg-white"
                        />
                        <input
                          type="number"
                          min="10"
                          max="100"
                          placeholder="Cth: 50"
                          value={r.kapasitasMax}
                          onChange={(e) => {
                            const arr = [...newRaks];
                            arr[i].kapasitasMax = e.target.value
                              ? parseInt(e.target.value)
                              : "";
                            setNewRaks(arr);
                          }}
                          className="w-full border border-zinc-200 px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-[#007582] focus:border-[#007582] text-sm transition bg-zinc-50 focus:bg-white"
                        />
                        {newRaks.length > 1 ? (
                          <button
                            onClick={() =>
                              setNewRaks((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() =>
                    setNewRaks((prev) => [
                      ...prev,
                      { nomorRak: "", kapasitasMax: "" },
                    ])
                  }
                  className="mt-4 w-full py-2.5 border border-dashed border-zinc-300 text-zinc-500 rounded-lg hover:bg-zinc-50 hover:border-zinc-400 transition text-xs font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah baris
                </button>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 shrink-0 bg-zinc-50/50">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-medium bg-[#007582] text-white hover:bg-[#005f6b] rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Simpan Rak
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && activeRak && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col border border-zinc-200 overflow-hidden"
            >
              {/* Modal header */}
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-base font-semibold">Ubah Detail Rak {activeRak.nomor}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Perbarui informasi nomor rak dan kapasitas maksimal.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg transition text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-3 text-xs leading-relaxed">
                  <p className="font-bold mb-1">Ketentuan Pengisian:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li><strong>Nomor Rak:</strong> Wajib kombinasi huruf & angka (min. 1 huruf & 1 angka), tanpa simbol/spasi.</li>
                    <li><strong>Kapasitas:</strong> Minimal {activeRak.kapasitasSekarang > 10 ? activeRak.kapasitasSekarang : 10} item (tidak boleh kurang dari jumlah item yang ada saat ini) dan maksimal 100 item.</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    Nomor / Label Rak
                  </label>
                  <input
                    type="text"
                    placeholder="Cth: A01, B02"
                    value={editNomorRak}
                    onChange={(e) => setEditNomorRak(e.target.value)}
                    className="w-full border border-zinc-200 px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-[#007582] focus:border-[#007582] text-sm transition bg-zinc-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    Kapasitas Maksimal
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    placeholder="Cth: 50"
                    value={editKapasitasMax}
                    onChange={(e) => setEditKapasitasMax(e.target.value ? parseInt(e.target.value) : "")}
                    className="w-full border border-zinc-200 px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-[#007582] focus:border-[#007582] text-sm transition bg-zinc-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 shrink-0 bg-zinc-50/50">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={isEditSubmitting}
                  className="px-5 py-2 text-xs font-medium bg-[#007582] text-white hover:bg-[#005f6b] rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isEditSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Simpan Perubahan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move Modal */}
      <AnimatePresence>
        {isMoveModalOpen && activeRak && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsMoveModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col border border-zinc-200 overflow-hidden"
            >
              {/* Modal header */}
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-base font-semibold">Pindah Barang dari Rak {activeRak.nomor}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Pilih barang dan rak tujuan
                  </p>
                </div>
                <button
                  onClick={() => setIsMoveModalOpen(false)}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg transition text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    Pilih Rak Tujuan
                  </label>
                  <select
                    value={targetRakId}
                    onChange={(e) => setTargetRakId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full border border-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-[#007582] focus:border-[#007582] text-sm transition bg-zinc-50 focus:bg-white"
                  >
                    <option value="" disabled>-- Pilih Rak Tujuan --</option>
                    {shelves
                      .filter(s => s.id !== activeRak.id && s.kapasitasMax - s.kapasitasSekarang >= selectedItemsToMove.length)
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          Rak {s.nomor} (Tersisa {s.kapasitasMax - s.kapasitasSekarang} slot)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Pilih Barang ({selectedItemsToMove.length} dipilih)
                    </label>
                    <button
                      onClick={() => {
                        if (selectedItemsToMove.length === activeRak.item.length) {
                          setSelectedItemsToMove([]);
                        } else {
                          setSelectedItemsToMove(activeRak.item.map(i => i.id));
                        }
                      }}
                      className="text-xs text-[#007582] font-medium hover:underline"
                    >
                      {selectedItemsToMove.length === activeRak.item.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {activeRak.item.map(item => (
                      <label key={item.id} className="flex items-center gap-3 p-3 border border-zinc-100 rounded-lg hover:bg-zinc-50 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={selectedItemsToMove.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItemsToMove(prev => [...prev, item.id]);
                            } else {
                              setSelectedItemsToMove(prev => prev.filter(id => id !== item.id));
                            }
                          }}
                          className="w-4 h-4 text-[#007582] rounded border-zinc-300 focus:ring-[#007582]"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                          <p className="text-xs text-zinc-500">{item.category}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 shrink-0 bg-zinc-50/50">
                <button
                  onClick={() => setIsMoveModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleMoveSubmit}
                  disabled={isMoving || selectedItemsToMove.length === 0 || targetRakId === ""}
                  className="px-5 py-2 text-xs font-medium bg-[#007582] text-white hover:bg-[#005f6b] rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isMoving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MoveRight className="w-3.5 h-3.5" />
                  )}
                  Pindah Barang
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {successPopupMsg && (
        <SuccessPopup
          message={successPopupMsg}
          onClose={() => setSuccessPopupMsg(null)}
        />
      )}
      {errorPopupMsg && (
        <ErrorPopup
          message={errorPopupMsg}
          onClose={() => setErrorPopupMsg(null)}
        />
      )}
      {confirmData && (
        <ConfirmPopup
          message={confirmData.message}
          type={confirmData.type}
          onConfirm={() => {
            confirmData.onConfirm();
            setConfirmData(null);
          }}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </div>
  );
}
