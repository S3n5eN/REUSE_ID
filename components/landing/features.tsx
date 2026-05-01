import { playfair } from "@/app/page";

export default function Features() {
  const features = [
    {
      title: "Donasi Barang",
      desc: "Upload foto dan deskripsi barang bekasmu. Barang langsung tayang dan bisa dilihat oleh calon penerima.",
      span: "md:col-span-1 min-h-[20rem]",
      icon: (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      ),
    },
    {
      title: "Cari Barang Gratis",
      desc: "Temukan barang layak pakai dari donatur di sekitarmu. Sepenuhnya gratis tanpa syarat tersembunyi.",
      span: "md:col-span-1 min-h-[20rem]",
      icon: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    },
    {
      title: "Hubungi Donatur Langsung",
      desc: "Chat atau telepon donatur langsung dari aplikasi. Tanya kondisi barang sebelum kamu ambil.",
      span: "md:col-span-1",
      icon: (
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      ),
    },
    {
      title: "Peta Titik Pengumpulan",
      desc: "Lihat titik-titik lokasi pengumpulan barang bekas terdekat dari posisimu.",
      span: "md:col-span-1",
      icon: (
        <>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </>
      ),
    },
    {
      title: "Info Kegiatan Sosial",
      desc: "Pantau event dan kegiatan donasi yang sedang berlangsung di area sekitarmu.",
      span: "md:col-span-2",
      icon: (
        <>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </>
      ),
    },
  ];

  return (
    <section
      id="fitur"
      // UBAH: Tambahkan scroll-mt-24
      className="scroll-mt-24 py-32 lg:py-48 px-6 lg:px-16 border-t border-[#D8D4CC]"
    >
      <div className="max-w-xl mb-20">
        <label className="text-[10px] uppercase tracking-[0.3em] text-[#007582] font-bold block mb-4">
          FITUR PLATFORM
        </label>
        <h2
          className={`${playfair.className} text-4xl lg:text-6xl font-black italic text-[#1A1A18] mb-6`}
        >
          Semua yang kamu butuhkan.
        </h2>
        <p className="text-[#6B6860] leading-relaxed">
          Reuse ID dirancang agar proses donasi semudah dan setransparan mungkin
          bagi semua orang.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-px bg-[#D8D4CC] border border-[#D8D4CC]">
        {features.map((f, i) => (
          <div
            key={i}
            className={`bg-[#fcfcfc] p-10 lg:p-16 hover:-translate-y-1.5 transition-transform duration-500 cursor-default ${f.span}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-[#007582] mb-8"
            >
              {f.icon}
            </svg>
            <h3 className="text-2xl font-bold text-[#1A1A18] mb-4">
              {f.title}
            </h3>
            <p className="text-[#6B6860] leading-relaxed max-w-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
