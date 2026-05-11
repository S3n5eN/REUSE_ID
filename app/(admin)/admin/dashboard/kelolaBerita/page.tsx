"use client";

import { useState, useEffect, useRef } from "react";

type Berita = {
  id: number;
  title: string;
  imageType: string;
  createdAt: string;
  isPublished: boolean;
  admin?: { name: string };
};

type TabType = "pending" | "published";

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#e8f5ef] rounded-2xl overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-[#E1F5EE]" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 w-3/4 bg-[#E1F5EE] rounded" />
        <div className="h-3 w-1/2 bg-[#E1F5EE] rounded" />
        <div className="flex gap-2 mt-2">
          <div className="h-8 flex-1 bg-[#E1F5EE] rounded-lg" />
          <div className="h-8 w-16 bg-[#E1F5EE] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={[
      "fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-xl",
      "text-[13px] font-semibold text-white z-50 shadow-lg animate-[toastIn_0.3s_ease_both]",
      type === "success" ? "bg-[#1D9E75]" : "bg-[#E24B4A]",
    ].join(" ")}>
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {message}
    </div>
  );
}

export default function KelolaBeritaPage() {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [pendingBerita, setPendingBerita] = useState<Berita[]>([]);
  const [publishedBerita, setPublishedBerita] = useState<Berita[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [title, setTitle] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");

  const items = activeTab === "pending" ? pendingBerita : publishedBerita;

  const fetchBerita = async () => {
    setFetchLoading(true);
    try {
      const [pendingRes, publishedRes] = await Promise.all([
        fetch("/api/Admin/kelolaBerita?status=pending"),
        fetch("/api/Admin/kelolaBerita?status=published"),
      ]);
      const pendingData = await pendingRes.json();
      const publishedData = await publishedRes.json();
      setPendingBerita(Array.isArray(pendingData) ? pendingData : []);
      setPublishedBerita(Array.isArray(publishedData) ? publishedData : []);
    } catch {
      setPendingBerita([]);
      setPublishedBerita([]);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { fetchBerita(); }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!title || !foto) {
      showToast("Judul dan foto wajib diisi", "error");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("foto", foto);
      formData.append("caption", caption);
      

      const res = await fetch("/api/Admin/kelolaBerita", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Gagal menambah berita", "error"); return; }
      showToast("Berita berhasil ditambahkan", "success");
      setTitle("");
      setFoto(null);
      setPreview(null);
      setCaption("");
      setShowAddForm(false);
      await fetchBerita();
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/Admin/kelolaBerita/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Gagal publish", "error"); return; }
      showToast("Berita berhasil dipublikasi", "success");
      await fetchBerita();
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/Admin/kelolaBerita/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Gagal hapus", "error"); return; }
      showToast("Berita berhasil dihapus", "success");
      await fetchBerita();
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="px-6 py-8 max-w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#E1F5EE] border border-[#9FE1CB] flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v8a2 2 0 0 1-2 2z" />
                <path d="M17 3v5h5M12 11v6M9 14h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-[1.35rem] font-bold text-[#04342C] tracking-tight">Kelola Berita</h1>
              <p className="text-[0.78rem] text-[#0F6E56] font-medium mt-0.5">Tambah dan publikasi berita untuk pengguna</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-[#1D9E75] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0F6E56] transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Tambah Berita
          </button>
        </div>

        {/* Tab + count */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors border
              ${activeTab === "pending" ? "bg-[#1D9E75] text-white border-[#1D9E75]" : "bg-white text-[#0F6E56] border-[#9FE1CB] hover:bg-[#E1F5EE]"}`}
          >
            Pending
            <span className="ml-2 font-mono text-xs bg-white/20 px-2 py-0.5 rounded-full">{pendingBerita.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors border
              ${activeTab === "published" ? "bg-[#1D9E75] text-white border-[#1D9E75]" : "bg-white text-[#0F6E56] border-[#9FE1CB] hover:bg-[#E1F5EE]"}`}
          >
            Dipublikasi
            <span className="ml-2 font-mono text-xs bg-white/20 px-2 py-0.5 rounded-full">{publishedBerita.length}</span>
          </button>
        </div>

        {/* Grid berita */}
        {fetchLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 rounded-[14px] bg-[#E1F5EE] border border-[#9FE1CB] flex items-center justify-center mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
              </svg>
            </div>
            <p className="text-[14px] font-bold text-[#085041] mb-1">
              {activeTab === "pending" ? "Tidak ada berita pending" : "Belum ada berita yang dipublikasi"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {items.map((berita) => (
              <div key={berita.id} className="bg-white border border-[#e8f5ef] rounded-2xl overflow-hidden hover:shadow-md transition">
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={`/api/Admin/kelolaBerita/${berita.id}`}
                    alt={berita.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#04342C] text-sm mb-1 line-clamp-2">{berita.title}</h3>
                  <p className="text-xs text-[#0F6E56] mb-3">
                    {new Date(berita.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    {berita.admin && ` • ${berita.admin.name}`}
                  </p>
                  <div className="flex gap-2">
                    {!berita.isPublished && (
                      <button
                        onClick={() => handlePublish(berita.id)}
                        disabled={loading}
                        className="flex-1 bg-[#1D9E75] text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0F6E56] transition disabled:opacity-50"
                      >
                        Publikasi
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(berita.id)}
                      disabled={loading}
                      className="flex items-center gap-1 bg-[#FCEBEB] text-[#A32D2D] border border-[#F09595] py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-[#F7C1C1] transition disabled:opacity-50"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah Berita */}
      {showAddForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => { setShowAddForm(false); setTitle(""); setFoto(null); setPreview(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[#04342C] mb-6">Tambah Berita</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul berita"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
                />
              </div>
              <div>
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Caption</label>
  <textarea
    value={caption}
    onChange={(e) => setCaption(e.target.value)}
    placeholder="Deskripsi singkat berita..."
    rows={3}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none transition resize-none"
  />
</div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Foto</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-[#9FE1CB] rounded-xl p-4 text-center cursor-pointer hover:bg-[#E1F5EE] transition"
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <p className="text-sm text-[#0F6E56] font-medium">Klik untuk upload foto</p>
                      <p className="text-xs text-gray-400">JPG, PNG, WebP — maks 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddForm(false); setTitle(""); setFoto(null); setPreview(null); }}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="flex-1 bg-[#1D9E75] text-white py-2 rounded-xl hover:bg-[#0F6E56] transition text-sm font-semibold disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}