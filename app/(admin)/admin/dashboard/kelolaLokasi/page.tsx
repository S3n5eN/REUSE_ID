"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { get } from "http";
import SuccessPopup from "@/components/SuccessPopup";
import ErrorPopup from "@/components/ErrorPopup";
import ConfirmPopup from "@/components/ConfirmPopup";

const LocationPickerMap = dynamic(
  () => import("@/components/locationPickerMap"),
  { ssr: false },
);

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type Place = {
  id: number;
  name: string;
  address: string;
  managerName: string;
  managerPhone: string;
  operationalJam: string;
  latitude: number;
  longitude: number;
};

type PlaceItem = {
  id: number;
  name: string;
  category: string;
  status: string;
  quality: string | null;
};

export default function DaftarLokasiPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editPlace, setEditPlace] = useState<Place | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [placeId, setPlaceId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [placeItems, setPlaceItems] = useState<PlaceItem[]>([]);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [targetPlaceId, setTargetPlaceId] = useState<number | null>(null);

  const [successPopupMsg, setSuccessPopupMsg] = useState<string | null>(null);
  const [errorPopupMsg, setErrorPopupMsg] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<{
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
  } | null>(null);
  const [loadingPindah, setLoadingPindah] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    managerName: "",
    managerPhone: "",
    jamBuka: "",
    jamTutup: "",
    latitude: "",
    longitude: "",
    keyLocation: "",
  });
  const [adminType, setAdminType] = useState<"PUSAT" | "DAERAH">("DAERAH");
  const [AllPlaces, setAllPlaces] = useState<Place[]>([]);

  const getAdmin = async () => {
    try {
      const res = await fetch("/api/Admin");
      if (res.ok) {
        const data = await res.json();
        setAdminType(data.type);
      }
    } catch (error) {
      console.error("Gagal mengambil info admin:", error);
    }
  };

  const fetchPlaces = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/LokasiPengumpulan/getPlace");
      const data = await res.json();
      if (adminType === "PUSAT") {
        setPlaces(Array.isArray(data) ? data : []);
      } else if (adminType === "DAERAH") {
        setAllPlaces(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Gagal fetch lokasi:", err);
      setPlaces([]);
    } finally {
      setFetching(false);
    }
  };

  const fetchPlaceId = async () => {
    try {
      const res = await fetch("/api/Admin/getPlaceId");
      const data = await res.json();
      setPlaceId(data.placeId);

      const resPlave = await fetch(
        `/api/LokasiPengumpulan/getPlace?placeId=${data.placeId}`,
      );
      const dataPlace = await resPlave.json();
      setPlaces(Array.isArray(dataPlace) ? dataPlace : []);
    } catch (err) {
      console.error("Gagal fetch placeId:", err);
    } finally {
      setFetching(false);
    }
  };

  const isGeneral = adminType === "PUSAT";

  const fetchItemsByPlace = async (placeId: number) => {
    setFetchingItems(true);
    try {
      const res = await fetch(`/api/Barang/getItemByPlace?placeId=${placeId}`);
      const data = await res.json();
      setPlaceItems(data);
    } catch (err) {
      console.error("Gagal fetch items:", err);
    } finally {
      setFetchingItems(false);
    }
  };

  useEffect(() => {
    if (adminType === "DAERAH") {
      fetchPlaceId();
      fetchPlaces();
    } else if (adminType === "PUSAT") {
      fetchPlaces();
    }
  }, [adminType]);

  useEffect(() => {
    getAdmin();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTambah = async () => {
    if (
      !form.name ||
      !form.address ||
      !form.managerName ||
      !form.managerPhone ||
      !form.jamBuka ||
      !form.jamTutup ||
      !form.keyLocation
    ) {
      setError("Semua field harus diisi");
      return;
    }
    if (!form.latitude || !form.longitude) {
      setError("Pilih lokasi pada peta terlebih dahulu");
      return;
    }

    if (isNaN(parseFloat(form.latitude)) || isNaN(parseFloat(form.longitude))) {
      setError("Latitude dan longitude harus berupa angka");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/LokasiPengumpulan/tambahLokasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName: form.name,
          address: form.address,
          managerName: form.managerName,
          managerPhone: form.managerPhone,
          operationalJam: `${form.jamBuka} - ${form.jamTutup}`,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          keyLocation: form.keyLocation,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menambahkan lokasi");
        return;
      }
      await fetchPlaces();
      setForm({
        name: "",
        address: "",
        managerName: "",
        managerPhone: "",
        jamBuka: "",
        jamTutup: "",
        latitude: "",
        longitude: "",
        keyLocation: "",
      });
      setShowForm(false);
    } catch (err) {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editPlace) return;
    if (
      !form.name ||
      !form.address ||
      !form.managerName ||
      !form.managerPhone ||
      !form.jamBuka ||
      !form.jamTutup ||
      !form.latitude ||
      !form.longitude
    ) {
      setError("Semua field harus diisi");
      return;
    }
    if (isNaN(parseFloat(form.latitude)) || isNaN(parseFloat(form.longitude))) {
      setError("Latitude dan longitude harus berupa angka");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/LokasiPengumpulan/updateLokasi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editPlace.id,
          locationName: form.name,
          address: form.address,
          managerName: form.managerName,
          managerPhone: form.managerPhone,
          operationalJam: `${form.jamBuka} - ${form.jamTutup}`,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          keyLocation: form.keyLocation,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal mengupdate lokasi");
        return;
      }
      await fetchPlaces();
      setEditPlace(null);
      setForm({
        name: "",
        address: "",
        managerName: "",
        managerPhone: "",
        jamBuka: "",
        jamTutup: "",
        latitude: "",
        longitude: "",
        keyLocation: "",
      });
    } catch (err) {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const executePindah = async () => {
    if (!selectedPlace || !targetPlaceId || selectedItemIds.length === 0)
      return;
    setLoadingPindah(true);
    try {
      const res = await fetch("/api/Admin/pindahItem", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: selectedItemIds,
          sourcePlaceId: selectedPlace.id,
          targetPlaceId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorPopupMsg(data.message || "Gagal memindahkan barang");
        return;
      }
      setSuccessPopupMsg("Barang berhasil dipindahkan");
      await fetchItemsByPlace(selectedPlace.id);
      setSelectedItemIds([]);
      setTargetPlaceId(null);
    } catch (err) {
      setErrorPopupMsg("Terjadi kesalahan, coba lagi");
    } finally {
      setLoadingPindah(false);
    }
  };

  const handlePindah = () => {
    if (!selectedPlace || !targetPlaceId || selectedItemIds.length === 0)
      return;

    const targetPlaceName = AllPlaces.find((p) => p.id === targetPlaceId)?.name || "lokasi tujuan";

    setConfirmData({
      message: `Apakah Anda yakin ingin memindahkan ${selectedItemIds.length} barang ke ${targetPlaceName}?`,
      type: "warning",
      onConfirm: executePindah,
    });
  };

  const toggleSelectId = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectItemId = (id: number) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = async () => {
    try {
      const res = await fetch("/api/LokasiPengumpulan/deleteLokasi", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorPopupMsg(data.message || "Gagal menghapus lokasi");
        setShowDeleteConfirm(false);
        return;
      }

      setSuccessPopupMsg("Lokasi berhasil dihapus");
      await fetchPlaces();
      setSelectedIds([]);
      setDeleteMode(false);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Gagal hapus lokasi:", err);
      setErrorPopupMsg("Terjadi kesalahan, coba lagi");
    }
  };

  const exitDeleteMode = () => {
    setDeleteMode(false);
    setSelectedIds([]);
  };

  const openEdit = (place: Place) => {
    const [jamBuka, jamTutup] = place.operationalJam.split(" - ");
    setEditPlace(place);
    setForm({
      name: place.name,
      address: place.address,
      managerName: place.managerName,
      managerPhone: place.managerPhone,
      jamBuka: jamBuka || "",
      jamTutup: jamTutup || "",
      latitude: place.latitude.toString(),
      longitude: place.longitude.toString(),
      keyLocation: "",
    });
    setError("");
  };

  const statusColor = (status: string) => {
    if (status === "Tersedia") return "bg-green-100 text-green-700";
    if (status === "Diambil") return "bg-gray-100 text-gray-600";
    if (status === "PendingApproval") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-600";
  };

  const formFields = [
    { label: "Nama Lokasi", name: "name", placeholder: "Gudang Bandung" },
    { label: "Alamat", name: "address", placeholder: "Jl. Sudirman No. 12" },
    { label: "Nama Manajer", name: "managerName", placeholder: "Budi Santoso" },
    {
      label: "No. HP Manajer",
      name: "managerPhone",
      placeholder: "+62 xxxx xxxx",
    },
    {
      label: "Jam Operasional",
      name: "operationalJam",
      placeholder: "08:00 - 17:00",
    },
    { label: "Latitude", name: "latitude", placeholder: "-6.914744" },
    { label: "Longitude", name: "longitude", placeholder: "107.609810" },
  ];

  // ============ DETAIL VIEW (full page) ============
  if (selectedPlace) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Kolom Kiri — Detail Lokasi */}
        <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col p-8">
          <button
            onClick={() => {
              setSelectedPlace(null);
              setPlaceItems([]);
              setSelectedItemIds([]);
              setTargetPlaceId(null);
            }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition mb-6 w-fit"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            {selectedPlace.name}
          </h2>

          <div className="space-y-5 flex-1">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Alamat
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {selectedPlace.address}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Manajer
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {selectedPlace.managerName}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                No. HP Manajer
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {selectedPlace.managerPhone}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Jam Operasional
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {selectedPlace.operationalJam}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Lokasi
              </p>
              <div
                className="mt-2 rounded-xl overflow-hidden"
                style={{ height: "200px" }}
              >
                {typeof window !== "undefined" && (
                  <MapView
                    lat={selectedPlace.latitude}
                    lng={selectedPlace.longitude}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan — Barang */}
        <div className="w-1/2 flex flex-col bg-gray-50">
          {/* Header kanan */}

          {/* Header kanan */}
          <div className="px-8 py-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Barang di Lokasi Ini
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {placeItems.length} barang
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Tombol Select All */}
                {placeItems.length > 0 && (
                  <button
                    onClick={() => {
                      if (selectedItemIds.length === placeItems.length) {
                        setSelectedItemIds([]);
                      } else {
                        setSelectedItemIds(placeItems.map((i) => i.id));
                      }
                    }}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium transition whitespace-nowrap"
                  >
                    {selectedItemIds.length === placeItems.length
                      ? "Batal Semua"
                      : "Pilih Semua"}
                  </button>
                )}

                {/* Dropdown pilih lokasi tujuan */}
                <select
                  value={targetPlaceId ?? ""}
                  onChange={(e) => setTargetPlaceId(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none"
                >
                  <option value="">Pilih lokasi tujuan</option>
                  {AllPlaces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* List barang scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
            {fetchingItems ? (
              <p className="text-sm text-gray-400 text-center mt-8">
                Memuat barang...
              </p>
            ) : placeItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center mt-8">
                Tidak ada barang di lokasi ini
              </p>
            ) : (
              placeItems.map((item) => {
                const isItemSelected = selectedItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectItemId(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border bg-white
                      ${isItemSelected ? "border-teal-400 bg-teal-50" : "border-gray-100 hover:border-teal-200"}`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                      ${isItemSelected ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}
                    >
                      {isItemSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <img
                      src={`/api/Barang/getImage/${item.id}`}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Tombol Pindahkan — static di bawah */}
          <div className="px-8 py-4 border-t border-gray-200 bg-white">
            <button
              onClick={handlePindah}
              disabled={
                loadingPindah || selectedItemIds.length === 0 || !targetPlaceId
              }
              className="w-full bg-teal-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition disabled:opacity-40"
            >
              {loadingPindah
                ? "Memindahkan..."
                : selectedItemIds.length > 0
                  ? `Pindahkan (${selectedItemIds.length})`
                  : "Pindahkan Barang"}
            </button>
          </div>
        </div>
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

  // ============ LIST VIEW ============
  return (
    <div
      className="p-6 flex flex-col"
      style={{ minHeight: "calc(100vh - 0px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Kelola Lokasi</h1>
        <div className="flex items-center gap-2">
          {deleteMode ? (
            <>
              <button
                onClick={exitDeleteMode}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-full hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={() =>
                  selectedIds.length > 0 && setShowDeleteConfirm(true)
                }
                disabled={selectedIds.length === 0}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-40"
              >
                Hapus ({selectedIds.length})
              </button>
            </>
          ) : (
            <>
              {isGeneral && (
                <>
                  <button
                    onClick={() => setDeleteMode(true)}
                    className="w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    title="Hapus Lokasi"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setError("");
                    }}
                    className="w-9 h-9 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition text-xl font-bold"
                    title="Tambah Lokasi"
                  >
                    +
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Card List */}
      {fetching ? (
        <p className="text-sm text-gray-400">Memuat data...</p>
      ) : places.length === 0 ? (
        <p className="text-sm text-gray-400">
          Belum ada lokasi. Tambah lokasi baru dengan tombol +
        </p>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          {(isGeneral ? places : places.filter((p) => p.id === placeId)).map(
            (place) => {
              const isSelected = selectedIds.includes(place.id);
              return (
                <div
                  key={place.id}
                  onClick={() => {
                    if (deleteMode) toggleSelectId(place.id);
                    else {
                      setSelectedPlace(place);
                      fetchItemsByPlace(place.id);
                    }
                  }}
                  className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition flex-1
                  ${deleteMode
                      ? isSelected
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                      : "border-gray-200 hover:shadow-md hover:border-teal-300"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {deleteMode && (
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-red-500 bg-red-500" : "border-gray-300"}`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                      <div>
                        <h2 className="font-semibold text-gray-800">
                          {place.name}
                        </h2>
                        <div className="flex items-center gap-6 mt-1">
                          <p className="text-sm text-gray-500">
                            📍 {place.address}
                          </p>
                          <p className="text-sm text-gray-500">
                            🕐 {place.operationalJam}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!deleteMode && (isGeneral || place.id === placeId) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(place);
                        }}
                        className="text-gray-400 hover:text-teal-600 transition p-2 rounded-lg hover:bg-teal-50"
                        title="Edit"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {/* Form Popup Tambah Lokasi */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => {
            setShowForm(false);
            setError("");
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg text-center font-bold text-gray-800 mb-6">
              Tambah Lokasi
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Nama Lokasi
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Gudang Bandung"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Alamat
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Jl. Sudirman No. 12"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Nama Manajer
                  </label>
                  <input
                    type="text"
                    name="managerName"
                    placeholder="Budi Santoso"
                    value={form.managerName}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    No. HP Manajer
                  </label>
                  <input
                    type="tel"
                    name="managerPhone"
                    placeholder="+62 xxxx xxxx"
                    value={form.managerPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9+]/g, "");
                      setForm({ ...form, managerPhone: val });
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Jam Buka
                  </label>
                  <input
                    type="time"
                    name="jamBuka"
                    value={form.jamBuka}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Jam Tutup
                  </label>
                  <input
                    type="time"
                    name="jamTutup"
                    value={form.jamTutup}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Pilih Lokasi
                </label>
                <div
                  className="rounded-xl overflow-hidden border border-gray-200 h-full"
                  style={{ minHeight: "320px" }}
                >
                  <LocationPickerMap
                    key="tambah-map"
                    onLocationSelect={(lat, lng) =>
                      setForm({
                        ...form,
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                      })
                    }
                    initialLocation={
                      form.latitude && form.longitude
                        ? [
                          parseFloat(form.latitude),
                          parseFloat(form.longitude),
                        ]
                        : null
                    }
                  />
                </div>
                {form.latitude && form.longitude && (
                  <p className="text-xs text-teal-600 mt-1">
                    Lat: {parseFloat(form.latitude).toFixed(6)} | Lng:{" "}
                    {parseFloat(form.longitude).toFixed(6)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Passkey Gudang
                </label>
                <input
                  type="password"
                  name="keyLocation"
                  placeholder="Passkey untuk admin gudang ini"
                  value={form.keyLocation}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center mt-4">{error}</p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleTambah}
                disabled={loading}
                className="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Popup Edit Lokasi */}
      {editPlace && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => {
            setEditPlace(null);
            setError("");
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg text-center font-bold text-gray-800 mb-6">
              Edit Lokasi
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Nama Lokasi
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Gudang Bandung"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Alamat
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Jl. Sudirman No. 12"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Nama Manajer
                  </label>
                  <input
                    type="text"
                    name="managerName"
                    placeholder="Budi Santoso"
                    value={form.managerName}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    No. HP Manajer
                  </label>
                  <input
                    type="tel"
                    name="managerPhone"
                    placeholder="+62 xxxx xxxx"
                    value={form.managerPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9+]/g, "");
                      setForm({ ...form, managerPhone: val });
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Jam Buka
                  </label>
                  <input
                    type="time"
                    name="jamBuka"
                    value={form.jamBuka}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Jam Tutup
                  </label>
                  <input
                    type="time"
                    name="jamTutup"
                    value={form.jamTutup}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Pilih Lokasi
                </label>
                <div
                  className="rounded-xl overflow-hidden border border-gray-200 h-full"
                  style={{ minHeight: "320px" }}
                >
                  <LocationPickerMap
                    key="edit-map"
                    onLocationSelect={(lat, lng) =>
                      setForm({
                        ...form,
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                      })
                    }
                    initialLocation={
                      form.latitude && form.longitude
                        ? [
                          parseFloat(form.latitude),
                          parseFloat(form.longitude),
                        ]
                        : null
                    }
                  />
                </div>
                {form.latitude && form.longitude && (
                  <p className="text-xs text-teal-600 mt-1">
                    Lat: {parseFloat(form.latitude).toFixed(6)} | Lng:{" "}
                    {parseFloat(form.longitude).toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-xs text-center mt-4">{error}</p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditPlace(null);
                  setError("");
                }}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleEdit}
                disabled={loading}
                className="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi Delete */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗑️</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Hapus {selectedIds.length} Lokasi?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Data lokasi yang dipilih akan dihapus permanen dan tidak bisa
              dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition text-sm font-medium"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

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
