"use client";

import { useState, useEffect } from "react";

type Place = {
  id: number;
  name: string;
  address: string;
  managerName: string;
  managerPhone: string;
  operationalJam: string;
};

type PlaceItem = {
  id: number;
  name: string;
  category: string;
  status: string;
  quality: string | null;
  imageURL: string;
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
  const [error, setError] = useState("");
  const [placeItems, setPlaceItems] = useState<PlaceItem[]>([]);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [targetPlaceId, setTargetPlaceId] = useState<number | null>(null);
  const [loadingPindah, setLoadingPindah] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    managerName: "",
    managerPhone: "",
    operationalJam: "",
  });

  const fetchPlaces = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/LokasiPengumpulan/getPlace");
      const data = await res.json();
      setPlaces(data);
    } catch (err) {
      console.error("Gagal fetch lokasi:", err);
    } finally {
      setFetching(false);
    }
  };

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
    fetchPlaces();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTambah = async () => {
    if (!form.name || !form.address || !form.managerName || !form.managerPhone || !form.operationalJam) {
      setError("Semua field harus diisi");
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
          operationalJam: form.operationalJam,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menambahkan lokasi");
        return;
      }
      await fetchPlaces();
      setForm({ name: "", address: "", managerName: "", managerPhone: "", operationalJam: "" });
      setShowForm(false);
    } catch (err) {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editPlace) return;
    if (!form.name || !form.address || !form.managerName || !form.managerPhone || !form.operationalJam) {
      setError("Semua field harus diisi");
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
          operationalJam: form.operationalJam,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal mengupdate lokasi");
        return;
      }
      await fetchPlaces();
      setEditPlace(null);
      setForm({ name: "", address: "", managerName: "", managerPhone: "", operationalJam: "" });
    } catch (err) {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const handlePindah = async () => {
    if (!selectedPlace || !targetPlaceId || selectedItemIds.length === 0) return;
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
        alert(data.message || "Gagal memindahkan barang");
        return;
      }
      await fetchItemsByPlace(selectedPlace.id);
      setSelectedItemIds([]);
      setTargetPlaceId(null);
    } catch (err) {
      alert("Terjadi kesalahan, coba lagi");
    } finally {
      setLoadingPindah(false);
    }
  };

  const toggleSelectId = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectItemId = (id: number) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    setPlaces(places.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    setDeleteMode(false);
    setShowDeleteConfirm(false);
  };

  const exitDeleteMode = () => {
    setDeleteMode(false);
    setSelectedIds([]);
  };

  const openEdit = (place: Place) => {
    setEditPlace(place);
    setForm({
      name: place.name,
      address: place.address,
      managerName: place.managerName,
      managerPhone: place.managerPhone,
      operationalJam: place.operationalJam,
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
    { label: "No. HP Manajer", name: "managerPhone", placeholder: "+62 xxxx xxxx" },
    { label: "Jam Operasional", name: "operationalJam", placeholder: "08:00 - 17:00" },
  ];

  // ============ DETAIL VIEW (full page) ============
  if (selectedPlace) {
    return (
      <div className="flex h-screen bg-gray-50">

        {/* Kolom Kiri — Detail Lokasi */}
        <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col p-8">
          <button
            onClick={() => { setSelectedPlace(null); setPlaceItems([]); setSelectedItemIds([]); setTargetPlaceId(null); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition mb-6 w-fit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-8">{selectedPlace.name}</h2>

          <div className="space-y-5 flex-1">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Alamat</p>
              <p className="text-sm text-gray-700 mt-1">{selectedPlace.address}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Manajer</p>
              <p className="text-sm text-gray-700 mt-1">{selectedPlace.managerName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">No. HP Manajer</p>
              <p className="text-sm text-gray-700 mt-1">{selectedPlace.managerPhone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Jam Operasional</p>
              <p className="text-sm text-gray-700 mt-1">{selectedPlace.operationalJam}</p>
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
      <h3 className="font-semibold text-gray-800">Barang di Lokasi Ini</h3>
      <p className="text-xs text-gray-400 mt-1">{placeItems.length} barang</p>
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
          {selectedItemIds.length === placeItems.length ? "Batal Semua" : "Pilih Semua"}
        </button>
      )}

      {/* Dropdown pilih lokasi tujuan */}
      <select
        value={targetPlaceId ?? ""}
        onChange={(e) => setTargetPlaceId(Number(e.target.value))}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none"
      >
        <option value="">Pilih lokasi tujuan</option>
        {places
          .filter((p) => p.id !== selectedPlace.id)
          .map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
      </select>
    </div>
  </div>
</div>

          {/* List barang scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
            {fetchingItems ? (
              <p className="text-sm text-gray-400 text-center mt-8">Memuat barang...</p>
            ) : placeItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center mt-8">Tidak ada barang di lokasi ini</p>
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
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                      ${isItemSelected ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}
                    >
                      {isItemSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <img
                      src={item.imageURL}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor(item.status)}`}>
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
              disabled={loadingPindah || selectedItemIds.length === 0 || !targetPlaceId}
              className="w-full bg-teal-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition disabled:opacity-40"
            >
              {loadingPindah ? "Memindahkan..." : `Pindahkan ${selectedItemIds.length > 0 ? `(${selectedItemIds.length})` : "Barang"}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ LIST VIEW ============
  return (
    <div className="p-6 flex flex-col" style={{ minHeight: "calc(100vh - 0px)" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Kelola Lokasi</h1>
        <div className="flex items-center gap-2">
          {deleteMode ? (
            <>
              <button onClick={exitDeleteMode} className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-full hover:bg-gray-100 transition">
                Batal
              </button>
              <button
                onClick={() => selectedIds.length > 0 && setShowDeleteConfirm(true)}
                disabled={selectedIds.length === 0}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-40"
              >
                Hapus ({selectedIds.length})
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setDeleteMode(true)} className="w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition" title="Hapus Lokasi">
                🗑️
              </button>
              <button onClick={() => { setShowForm(true); setError(""); }} className="w-9 h-9 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition text-xl font-bold" title="Tambah Lokasi">
                +
              </button>
            </>
          )}
        </div>
      </div>

      {/* Card List */}
      {fetching ? (
        <p className="text-sm text-gray-400">Memuat data...</p>
      ) : places.length === 0 ? (
        <p className="text-sm text-gray-400">Belum ada lokasi. Tambah lokasi baru dengan tombol +</p>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          {places.map((place) => {
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
                    ? isSelected ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-red-300"
                    : "border-gray-200 hover:shadow-md hover:border-teal-300"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {deleteMode && (
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-red-500 bg-red-500" : "border-gray-300"}`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )}
                    <div>
                      <h2 className="font-semibold text-gray-800">{place.name}</h2>
                      <div className="flex items-center gap-6 mt-1">
                        <p className="text-sm text-gray-500">📍 {place.address}</p>
                        <p className="text-sm text-gray-500">🕐 {place.operationalJam}</p>
                      </div>
                    </div>
                  </div>
                  {!deleteMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(place); }}
                      className="text-gray-400 hover:text-teal-600 transition p-1 rounded-lg hover:bg-teal-50"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Popup Tambah Lokasi */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setShowForm(false); setError(""); }}>
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800 mb-6">Tambah Lokasi</h2>
            <div className="space-y-4">
              {formFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{field.label}</label>
                  <input type="text" name={field.name} placeholder={field.placeholder} value={form[field.name as keyof typeof form]} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition" />
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-xs text-center mt-4">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setError(""); }} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition text-sm">Batal</button>
              <button onClick={handleTambah} disabled={loading} className="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition text-sm font-medium disabled:opacity-50">
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Popup Edit Lokasi */}
      {editPlace && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setEditPlace(null); setError(""); }}>
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800 mb-6">Edit Lokasi</h2>
            <div className="space-y-4">
              {formFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{field.label}</label>
                  <input type="text" name={field.name} placeholder={field.placeholder} value={form[field.name as keyof typeof form]} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition" />
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-xs text-center mt-4">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setEditPlace(null); setError(""); }} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition text-sm">Batal</button>
              <button onClick={handleEdit} disabled={loading} className="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition text-sm font-medium disabled:opacity-50">
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi Delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗑️</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Hapus {selectedIds.length} Lokasi?</h2>
            <p className="text-sm text-gray-500 mb-6">Data lokasi yang dipilih akan dihapus permanen dan tidak bisa dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition text-sm">Batal</button>
              <button onClick={handleDeleteSelected} className="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition text-sm font-medium">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 