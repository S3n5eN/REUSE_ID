import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getPenggunaByClaimType() {
  try {
    const penggunaByClaimType = await prisma.userProfile.findMany({
      where: {
        shipment: { some: { type: { not: undefined }, status: "Approved" } },
      },
      include: {
        shipment: { where: { type: { not: undefined }, status: "Approved" }, select: { id: true, type: true } },
      },
    });
    return NextResponse.json({message: "Berhasil mengambil pengguna berdasarkan tipe klaim", data: penggunaByClaimType }, { status: 200 });
  } catch (error) {
    console.error("Error mengambil pengguna berdasarkan tipe klaim:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengguna berdasarkan tipe klaim" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
    return (await protect(getPenggunaByClaimType, ["admin"]))(req);
}