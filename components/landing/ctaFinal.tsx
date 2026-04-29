import { playfair } from "@/app/page";
import Link from "next/link";

export default function CTAFinal() {
  return (
    <section className="py-40 px-6 bg-[#1A1A18] text-center">
      <h2
        className={`${playfair.className} text-5xl md:text-8xl font-black text-[#F5F2EB] mb-8`}
      >
        Siap memulai?
      </h2>
      <p className="text-xl text-[#9B9890] mb-12 max-w-xl mx-auto">
        Bergabung dengan Reuse ID dan jadilah bagian dari gerakan reuse culture.
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        <Link
          href="/register"
          className="bg-[#F5F2EB] text-[#1A1A18] px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-[#007582] hover:text-[#F5F2EB] transition-all duration-300"
        >
          Daftar Sekarang — Gratis
        </Link>
        <Link
          href="/login"
          className="border border-[#F5F2EB]/20 text-[#F5F2EB] px-10 py-5 text-sm font-black uppercase tracking-widest hover:border-[#F5F2EB] transition-all duration-300"
        >
          Sudah Punya Akun
        </Link>
      </div>
    </section>
  );
}
