"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

type ErrorPopupProps = {
  message: string;
  onClose: () => void;
};

export default function ErrorPopup({ message, onClose }: ErrorPopupProps) {
  const [visible, setVisible] = useState(true);

  // Tutup popup kalau user klik di luar kotak
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("#error-popup-box") === null) {
        setVisible(false);
        setTimeout(onClose, 300); // delay sesuai durasi fadeOut
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/10 z-50
        ${visible ? "animate-fadeIn" : "animate-fadeOut"}`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full"
      >
        <Image
          src="/silang.png"
          alt="Error"
          width={80}
          height={80}
          className="mx-auto mb-4"
        />
        <h2 className="text-xl font-bold text-red-600 mb-2">{message}</h2>
      </div>
    </div>
  );
}
