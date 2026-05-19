"use client";
import { useEffect, useState } from "react";

type ConfirmPopupProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
};

export default function ConfirmPopup({
  message,
  onConfirm,
  onCancel,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = "warning"
}: ConfirmPopupProps) {
  const [visible, setVisible] = useState(true);

  const handleClose = (action: () => void) => {
    setVisible(false);
    setTimeout(action, 200); 
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/20 z-[10000] transition-all duration-200
        ${visible ? "opacity-100 backdrop-blur-[2px]" : "opacity-0 pointer-events-none"}`}
    >
      <div
        className={`bg-white p-6 rounded-2xl shadow-2xl text-center max-w-sm w-[90%] transform transition-all duration-200
          ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"} border border-gray-100`}
      >
        <div className={`mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center
          ${type === "danger" ? "bg-red-50 text-red-500" : "bg-yellow-50 text-yellow-600"}`}
        >
          {type === "danger" ? (
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        
        <h2 className="text-[1.1rem] font-extrabold text-gray-800 mb-2">Konfirmasi Tindakan</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={() => handleClose(onCancel)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 active:scale-[0.98] transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => handleClose(onConfirm)}
            className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm active:scale-[0.98] transition cursor-pointer shadow-sm
              ${type === "danger" ? "bg-red-500 hover:bg-red-600 shadow-red-100" : "bg-teal-700 hover:bg-teal-800 shadow-teal-100"}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
