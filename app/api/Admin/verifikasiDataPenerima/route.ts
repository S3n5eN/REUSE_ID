import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function verifikasiDataPenerima(
  req: NextRequest,
  decoded: { id: string },
) {
  try {
    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }, 
      );
    }

    if (!["Approve", "Reject"].includes(action)) {
      return NextResponse.json(
        { message: "Action tidak valid" },
        { status: 400 },
      );
    }

    // ==== Kalau approve, update status shipment dan buat user profile penerima jadi verified agar auto approve bisa dipakai ====
    if (action === "Approve") {
      await prisma.userProfile.update({
          where: { id: Number(userId) },
          data: {
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: Number(decoded.id),
          },
        });
      return NextResponse.json(
        { message: "Data penerima berhasil diverifikasi" },
        { status: 200 },
      );
    }

    if (action === "Reject") {
      await prisma.userProfile.delete({
        where: { id: Number(userId) },
      });
      return NextResponse.json(
        { message: "Data penerima ditolak" },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error verifikasi data penerima:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return (await protect(verifikasiDataPenerima, ["admin"]))(req);
}
