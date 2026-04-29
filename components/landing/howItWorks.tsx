import { playfair } from "@/app/page";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Daftar & Verifikasi",
      desc: "Buat akun dengan email valid. Identitasmu akan diverifikasi oleh admin sebelum bisa menerima barang.",
    },
    {
      num: "02",
      title: "Unggah atau Cari Barang",
      desc: "Donasikan barang bekasmu dengan foto dan deskripsi lengkap, atau cari barang yang kamu butuhkan dari donatur di sekitarmu.",
    },
    {
      num: "03",
      title: "Jemput atau Kirim",
      desc: "Pilih metode pengambilan — jemput langsung ke lokasi atau via jasa pengiriman dengan biaya ditanggung penerima.",
    },
  ];

  return (
    <section
      id="cara-kerja"
      // UBAH: Tambahkan scroll-mt-24 agar judul tidak tertutup Navbar
      className="scroll-mt-24 py-32 lg:py-48 px-6 lg:px-16 bg-[#F5F2EB]"
    >
      <div className="mb-20">
        <label className="text-[10px] uppercase tracking-[0.3em] text-[#007582] font-bold block mb-4">
          BAGAIMANA CARA KERJANYA
        </label>
        <h2
          className={`${playfair.className} text-4xl lg:text-6xl font-black text-[#1A1A18]`}
        >
          Semudah tiga langkah.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 border-t border-[#D8D4CC] pt-12 gap-12">
        {steps.map((step, i) => (
          <div key={i} className="group cursor-default">
            <span
              className={`${playfair.className} text-8xl lg:text-9xl text-[#E8E4DA] font-black leading-none block mb-4 transition-colors group-hover:text-[#007582]/10`}
            >
              {step.num}
            </span>
            <div className="w-10 h-px bg-[#007582] mb-6" />
            <h3 className="text-xl font-bold text-[#1A1A18] mb-4">
              {step.title}
            </h3>
            <p className="text-[#6B6860] leading-relaxed text-sm lg:text-base">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
