"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Landmark,
  Loader2,
  ReceiptText,
  Trash2,
  Upload,
} from "lucide-react";

type PaymentDetail = {
  id: number;
  paymentInvoice: string | null;
  paymentStatus: "Unpaid" | "WaitingVerification" | "Paid" | "Failed";
  paymentTotal: number | null;
  paymentExpiredAt: string | null;
  shipmentCost: number | null;
  distance: number | null;
  transferBankCode: string | null;
  transferBankName: string | null;
  transferAccountNumber: string | null;
  transferAccountHolder: string | null;
  payerBank: string | null;
  payerAccountName: string | null;
  transferProofUploadedAt: string | null;
  item: {
    name: string;
    place: { name: string } | null;
  };
};

const statusCopy = {
  Unpaid: "Menunggu Pembayaran",
  WaitingVerification: "Menunggu Verifikasi",
  Paid: "Pembayaran Diterima",
  Failed: "Pembayaran Ditolak",
};

function UploadBuktiTransferPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shipmentId = searchParams.get("shipmentId");

  const [detail, setDetail] = useState<PaymentDetail | null>(null);
  const [payerBank, setPayerBank] = useState("");
  const [payerAccountName, setPayerAccountName] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!proof) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(proof);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [proof]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/Pengguna/pembayaranTransfer/checkStatusTransfer?shipmentId=${shipmentId}`,
        );
        const data = await res.json();
        if (data.status) {
          router.push("/dashboard/barangSaya");
        }
      } catch {
        setErrorMsg("Gagal terhubung ke server.");
      }
    };

    const fetchDetail = async () => {
      if (!shipmentId) {
        setErrorMsg("ID pengiriman tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/Pengguna/pembayaranTransfer?shipmentId=${shipmentId}`,
        );
        const body = await res.json();

        if (!res.ok) {
          setErrorMsg(body.message || "Gagal memuat pembayaran.");
          return;
        }

        setDetail(body.data);
        setPayerBank(body.data.payerBank || "");
        setPayerAccountName(body.data.payerAccountName || "");
      } catch {
        setErrorMsg("Gagal terhubung ke server.");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    fetchDetail();
  }, [shipmentId]);

  const expiredAt = useMemo(() => {
    if (!detail?.paymentExpiredAt) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date(detail.paymentExpiredAt));
  }, [detail?.paymentExpiredAt]);

  const totalTransfer = detail?.paymentTotal
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(detail.paymentTotal)
    : "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!shipmentId || !proof) {
      setErrorMsg("Bukti transfer wajib diupload.");
      return;
    }

    const formData = new FormData();
    formData.append("shipmentId", shipmentId);
    formData.append("payerBank", payerBank);
    formData.append("payerAccountName", payerAccountName);
    formData.append("proof", proof);

    try {
      setSubmitting(true);
      const res = await fetch("/api/Pengguna/pembayaranTransfer", {
        method: "POST",
        body: formData,
      });
      const body = await res.json();

      if (!res.ok) {
        setErrorMsg(body.message || "Gagal upload bukti transfer.");
        return;
      }

      setSuccessMsg(
        "Bukti transfer berhasil dikirim. Admin akan melakukan verifikasi.",
      );
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: "WaitingVerification",
              payerBank,
              payerAccountName,
              transferProofUploadedAt: body.data.transferProofUploadedAt,
            }
          : prev,
      );
      setProof(null);
      setTimeout(() => {
        router.push("/dashboard/barangSaya");
      }, 1500);
    } catch {
      setErrorMsg("Gagal terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  const canUpload = detail?.paymentStatus !== "Paid";

  return (
    <main className="min-h-screen bg-[#F5F7F6]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#007582] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-6">
          <section className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-[#007582] uppercase tracking-widest">
                  Transfer ATM
                </p>
                <h1 className="text-2xl font-bold text-zinc-900 mt-2">
                  Upload Bukti Pembayaran
                </h1>
                <p className="text-sm text-zinc-500 mt-2">
                  Transfer sesuai nominal invoice, lalu upload bukti agar admin
                  dapat memverifikasi pembayaran.
                </p>
              </div>
              {detail && (
                <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  {statusCopy[detail.paymentStatus]}
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#007582]" />
              </div>
            ) : detail ? (
              <>
                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <ReceiptText className="w-4 h-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Invoice
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-bold text-zinc-900">
                      {detail.paymentInvoice}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#007582]/20 bg-[#007582]/5 p-4">
                    <div className="flex items-center gap-2 text-[#007582]">
                      <ReceiptText className="w-4 h-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Total Transfer
                      </p>
                    </div>
                    <p className="mt-2 text-xl font-bold text-[#007582]">
                      {totalTransfer}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Landmark className="w-4 h-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Rekening Tujuan
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-bold text-zinc-900">
                      {detail.transferBankCode} - {detail.transferAccountNumber}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      a.n. {detail.transferAccountHolder}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Batas Bayar
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-bold text-zinc-900">
                      {expiredAt} WIB
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-2">
                        Bank Pengirim
                      </label>
                      <input
                        value={payerBank}
                        onChange={(e) => setPayerBank(e.target.value)}
                        required
                        disabled={!canUpload}
                        placeholder="Contoh: BCA"
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#007582] focus:ring-2 focus:ring-[#007582]/15 disabled:bg-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-2">
                        Nama Pemilik Rekening
                      </label>
                      <input
                        value={payerAccountName}
                        onChange={(e) => setPayerAccountName(e.target.value)}
                        required
                        disabled={!canUpload}
                        placeholder="Nama sesuai rekening"
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#007582] focus:ring-2 focus:ring-[#007582]/15 disabled:bg-zinc-100"
                      />
                    </div>
                  </div>

                  <label
                    className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 transition ${
                      previewUrl
                        ? "border-zinc-200 bg-zinc-50 p-2"
                        : "border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center hover:border-[#007582] hover:bg-[#007582]/5"
                    }`}
                  >
                    {previewUrl ? (
                      <div className="relative w-full rounded-xl overflow-hidden group flex flex-col items-center">
                        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-zinc-200">
                          <img
                            src={previewUrl}
                            alt="Preview Bukti Transfer"
                            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-2">
                            <Upload className="w-6 h-6 animate-bounce" />
                            <span className="text-xs font-semibold">
                              Klik untuk mengganti gambar
                            </span>
                          </div>
                        </div>
                        <div className="w-full mt-3 px-2 py-1 flex items-center justify-between gap-3 text-left">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-zinc-800 truncate">
                              {proof?.name}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {proof
                                ? (proof.size / (1024 * 1024)).toFixed(2)
                                : 0}{" "}
                              MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setProof(null);
                            }}
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 text-xs font-semibold transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-[#007582]" />
                        <span className="mt-3 text-sm font-semibold text-zinc-800">
                          Upload struk atau screenshot transfer
                        </span>
                        <span className="mt-1 text-xs text-zinc-400">
                          PNG, JPG, atau JPEG maksimal 2MB
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={!canUpload}
                      onChange={(e) => setProof(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>

                  {errorMsg && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="flex items-center gap-2 rounded-xl bg-[#007582]/5 border border-[#007582]/20 px-4 py-3 text-sm font-medium text-[#007582]">
                      <CheckCircle2 className="w-4 h-4" />
                      {successMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !canUpload}
                    className="w-full rounded-xl bg-[#007582] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#005f6b] disabled:opacity-45 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {detail.paymentStatus === "WaitingVerification"
                      ? "Upload Ulang Bukti Transfer"
                      : "Kirim Bukti Transfer"}
                  </button>
                </form>
              </>
            ) : (
              <div className="mt-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {errorMsg || "Data pembayaran tidak ditemukan."}
              </div>
            )}
          </section>

          <aside className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm h-fit">
            <p className="text-sm font-bold text-zinc-900">Instruksi ATM</p>
            <ol className="mt-4 space-y-3 text-sm text-zinc-600">
              <li>1. Pilih menu transfer antar bank atau sesama bank.</li>
              <li>
                2. Masukkan nomor rekening tujuan yang tertera di invoice.
              </li>
              <li>3. Masukkan nominal tepat sampai tiga digit terakhir.</li>
              <li>4. Simpan struk atau screenshot transaksi.</li>
              <li>5. Upload bukti transfer di form ini.</li>
            </ol>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function UploadBuktiTransferPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F5F7F6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#007582] animate-spin" />
        <p className="text-sm text-zinc-400 mt-2">Memuat halaman...</p>
      </main>
    }>
      <UploadBuktiTransferPageContent />
    </Suspense>
  );
}
