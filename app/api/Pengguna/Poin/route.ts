import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

// ==== Ini method ambil semua poin pengguna =====
export async function getPoin(decoded: { id: string }) {
  // ==== ini tinggal query ambil poin pengguna berdasarkan id decoded.id aja ===
  try {
    const isExist = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
    });

    if (!isExist) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan" },
        { status: 404 },
      );
    }

    const poinPengguna = await prisma.user.findFirst({
      where: { id: Number(decoded.id) },
      select: { poin: true },
    });

    return NextResponse.json(
      {
        totalPoin: poinPengguna,
        message: "Poin pengguna berhasil diambil",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saat mengambil poin pengguna:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil poin pengguna" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getPoin, ["user"]))(req);
}
