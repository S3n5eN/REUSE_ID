import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/Logo/Logo.svg"

export default function Navbar() {
  return (
     <nav className="sticky top-0 z-50 bg-[#fafafa] backdrop-blur-sm border-b border-[#D8D4CC] px-6 lg:px-16 py-4 flex justify-between items-center">
    {/* Berikan ukuran spesifik atau persentase pada parent */}
    <div className=" flex items-center justify-center relative h-10 w-32">
      <Image src={Logo} alt="Logo ReuseID" className="object-contain" />
    </div>

    <div className="hidden lg:flex items-center gap-8">
      <div className="flex gap-6 text-sm font-medium text-[#1A1A18]">
        {/* UBAH: Menggunakan tag <a> biasa untuk anchor link agar smooth scroll berfungsi */}
        <a
          href="#cara-kerja"
          className="hover:underline underline-offset-4 transition-all"
        >
          Cara Kerja
        </a>
        <a
          href="#fitur"
          className="hover:underline underline-offset-4 transition-all"
        >
          Fitur
        </a>
        <a
          href="#faq"
          className="hover:underline underline-offset-4 transition-all"
        >
          FAQ
        </a>
      </div>
      <div className="h-4 border-r border-[#D8D4CC]" />
      <div className="flex items-center gap-4">
        {/* TETAP gunakan <Link> untuk pindah halaman */}
        <Link
          href="/login"
          className="text-sm font-medium hover:text-[#007582] transition-colors"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="border border-[#1A1A18] px-4 py-1.5 text-sm font-medium hover:bg-[#1A1A18] hover:text-[#F5F2EB] transition-colors"
        >
          Daftar
        </Link>
      </div>
    </div>
    <div className="lg:hidden">
      <Link
        href="/register"
        className="border border-[#1A1A18] px-3 py-1 text-xs font-medium hover:bg-[#1A1A18] hover:text-[#F5F2EB] transition-colors"
      >
        Daftar
      </Link>
    </div>
  </nav>
  )
}
