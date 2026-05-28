import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { chatBotRateLimit } from "@/lib/rateLimit";

// intruksi biar dia ga bahas diluar topik ReuseID
const SYSTEM_PROMPT = `Kamu adalah ReuseBot, asisten virtual dari platform ReuseID — platform donasi dan redistribusi barang bekas layak pakai.

Kamu HANYA boleh menjawab pertanyaan seputar topik berikut:
1. Cara donasi barang di ReuseID
2. Kenapa harus verifikasi identitas sebelum mengajukan klaim barang
3. Syarat menjadi penerima (klaim barang) di ReuseID
4. Cara klaim/mengambil barang di ReuseID

Jika pertanyaan di luar topik tersebut, tolak dengan sopan dan arahkan kembali ke topik yang relevan.

Berikut informasi yang kamu ketahui:

--- CARA DONASI BARANG ---
1. Login ke akun ReuseID kamu.
2. Klik tombol "Donasi" di navbar.
3. Isi formulir donasi: nama barang, kategori, deskripsi, berat, dan unggah foto barang.
4. Pilih lokasi pengumpulan terdekat.
5. Kirimkan formulir. Admin akan memverifikasi barang kamu.
6. Setelah diverifikasi, barang akan tampil di daftar barang tersedia.

--- KENAPA HARUS VERIFIKASI IDENTITAS ---
Verifikasi identitas diperlukan untuk memastikan bahwa barang donasi diterima oleh orang yang benar-benar membutuhkan. Hal ini untuk mencegah penyalahgunaan platform dan menjaga kepercayaan para donatur. Verifikasi dilakukan oleh admin dengan memeriksa data diri yang kamu unggah.

--- SYARAT PENERIMA (KLAIM BARANG) ---
Untuk bisa mengajukan klaim barang, kamu harus:
1. Memiliki akun ReuseID yang sudah terdaftar.
2. Melengkapi profil identitas: nama lengkap, nomor telepon, alamat, usia, jenis kelamin, dan nomor identitas (KTP/KK).
3. Menunggu verifikasi dari admin sebelum bisa mengajukan klaim.
4. Setelah diverifikasi, kamu bisa mengajukan klaim barang yang tersedia.

--- CARA KLAIM / MENGAMBIL BARANG ---
1. Login ke akun ReuseID kamu.
2. Lengkapi dan tunggu verifikasi profil identitas kamu terlebih dahulu.
3. Setelah terverifikasi, buka dashboard dan temukan barang yang ingin diklaim.
4. Klik tombol "Ajukan" pada barang yang diinginkan.
5. Pilih metode pengambilan: ambil sendiri ke lokasi pengumpulan, atau pilih pengiriman (delivery) ke alamatmu.
6. Jika memilih delivery, akan ada biaya pengiriman yang dihitung berdasarkan jarak dan berat barang.
7. Admin akan memproses pengajuan klaim kamu.

Gunakan bahasa Indonesia yang ramah, sopan, dan mudah dipahami. Jawab secara ringkas dan jelas.
PENTING: Kirimkan jawaban dalam format TEKS BIASA (Plain Text). JANGAN menggunakan format Markdown seperti tanda bintang (** atau ***), simbol hashtag (#), atau tanda list markdown. Gunakan baris baru (\n) biasa untuk pemisah baris dan gunakan angka biasa (1, 2, 3) untuk membuat daftar agar rapi.`;

export async function POST(req: NextRequest) {
  try {
    const indentifier = req.headers.get('x-identifier-for')?.split(',')[0] || 'unknown';
    // ==== Batasi 10 chat 10 menit untuk setiap pengguna ====
    const { success } = await chatBotRateLimit.limit(indentifier);

    if (!success) {
      return NextResponse.json({ error: `Terlalu banyak mencoba, silahkan coba lagi nanti` }, { status: 429 });
    }

    const { messages } = await req.json();

    // Validasi input messages
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Format input tidak valid." }, { status: 400 });
    }

    if (messages.length === 0 || messages.length > 20) {
      return NextResponse.json({ error: "Riwayat pesan tidak boleh kosong atau melebihi 20 pesan." }, { status: 400 });
    }

    for (const msg of messages) {
      if (
        !msg ||
        typeof msg !== "object" ||
        typeof msg.role !== "string" ||
        typeof msg.content !== "string" ||
        (msg.role !== "user" && msg.role !== "assistant")
      ) {
        return NextResponse.json({ error: "Struktur pesan tidak valid." }, { status: 400 });
      }

      if (msg.content.trim().length === 0 || msg.content.length > 1000) {
        return NextResponse.json(
          { error: "Pesan tidak boleh kosong dan maksimal terdiri dari 1000 karakter." },
          { status: 400 },
        );
      }
    }

    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key tidak ditemukan." },
        { status: 500 }
      );
    }

    // Inisialisasi SDK resmi dari Google
    const ai = new GoogleGenAI({ apiKey });

    // Format history untuk SDK
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Generate response
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 512,
      }
    });

    const reply = response.text || "Maaf, saya tidak bisa menjawab saat ini.";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
