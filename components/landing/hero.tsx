import Link from "next/link";
import { playfair } from "@/app/page";

export default function Hero() {
  return (
    <section className="min-h-screen grid lg:grid-cols-[65fr_35fr] items-center px-6 lg:px-16 py-20 lg:py-0 relative overflow-hidden">
      <div className="animate-[fadeUp_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
        <label className="text-[10px] lg:text-xs uppercase tracking-[0.2em] text-[#007582] font-semibold mb-6 block">
          Platform Donasi Barang Bekas · Gratis & Terverifikasi
        </label>
        <h1
          className={`${playfair.className} font-black text-5xl md:text-7xl xl:text-8xl leading-[1.1] text-[#1A1A18] mb-8`}
        >
          Barang Bekasmu,
          <br />
          <span className="italic">Berkah</span> untuk
          <br />
          Sesama.
        </h1>
        <p className="text-lg text-[#6B6860] max-w-md leading-relaxed mb-10 [animation-delay:100ms] animate-[fadeUp_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
          Reuse ID menghubungkan donatur dan penerima barang bekas layak pakai.
          Gratis, transparan, dan tanpa transaksi uang.
        </p>
        <div className="flex flex-wrap gap-4 [animation-delay:200ms] animate-[fadeUp_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
          <Link
            href="/register"
            className="bg-[#1A1A18] text-[#F5F2EB] px-8 py-4 text-sm font-medium hover:bg-[#007582] transition-colors"
          >
            Daftar Sekarang
          </Link>
          <Link
            href="/login"
            className="border border-[#1A1A18] bg-transparent px-8 py-4 text-sm font-medium hover:bg-[#1A1A18] hover:text-[#F5F2EB] transition-colors"
          >
            Sudah Punya Akun? Masuk
          </Link>
        </div>
      </div>

      <div className="hidden lg:block relative h-full min-h-[500px]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-[#007582] animate-[spinSlow_30s_linear_infinite]" />
        <div className="absolute top-1/4 right-1/3 w-6 h-6 bg-[#007582] animate-[float_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 left-1/4 w-32 h-32 rounded-full border border-[#D8D4CC] animate-[float_5s_ease-in-out_infinite_1s]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] tracking-[0.4em] text-[#D8D4CC] font-bold">
          REUSE · REDUCE · RECYCLE
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="absolute bottom-0 left-0 w-full border-y border-[#007582] bg-[#92b5b9] py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] gap-12 text-[10px] tracking-[0.3em] text-[#eeeeee] font-bold uppercase">
          <span>
            Donasi · Reuse · Berbagi · Peduli · Lingkungan · Gratis ·
            Terverifikasi ·{" "}
          </span>
          <span>
            Donasi · Reuse · Berbagi · Peduli · Lingkungan · Gratis ·
            Terverifikasi ·{" "}
          </span>
          <span>
            Donasi · Reuse · Berbagi · Peduli · Lingkungan · Gratis ·
            Terverifikasi ·{" "}
          </span>
          <span>
            Donasi · Reuse · Berbagi · Peduli · Lingkungan · Gratis ·
            Terverifikasi ·{" "}
          </span>
        </div>
      </div>
    </section>
  );
}
