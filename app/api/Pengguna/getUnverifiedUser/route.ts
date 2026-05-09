import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getUnverifiedUser() {
  try {
    const unverifiedUsers = await prisma.userProfile.findMany({
      where: { isVerified: false },
      include: {
        shipment: { where: { status: "Pending", type: "claim" }, select: { id: true}, take: 1}, 
      },
      
    });
    return NextResponse.json({message: "Berhasil mengambil pengguna yang belum diverifikasi", data: unverifiedUsers }, { status: 200 });
  } catch (error) {
    console.error("Error mengambil pengguna yang belum diverifikasi:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengguna yang belum diverifikasi" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getUnverifiedUser, ["admin"]))(req);
}