import { playfair } from "@/app/page";

export default function Footer() {
  return (
    <footer className="bg-[#1A1A18] border-t border-[#F5F2EB]/10 px-6 lg:px-16 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
      <span
        className={`${playfair.className} italic text-2xl font-black text-[#F5F2EB]`}
      >
        Reuse ID
      </span>
      <p className="text-[10px] tracking-[0.2em] text-[#9B9890] uppercase font-bold">
        © 2025 Reuse ID · Dibuat dengan niat baik.
      </p>
    </footer>
  );
}
