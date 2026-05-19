"use client";

import { useState, useEffect } from "react";
import SuccessPopup from "@/components/SuccessPopup";
import ErrorPopup from "@/components/ErrorPopup";
import ConfirmPopup from "@/components/ConfirmPopup";

const LockIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function KeamananPage() {
  const [isSending, setIsSending] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [popupSuccess, setPopupSuccess] = useState<string | null>(null);
  const [popupError, setPopupError] = useState<string | null>(null);
  const [showConfirmSend, setShowConfirmSend] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/Pengguna/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const response = await res.json();
        if (res.ok && response.data?.email) {
          setEmail(response.data.email);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const requestSend = () => {
    if (!email) {
      setPopupError("Email tidak ditemukan. Pastikan data profil Anda lengkap.");
      return;
    }
    setShowConfirmSend(true);
  };

  const handleSendEmail = async () => {
    setShowConfirmSend(false);
    setIsSending(true);

    try {
      const res = await fetch("/api/Pengguna/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const response = await res.json();

      if (res.ok) {
        setPopupSuccess("Email reset password berhasil dikirim. Silakan cek kotak masuk Anda.");
      } else {
        setPopupError(response.message || "Gagal mengirim email reset password.");
      }
    } catch (error) {
      console.error("Error sending reset password email:", error);
      setPopupError("Terjadi kesalahan saat memproses permintaan Anda.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-5 md:p-6">
        <div className="flex items-start justify-between mb-3.5">
          <div>
            <h2 className="text-[1.05rem] font-extrabold text-teal-700 mb-0.5">Pengaturan Keamanan</h2>
            <p className="text-[.76rem] text-gray-500">
              Ganti password Anda secara berkala untuk menjaga keamanan akun.
            </p>
          </div>
          <span className="text-gray-400">
            <LockIcon />
          </span>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4 sm:max-w-md">
          <h3 className="text-[.85rem] font-bold text-gray-800 mb-1">Reset Password</h3>
          <p className="text-[.76rem] text-gray-600 mb-4">
            Kami akan mengirimkan link untuk mereset password ke email Anda yang terdaftar 
            {email ? ` (${email})` : ""}.
          </p>

          <button
            onClick={requestSend}
            disabled={isSending || isLoadingProfile || !email}
            className="w-full bg-teal-700 text-white border-none rounded-lg px-6 py-2.5 text-[.83rem] font-bold cursor-pointer transition hover:bg-teal-800 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 font-[inherit]"
          >
            {isSending ? "Mengirim Email..." : isLoadingProfile ? "Memuat..." : "Kirim Link Reset Password"}
          </button>
        </div>
      </div>

      {popupSuccess && (
        <SuccessPopup message={popupSuccess} onClose={() => setPopupSuccess(null)} />
      )}
      {popupError && (
        <ErrorPopup message={popupError} onClose={() => setPopupError(null)} />
      )}
      {showConfirmSend && (
        <ConfirmPopup
          message={`Apakah Anda yakin ingin mengirim link reset password ke email ${email}?`}
          confirmText="Ya, Kirim Email"
          cancelText="Batal"
          type="info"
          onConfirm={handleSendEmail}
          onCancel={() => setShowConfirmSend(false)}
        />
      )}
    </>
  );
}
