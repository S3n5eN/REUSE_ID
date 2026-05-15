import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function isVerified(req: NextRequest, decoded: { id: string }) {
  try {
    
    const check = await prisma.userProfile.findFirst({
        where: { userId: Number(decoded.id) },
        select: { isVerified: true }
    })

    if (!check) {
        return NextResponse.json(
            { message: "Akun Anda belum terverifikasi, silahkan lakukan verifikasi data diri terlebih dahulu" },
            { status: 404 }
        );
    }

    return NextResponse.json({
      message: "Berhasil mengambil data profile",
      data: check
    });

  } catch {
    return NextResponse.json(
      { message: "Gagal mengambil profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(isVerified, ["user"]))(req);
}