"use client";
import Image from "next/image";
import { useEffect } from "react";

type SuccessPopupProps = {
  message: string;
  onClose: () => void;
};

export default function SuccessPopup({ message, onClose }: SuccessPopupProps) {
  // Tutup popup kalau user klik di luar kotak
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("#popup-box") === null) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/10 bg-opacity-50 z-50">
      <div
        id="popup-box"
        className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full transform animate-slideDown"
      >
        <Image
          src="/check.png"
          alt="Success"
          width={80}
          height={80}
          className="mx-auto mb-4"
        />
        <h2 className="text-xl font-bold text-green-600 mb-2">{message}</h2>
      </div>
    </div>
  );
}
