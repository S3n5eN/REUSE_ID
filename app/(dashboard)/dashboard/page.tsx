"use client";

import Link from "next/link";
import ProfileDropdown from "@/components/Pengguna/profileDropdown";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/public/Logo/Logo.svg";

type Item = {
  id: number;
  name: string;
  category: string;
  description: string;
  imageURL: string;
  status: string;
  placeId: number;
};

export default function DashboardPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [penggunaName, setPenggunaName] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [fetchingItems, setFetchingItems] = useState(true);

  const router = useRouter();

  const getPenggunaName = async () => {
    try {
      const res = await fetch("/api/Pengguna");
      const data = await res.json();
      setPenggunaName(data.name);
    } catch (error) {
      console.error("Error fetching pengguna name:", error);
    }
  };

  const getItems = async () => {
    setFetchingItems(true);
    try {
      const res = await fetch("/api/Barang/getItem");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setFetchingItems(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    getPenggunaName();
    getItems();
  }, []);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* NAVBAR */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#fafafa] shadow-sm">
        <div className="flex items-center justify-center relative h-10 w-32">
          <Image src={Logo} alt="Logo ReuseID" className="object-contain" />
        </div>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700 items-center">
          <a href="#" className="hover:text-teal-600 transition-colors">Cara Donasi</a>
          <a href="#" className="hover:text-teal-600 transition-colors">Penyaluran</a>
          <a href="#" className="hover:text-teal-600 transition-colors">Tentang Kami</a>
          <button className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition-colors">
            <Link href="dashboard/form/tambahBarang">Donasi</Link>
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <input
            placeholder="Search here..."
            className="border border-gray-300 bg-white px-3 py-1 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8 relative rounded-full object-cover cursor-pointer bg-cyan-300 flex items-center justify-center text-white font-bold"
          >
            {penggunaName.charAt(0)}
            {isOpen && (
              <ProfileDropdown
                namapengguna={penggunaName}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden">
        <div className="grid grid-cols-2 h-full">
          <img
            src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800"
            alt="Donasi"
            className="w-full h-full object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800"
            alt="Komunitas"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/85 to-teal-600/75 flex flex-col items-center justify-center text-white text-center px-10">
          <h1 className="text-4xl md:text-6xl font-bold">DONASI</h1>
          <h2 className="text-2xl md:text-4xl font-semibold">BARANG BEKAS</h2>
          <div className="mt-4 inline-block bg-orange-400 text-black px-4 py-2 rounded-full font-semibold">
            BERBAGI UNTUK SESAMA
          </div>
          <p className="mt-4 text-sm md:text-base">
            PAKAIAN • BUKU • MAINAN • PERALATAN
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Rekomendasi Barang:</h2>

        {fetchingItems ? (
          <p className="text-sm text-gray-400">Memuat barang...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada barang tersedia.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-col"
              >
                <img
                  src={item.imageURL}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded-md"
                />
                <h3 className="font-semibold mt-2 text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-500">Kategori: {item.category}</p>
                <p className="text-sm text-gray-500">Status: {item.status}</p>

                <button className="mt-3 w-full bg-teal-600 text-white py-1.5 rounded-lg text-sm hover:bg-teal-700 transition-colors">
                  Hubungi Pemilik
                </button>

                <div className="mt-2 flex justify-center">
                  <Link
                    href={`/dashboard/konfirmasi?name=${encodeURIComponent(item.name)}&lokasi=${encodeURIComponent(item.placeId)}&img=${encodeURIComponent(item.imageURL)}`}
                    className="bg-green-500 text-white px-5 py-1.5 rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    Ajukan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}