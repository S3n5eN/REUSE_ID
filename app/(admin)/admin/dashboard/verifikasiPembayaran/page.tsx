"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import SuccessPopup from "@/components/SuccessPopup";
import ErrorPopup from "@/components/ErrorPopup";
import ConfirmPopup from "@/components/ConfirmPopup";

type Payment = {
  id: number;
  paymentInvoice: string | null;
  paymentTotal: number | null;
  paymentExpiredAt: string | null;
  shipmentCost: number | null;
  transferBankCode: string | null;
  transferBankName: string | null;
  transferAccountNumber: string | null;
  transferAccountHolder: string | null;
  payerBank: string | null;
  payerAccountName: string | null;
  transferProofUploadedAt: string | null;
  item: {
    id: number;
    name: string;
    place: { name: string } | null;
  };
  userProfile: {
    namaLengkap: string;
    phone: string;
  } | null;
};

function formatCurrency(value: number | null) {
  if (value == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export default function VerifikasiPembayaranPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [agreedIds, setAgreedIds] = useState<Record<number, boolean>>({});

  const [successPopupMsg, setSuccessPopupMsg] = useState<string | null>(null);
  const [errorPopupMsg, setErrorPopupMsg] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<{
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
  } | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/Admin/verifikasiPembayaran");
      const body = await res.json();

      if (!res.ok) {
        setErrorMsg(body.message || "Gagal memuat pembayaran");
        return;
      }

      setPayments(body.data || []);
    } catch {
      setErrorMsg("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const executeVerify = async (
    shipmentId: number,
    action: "approve" | "reject",
  ) => {
    try {
      setProcessingId(shipmentId);
      const res = await fetch("/api/Admin/verifikasiPembayaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId, action }),
      });
      const body = await res.json();

      if (!res.ok) {
        setErrorPopupMsg(body.message || "Gagal memproses pembayaran");
        return;
      }

      if (action == "approve") {
        setSuccessPopupMsg(body.message);
      } else {
        setErrorPopupMsg(body.message);
      }
      setPayments((prev) =>
        prev.filter((payment) => payment.id !== shipmentId),
      );
    } catch {
      setErrorPopupMsg("Gagal terhubung ke server");
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerify = (shipmentId: number, action: "approve" | "reject") => {
    const confirmMsg =
      action === "approve"
        ? "Apakah Anda yakin ingin menyetujui verifikasi pembayaran ini?"
        : "Apakah Anda yakin ingin menolak pembayaran ini? Pengguna harus mengunggah ulang bukti transfer.";

    setConfirmData({
      message: confirmMsg,
      type: action === "approve" ? "info" : "danger",
      onConfirm: () => executeVerify(shipmentId, action),
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-10 py-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-teal-600 tracking-widest mb-1">
            REUSEID ADMIN
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Verifikasi Pembayaran
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cocokkan nominal transfer, rekening pengirim, dan bukti struk
            sebelum menyetujui pembayaran.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-amber-300 rounded-full px-4 py-2 text-sm font-medium text-amber-800 bg-amber-50">
          <Clock className="w-4 h-4" />
          {payments.length} menunggu
        </div>
      </div>

      <div className="border-t-2 border-teal-500 my-5" />

      {loading && (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-teal-700" />
        </div>
      )}

      {!loading && errorMsg && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && payments.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400">
          Belum ada pembayaran yang menunggu verifikasi.
        </div>
      )}

      <div className="space-y-5">
        {payments.map((payment) => {
          const isAgreed = agreedIds[payment.id] || false;
          return (
            <article
              key={payment.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="grid lg:grid-cols-[320px_1fr]">
                <div className="bg-gray-100 border-r border-gray-200 p-4">
                  <div className="aspect-[4/5] rounded-xl overflow-hidden bg-white border border-gray-200">
                    <img
                      src={`/api/Admin/buktiTransfer/${payment.id}`}
                      alt={`Bukti transfer ${payment.paymentInvoice || payment.id}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <a
                    href={`/api/Admin/buktiTransfer/${payment.id}`}
                    target="_blank"
                    className="mt-3 block text-center text-sm font-semibold text-teal-700 hover:text-teal-900"
                  >
                    Buka bukti transfer
                  </a>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold tracking-widest uppercase text-teal-600">
                        {payment.paymentInvoice}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-gray-900">
                        {payment.item.name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {payment.userProfile?.namaLengkap || "-"} -{" "}
                        {payment.userProfile?.phone || "-"}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      Menunggu Verifikasi
                    </span>
                  </div>

                  <div className="mt-5 grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">
                        Total Harus Dibayar
                      </p>
                      <p className="mt-1 text-xl font-bold text-teal-800">
                        {formatCurrency(payment.paymentTotal)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Ongkir Asli
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatCurrency(payment.shipmentCost)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Rekening Tujuan
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {payment.transferBankCode} -{" "}
                        {payment.transferAccountNumber}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        a.n. {payment.transferAccountHolder}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Rekening Pengirim
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {payment.payerBank || "-"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        a.n. {payment.payerAccountName || "-"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Upload Bukti
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatDate(payment.transferProofUploadedAt)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Batas Bayar
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatDate(payment.paymentExpiredAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-teal-50/40 border border-teal-100">
                    <input
                      type="checkbox"
                      id={`agree-${payment.id}`}
                      checked={isAgreed}
                      onChange={() =>
                        setAgreedIds((prev) => ({
                          ...prev,
                          [payment.id]: !isAgreed,
                        }))
                      }
                      className="mt-0.5 w-4 h-4 text-teal-600 border-teal-300 rounded focus:ring-teal-500 cursor-pointer accent-teal-600"
                    />
                    <label
                      htmlFor={`agree-${payment.id}`}
                      className="text-xs text-teal-900 select-none cursor-pointer leading-relaxed"
                    >
                      Saya menyatakan telah memeriksa dan mencocokkan nominal
                      transfer bank pengirim dengan nominal tagihan secara
                      benar.
                    </label>
                  </div>

                  <div className="mt-5 flex justify-end gap-3">
                    <button
                      disabled={processingId === payment.id}
                      onClick={() => handleVerify(payment.id, "reject")}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak
                    </button>
                    <button
                      disabled={processingId === payment.id || !isAgreed}
                      onClick={() => handleVerify(payment.id, "approve")}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      {processingId === payment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Terima Pembayaran
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
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
    </main>
  );
}
