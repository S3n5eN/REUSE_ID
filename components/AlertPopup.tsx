"use client";
import { useEffect, useState } from "react";
import { Clock, AlertCircle, CheckCircle2, Info } from "lucide-react";

type AlertPopupProps = {
  message: string;
  onClose: () => void;
  type?: "info" | "warning" | "error" | "success";
  title?: string;
};

export default function AlertPopup({ message, onClose, type = "warning", title }: AlertPopupProps) {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("#alert-popup-box") === null) {
        handleClose();
      }
    };
    
    // Memberikan delay kecil agar popup tidak langsung tertutup saat tombol diklik
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 10);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/20 z-[10000] transition-all duration-200
        ${visible ? "opacity-100 backdrop-blur-[2px]" : "opacity-0 pointer-events-none"}`}
    >
      <div
        id="alert-popup-box"
        className={`bg-white p-6 rounded-2xl shadow-2xl text-center max-w-sm w-[90%] transform transition-all duration-200
          ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"} border border-gray-100`}
      >
        <div className={`mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center
          ${type === "error" ? "bg-red-50 text-red-500" : 
            type === "success" ? "bg-green-50 text-green-500" : 
            type === "info" ? "bg-blue-50 text-blue-500" : 
            "bg-amber-50 text-amber-500"}`}
        >
          {type === "error" && <AlertCircle size={28} strokeWidth={2.5} />}
          {type === "success" && <CheckCircle2 size={28} strokeWidth={2.5} />}
          {type === "info" && <Info size={28} strokeWidth={2.5} />}
          {type === "warning" && <Clock size={28} strokeWidth={2.5} />}
        </div>
        
        <h2 className="text-[1.1rem] font-extrabold text-gray-800 mb-2">
          {title || (
            type === "error" ? "Terjadi Kesalahan" : 
            type === "success" ? "Berhasil" : 
            type === "info" ? "Informasi" : 
            "Proses Verifikasi"
          )}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>
        
        <button
          onClick={handleClose}
          className={`w-full py-2.5 rounded-xl text-white font-bold text-sm active:scale-[0.98] transition cursor-pointer shadow-sm
            ${type === "error" ? "bg-red-500 hover:bg-red-600 shadow-red-100" : 
              "bg-[#007582] hover:bg-teal-800 shadow-teal-100"}`}
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
