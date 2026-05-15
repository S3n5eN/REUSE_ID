import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function claimBarang(req: NextRequest, decoded: { id: string }) {
  try {
    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { message: "Item ID diperlukan" },
        { status: 400 },
      );
    }

    const userProfile = await prisma.userProfile.findFirst({
      where: { userId: Number(decoded.id) },
    });

    if (!userProfile) {
      return NextResponse.json(
        { message: "Kamu belum terverifikasi, silahkan lakukan verifikasi data diri terlebih dahulu" },
        { status: 404 }
      );
    }

    const userProfileId = userProfile.id;
    let shipment;

    await prisma.$transaction(async (tx) => {
      const item = await tx.item.findFirst({
        where: { id: Number(itemId), status: "Tersedia" },
      })

      if (!item) throw new Error("Item tidak ditemukan atau tidak tersedia");

      await tx.item.update({
        where: { id: Number(itemId) },
        data: { status: "Diambil"}
      })

      shipment = await tx.shipment.create({
        data: {
          userId: Number(decoded.id),
          itemId: Number(itemId),
          type: "claim",
          userProfileId: userProfileId,
          isAutoApproved: userProfile.isVerified,
          status: "Pending",
          adminId: null
        }
      })
    }) 

    return NextResponse.json(
      {
        message: userProfile.isVerified
          ? "Barang berhasil diklaim dan langsung disetujui"
          : "Barang berhasil diklaim, menunggu verifikasi admin",
          data: shipment
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengklaim barang" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
    return (await protect(claimBarang, ["user"]))(req);
}