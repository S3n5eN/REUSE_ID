"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

type SuccessPopupProps = {
  message: string;
  onClose: () => void;
};

export default function SuccessPopup({ message, onClose }: SuccessPopupProps) {
  const [visible, setVisible] = useState(true);
  // Tutup popup kalau user klik di luar kotak
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("#popup-box") === null) {
        setVisible(false);
        setTimeout(onClose, 300);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  // Tutup popup secara otomatis setelah 5 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black/10 z-50
        ${visible ? "animate-fadeIn" : "animate-fadeOut"}`}>

      <div
        id="popup-box"
        className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full transform animate-slideDown"
      >
        <Image
          src="/package.png"
          alt="Success"
          width={80}
          height={80}
          className="mx-auto mb-4"
        />
        <h2 className="text-xl font-bold text-teal-800 mb-2">{message}</h2>
      </div>
    </div>
  );
}
