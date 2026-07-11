<div align="center">

# Reuse ID

### Platform Donasi Barang Bekas — Gratis & Terverifikasi

<br />

![TypeScript](https://img.shields.io/badge/TYPESCRIPT-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/REACT_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/NEXT.JS_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TAILWIND_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/PRISMA-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/POSTGRESQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
<br />
![Redis](https://img.shields.io/badge/REDIS-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Google Gemini](https://img.shields.io/badge/GEMINI_AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Leaflet](https://img.shields.io/badge/LEAFLET-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Nodemailer](https://img.shields.io/badge/NODEMAILER-22B573?style=for-the-badge&logo=minutemailer&logoColor=white)

</div>

<br />

## Tentang Project

**Reuse ID** adalah platform web yang menghubungkan donatur dan penerima barang bekas layak pakai secara **gratis, transparan, dan tanpa transaksi uang**. Platform ini menyediakan ekosistem lengkap mulai dari pendaftaran, verifikasi identitas, upload barang donasi, pencarian barang, hingga pengiriman — semua dalam satu aplikasi.

Reuse ID hadir dengan dua sisi: **Dashboard Pengguna** untuk donatur dan penerima, serta **Panel Admin** untuk pengelolaan lokasi pengumpulan, verifikasi penerima, manajemen rak gudang, dan moderasi konten berita.

<br />

## Masalah yang Diselesaikan

| Masalah | Solusi Reuse ID |
|---|---|
| **Barang bekas layak pakai terbuang sia-sia** | Menyediakan platform untuk mendonasikan barang bekas agar bisa dimanfaatkan kembali oleh orang lain yang membutuhkan |
| **Tidak ada wadah terpercaya untuk donasi barang** | Proses verifikasi identitas oleh admin memastikan setiap penerima dan donatur adalah orang yang terverifikasi |
| **Sulitnya mencocokkan donatur dengan penerima** | Fitur pencarian barang berdasarkan kategori dan lokasi memudahkan penerima menemukan barang yang dibutuhkan |
| **Proses distribusi barang donasi tidak transparan** | Sistem tracking pengiriman dan penilaian kualitas barang menjaga transparansi seluruh proses |
| **Kurangnya kesadaran masyarakat tentang reuse** | Fitur berita dan informasi kegiatan sosial membantu edukasi dan meningkatkan kesadaran masyarakat |

<br />

## Fitur Utama

### Sisi Pengguna (Donatur & Penerima)
- **Donasi Barang** — Upload foto, deskripsi, dan kategori barang bekas untuk didonasikan
- **Cari Barang Gratis** — Temukan barang layak pakai dari donatur di sekitar lokasi pengguna
- **Profil & Verifikasi Identitas** — Lengkapi profil dengan KTP agar bisa diverifikasi oleh admin
- **Peta Lokasi Pengumpulan** — Lihat titik-titik gudang penyaluran terdekat melalui peta interaktif (Leaflet)
- **Pengiriman Barang** — Pilih jemput langsung atau kirim via jasa pengiriman dengan sistem pembayaran terintegrasi
- **Sertifikat Donasi** — Dapatkan sertifikat digital sebagai bukti apresiasi atas kontribusi donasi
- **Sistem Poin** — Kumpulkan poin dari aktivitas donasi sebagai bentuk gamifikasi
- **Berita & Info Sosial** — Baca berita dan update kegiatan sosial terkait donasi
- **AI Chatbot (ReuseBot)** — Asisten berbasis Google Gemini AI untuk menjawab pertanyaan seputar platform

### Sisi Admin
- **Dashboard Statistik** — Pantau total pengguna, barang, pengiriman melalui grafik (Chart.js)
- **Kelola Barang** — Review, approve, atau tolak barang yang diupload oleh pengguna
- **Kelola Lokasi & Rak** — Manajemen gudang penyaluran beserta rak penyimpanan dan kapasitasnya
- **Verifikasi Penerima** — Verifikasi identitas calon penerima barang sebelum bisa menerima donasi
- **Konfirmasi Pengiriman** — Approve dan tracking proses pengiriman barang
- **Verifikasi Pembayaran** — Verifikasi bukti transfer untuk pengiriman berbayar
- **Kelola Berita** — Buat dan publish berita/informasi kegiatan sosial

<br />

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Bahasa** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animasi** | [Framer Motion](https://www.framer.com/motion/) |
| **ORM** | [Prisma 7](https://www.prisma.io/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **Autentikasi** | [Jose](https://github.com/panva/jose) (JWT) + [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| **AI Chatbot** | [Google Gemini AI](https://ai.google.dev/) (`@google/genai`) |
| **Peta Interaktif** | [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/) |
| **Grafik** | [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/) |
| **Email** | [Nodemailer](https://nodemailer.com/) |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/) + Ratelimit |
| **Image Processing** | [Sharp](https://sharp.pixelplumbing.com/) |

<br />

## Database Schema

Aplikasi menggunakan **PostgreSQL** dengan **Prisma ORM**. Berikut model-model data utama:

| Model | Deskripsi |
|---|---|
| **User** | Pengguna platform yang dapat mendonasikan atau menerima barang, memiliki sistem poin |
| **Admin** | Administrator yang mengelola lokasi, verifikasi penerima, dan moderasi barang & berita |
| **Place** | Lokasi gudang penyaluran barang dengan data koordinat, manajer, dan jam operasional |
| **Rak** | Rak penyimpanan di dalam gudang dengan kapasitas maksimum dan kapasitas terpakai |
| **Item** | Barang donasi dengan status: `PendingApproval`, `Tersedia`, `Diambil`, `Ditolak` dan kualitas: `SangatBaik` — `CukupLayak` |
| **Shipment** | Pengiriman barang dengan tracking status (`Pending`, `Approved`, `Delivered`) dan sistem pembayaran transfer |
| **Certificate** | Sertifikat digital apresiasi yang diterbitkan untuk donatur |
| **UserProfile** | Profil lengkap pengguna (KTP, alamat, koordinat) untuk verifikasi identitas oleh admin |
| **News** | Berita dan informasi kegiatan sosial yang dibuat oleh admin |
| **NewsRead** | Tracking berita yang sudah dibaca oleh pengguna |
| **PasswordReset** | Token reset password dengan masa kedaluwarsa |

<br />

## Kontributor

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Xuerns">
        <img src="https://github.com/Xuerns.png" width="100px;" alt="Xuerns" style="border-radius: 50%;" /><br />
        <sub><b>Xuerns</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/S3n5eN">
        <img src="https://github.com/S3n5eN.png" width="100px;" alt="S3n5eN" style="border-radius: 50%;" /><br />
        <sub><b>S3n5eN</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/gln15">
        <img src="https://github.com/gln15.png" width="100px;" alt="Glen" style="border-radius: 50%;" /><br />
        <sub><b>Glen</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/meynezaari">
        <img src="https://github.com/meynezaari.png" width="100px;" alt="meynezaari" style="border-radius: 50%;" /><br />
        <sub><b>meynezaari</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Rama-99">
        <img src="https://github.com/Rama-99.png" width="100px;" alt="Rama_99" style="border-radius: 50%;" /><br />
        <sub><b>Rama_99</b></sub>
      </a>
    </td>
  </tr>
</table>

<br />

<div align="center">

---

**Reuse ID** — *Barang Bekasmu, Berkah untuk Sesama.* 

</div>
