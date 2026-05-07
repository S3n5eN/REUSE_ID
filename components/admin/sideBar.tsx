"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  MapPin,
  UserPen,
  Newspaper
} from "lucide-react";
import Link from "next/link";
import Logo from "@/public/Logo/Logo.svg";
import Image from "next/image";
interface SubMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  to: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  to?: string;
  children?: SubMenuItem[];
}

// ==== Kalau ada menu tambahan bisa tambah di sini ==== //
const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    to: "/admin/dashboard",
  },
  {
    id: "daftar-barang",
    label: "Daftar Barang",
    icon: <Package size={18} />,
    to: "/admin/dashboard/DaftarBarang",
  },
  {
    id: "penerima",
    label: "Penerima",
    icon: <Users size={18} />,
    children: [
      {
        id: "verifikasi-penerima",
        label: "Verifikasi Penerima",
        icon: <ShieldCheck size={15} />,
        to: "/admin/dashboard/verifikasiPenerima",
      },
      {
        id: "konfirmasi-penerima",
        label: "Konfirmasi Penerima",
        icon: <UserPen size={15} />,
        to: "/admin/dashboard/konfirmasiPenerima",
      },
    ],
  },
  {
    id: "kelola-lokasi",
    label: "Kelola Lokasi",
    icon: <MapPin size={18} />,
    to: "/admin/dashboard/kelolaLokasi",
  }, {
    id: "kelola-Berita",
    label: "Kelola Berita",
    icon: <Newspaper size={18} />,
    to: "/admin/dashboard/kelolaBerita",
  }
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [adminName, setAdminName] = useState("");

  // ==== buat Logout ====
  const toggleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  const takeInfoAdmin = async () => {
    try {
        const res = await fetch("/api/Pengguna");
        if (res.ok) {
            const data = await res.json();
            setAdminName(data.name);
        }
    } catch (error) {
        console.error("Gagal mengambil info admin:", error);
    }
  }

  useEffect(() => {
    takeInfoAdmin();
    document.body.classList.toggle("sb-open", isOpen);
    document.body.classList.toggle("sb-closed", !isOpen);
  }, [isOpen]);

  useEffect(() => {
    document.body.classList.add("sb-open");
  }, []);

  const toggle = () => {
    setIsOpen((p) => {
      if (p) setExpandedMenus([]);
      return !p;
    });
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      if (!isOpen) {
        setIsOpen(true);
        setExpandedMenus([item.id]);
      } else {
        setExpandedMenus((p) =>
          p.includes(item.id)
            ? p.filter((m) => m !== item.id)
            : [...p, item.id],
        );
      }
    } else {
      setActiveMenu(item.id);
    }
  };

  return (
    <>
      {/* ==== Overlay buat HP ==== */}
      {isOpen && (
        <div
          onClick={toggle}
          className="fixed inset-0 z-99 bg-black/40 md:hidden"
        />
      )}

      {/* ==== untuk HP ==== */}
      <button
        onClick={toggle}
        className="fixed top-4 left-4 z-101 md:hidden flex items-center justify-center
                   w-10 h-10 rounded-xl bg-white border border-gray-200
                   text-[#1a7a6e] shadow-sm"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* ==== SIDEBAR ==== */}
      <aside className={`sb-sidebar ${!isOpen ? "sb-sidebar--closed" : ""}`}>
        {/* Tempat Logo ReuseID */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 shrink-0">
          <div className={` ${isOpen ? "flex" : "hidden"} items-center gap-2.5 overflow-hidden`}>
            <Image src={Logo} alt="Logo ReuseID" width={150} />
          </div>
          <button
            onClick={toggle}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                       text-gray-400 hover:text-[#1a7a6e] hover:bg-[#e6f4f2]
                       border border-gray-200 transition-colors duration-200"
          >
            {isOpen ? <ChevronRight size={14} /> : <Menu size={14} />}
          </button>
        </div>

        {/* ==== Profile buat Admin ==== */}
        <div className="relative flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 shrink-0 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-[#1a7a6e] rounded-r-sm shrink-0" />
          <div
            className="w-10 h-10 rounded-xl bg-[#1a7a6e] flex items-center justify-center shrink-0
                          text-white font-bold text-sm shadow-md shadow-teal-100"
          >
            AR
          </div>
          <div className="sb-fade-text overflow-hidden min-w-0">
            <p className="text-[13px] font-semibold text-gray-800 whitespace-nowrap truncate leading-tight m-0">
              {adminName}
            </p>
            <p className="text-[10px] font-semibold text-[#1a7a6e] tracking-widest uppercase mt-0.5 m-0">
              Admin
            </p>
          </div>
        </div>

        {/* ==== Navigasi ==== */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3">
          <p className="sb-fade-text text-[9px] font-bold tracking-[2.5px] text-gray-300 uppercase px-2 pb-2.5 m-0">
            Menu Utama
          </p>

          {menuItems.map((item) => (
            <div key={item.id} className="sb-tooltip-wrap">
              <div
                onClick={() => handleMenuClick(item)}
                className={`
                  sb-menu-item flex items-center gap-3  rounded-xl
                  cursor-pointer mb-0.5 relative transition-all duration-200
                  ${
                    activeMenu === item.id && !item.children
                      ? "bg-[#1a7a6e] text-white shadow-sm shadow-teal-200"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }
                `}
              >
                <Link
                  href={`${item.to || "#"}`}
                  className="flex items-center gap-3 w-full px-3 py-2.5"
                >
                  <span className="shrink-0 w-4.5 flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="sb-fade-text text-sm font-medium flex-1 whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                  {item.children && (
                    <ChevronDown
                      size={13}
                      className={`sb-fade-text shrink-0 transition-transform duration-200
                      ${expandedMenus.includes(item.id) ? "rotate-180" : ""}`}
                    />
                  )}
                </Link>
              </div>

              <span className="sb-tooltip">{item.label}</span>

              {/* ==== Submenu — disembunyikan saat sidebar closed ==== */}
              {item.children && isOpen && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out
                    ${
                      expandedMenus.includes(item.id)
                        ? "max-h-40 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                >
                  {item.children.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => setActiveMenu(child.id)}
                      className={`
                        sb-sub-item relative flex items-center gap-2
                        pl-11 pr-3 rounded-lg cursor-pointer text-[13px] mb-0.5
                        transition-all duration-200
                        ${
                          activeMenu === child.id
                            ? "bg-[#e6f4f2] text-[#0f5c53] font-semibold"
                            : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                        }
                      `}
                    >
                      <Link
                        href={`${child.to}`}
                        className="flex items-center gap-2 w-full py-2"
                      >
                        <span className="shrink-0">{child.icon}</span>
                        <span className="whitespace-nowrap">{child.label}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ==== Footer ==== */}
        <div className="px-2.5 pt-2 pb-4 border-t border-gray-100 shrink-0">
          <p className="sb-fade-text text-[10px] text-gray-300 px-3 pb-2 whitespace-nowrap m-0">
            ReuseID · v1.0.0
          </p>
          <div className="sb-tooltip-wrap">
            <button onClick={toggleLogout} className="w-full">
              <div
                onClick={() => console.log("Logout")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                         text-gray-400 border border-transparent transition-all duration-200
                         hover:bg-red-50 hover:text-red-500 hover:border-red-100"
              >
                <span className="shrink-0 w-4.5 flex items-center justify-center">
                  <LogOut size={16} />
                </span>
                <span className="sb-fade-text text-sm font-medium whitespace-nowrap">
                  Keluar
                </span>
              </div>
              <span className="sb-tooltip">Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
