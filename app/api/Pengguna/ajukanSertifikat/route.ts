import { protect } from "@/lib/protect";
import { pengguna } from "@/types/pengguna";
import { NextRequest, NextResponse } from "next/server";

// ==== Ini method ajukan sertifikat ====
// ==== untuk route / API yang diprotect sebisa mungkin tetap kasih decoded walau tidak dipakai, biar kosisten aja, karena di protect harusnya nerima decode itu, jadi pakai aja walau sebenernya ga bakal error kalau ga pakai ==== 
async function ajukanSertifikat(req: NextRequest, decoded: { id: string}) {
  try {
    const body: Pick<pengguna, "totalPoin"> = await req.json();

    if (body.totalPoin < 1000) {
      return NextResponse.json(
        { message: "Poin tidak mencukupi untuk mengajukan sertifikat" },
        { status: 400 },
      );
    }

    // ==== Untuk logic sementara begini dulu ====
    return NextResponse.json(
      { message: "Sertifikat berhasil diajukan", bisaDiambil: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saat mengajukan sertifikat:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengajukan sertifikat" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return (await protect(ajukanSertifikat, ["user"]))(req);
}
