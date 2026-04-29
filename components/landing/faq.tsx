import { playfair } from "@/app/page";

export default function FAQ() {
  const faqs = [
    {
      q: "Apakah Reuse ID benar-benar gratis untuk semua orang?",
      a: "Ya, sepenuhnya gratis. Tidak ada biaya pendaftaran atau biaya tersembunyi. Jika kamu memilih pengiriman via jasa kurir, biaya pengiriman ditanggung oleh penerima — bukan platform.",
    },
    {
      q: "Bagaimana cara memastikan kondisi barang sesuai?",
      a: "Donatur wajib mencantumkan foto dan deskripsi kondisi barang secara jujur. Kamu juga bisa menghubungi donatur langsung melalui fitur chat atau telepon untuk bertanya lebih lanjut sebelum mengambil keputusan.",
    },
    {
      q: "Siapa saja yang bisa mendaftar di Reuse ID?",
      a: "Siapa pun yang memiliki email valid bisa mendaftar. Untuk bisa menerima barang, kamu perlu melengkapi data diri yang akan diverifikasi oleh admin — ini untuk menjaga keamanan dan kepercayaan semua pengguna.",
    },
    {
      q: "Bagaimana proses pengiriman atau pengambilan barang?",
      a: "Ada dua pilihan: jemput langsung ke lokasi donatur atau titik pengumpulan, atau menggunakan jasa pengiriman pilihan kamu dengan biaya ditanggung sendiri.",
    },
    {
      q: "Apakah data pribadi saya akan aman?",
      a: "Data kamu dienkripsi dan hanya digunakan untuk keperluan verifikasi identitas. Kami tidak menjual atau membagikan informasi pribadi ke pihak mana pun.",
    },
  ];

  return (
    <section
      id="faq"
      // UBAH: Tambahkan scroll-mt-24
      className="scroll-mt-24 py-32 lg:py-48 px-6 lg:px-16 border-b border-[#D8D4CC]"
    >
      <div className="max-w-2xl mx-auto">
        <label className="text-[10px] uppercase tracking-[0.3em] text-[#007582] font-bold block mb-4 text-center">
          PERTANYAAN UMUM
        </label>
        <h2
          className={`${playfair.className} text-4xl lg:text-6xl font-black text-[#1A1A18] text-center mb-20`}
        >
          Ada yang ingin kamu tanyakan?
        </h2>

        <div className="space-y-0">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group border-t border-[#D8D4CC] last:border-b py-8 overflow-hidden"
            >
              <summary className="flex justify-between items-center cursor-pointer list-none list-inside">
                <h3 className="text-lg lg:text-xl font-bold text-[#1A1A18] group-hover:text-[#007582] transition-colors">
                  {faq.q}
                </h3>
                <span className="text-2xl text-[#6B6860] group-open:rotate-45 transition-transform duration-300">
                  +
                </span>
              </summary>
              <div className="pt-6 text-[#6B6860] leading-relaxed text-base">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
