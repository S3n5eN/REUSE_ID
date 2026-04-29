import { playfair } from "@/app/page";
import Link from "next/link";

export default function HeroSection2() {
  return (
    <section className="py-32 lg:py-48 px-6 lg:px-16 bg-[#007582] text-[#F5F2EB] relative overflow-hidden">
      <div className="grid lg:grid-cols-[55fr_45fr] gap-20 items-center">
        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-[#F5F2EB]/50 font-bold block mb-4">
            PROGRAM PENGHARGAAN
          </label>
          <h2
            className={`${playfair.className} text-4xl lg:text-7xl font-black mb-8 leading-tight`}
          >
            Jadilah Pahlawan Hijau.
          </h2>
          <p className="text-lg text-[#F5F2EB]/80 leading-relaxed mb-10 max-w-lg">
            Setiap barang yang kamu donasikan menghasilkan poin. Ketika poinmu
            mencapai batas tertentu, admin akan mengirimkan sertifikat digital
            eksklusif sebagai bentuk apresiasi kontribusimu.
          </p>
          <Link
            href="/register"
            className="border border-[#F5F2EB]/40 px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#F5F2EB] hover:text-[#007582] transition-all duration-300 inline-block"
          >
            Mulai Donasi
          </Link>
        </div>

        <div className="relative">
          <div className="bg-[#F5F2EB]/5 border border-[#F5F2EB]/20 p-12 lg:p-20 rotate-3 scale-90 lg:scale-100 backdrop-blur-sm relative z-10">
            <div className="border border-[#F5F2EB]/20 p-8 lg:p-12 text-center flex flex-col items-center">
              <span className="text-[8px] lg:text-[10px] tracking-[0.5em] text-[#F5F2EB]/40 font-black mb-8 uppercase">
                Sertifikat Penghargaan
              </span>
              <div className="w-12 h-px bg-[#F5F2EB]/20 mb-10" />
              <span
                className={`${playfair.className} italic text-4xl lg:text-6xl text-[#F5F2EB] mb-6`}
              >
                Pahlawan Hijau
              </span>
              <div className="w-32 h-px bg-[#F5F2EB]/10 mb-6" />
              <span className="text-sm tracking-widest text-[#F5F2EB]/30 font-medium">
                NAMAMU DI SINI
              </span>
              <svg
                className="w-16 h-16 absolute bottom-8 right-8 text-[#F5F2EB]/10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="1.5"
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                />
                <path strokeWidth="1.5" d="M8 12L11 15L16 9" />
              </svg>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full border border-[#F5F2EB]/10 -rotate-3 -z-0" />
        </div>
      </div>
    </section>
  );
}
