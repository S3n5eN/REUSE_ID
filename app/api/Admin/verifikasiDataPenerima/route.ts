import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function verifikasiDataPenerima(
  req: NextRequest,
  decoded: { id: string },
) {
  try {
    const { shipmentId, action } = await req.json();

    if (!shipmentId || !action) {
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

    const isPending = await prisma.shipment.findFirst({
      where: { id: Number(shipmentId), status: "Pending", type: "claim" },
      include: { userProfile: true },
    });

    if (!isPending) {
      return NextResponse.json(
        { message: "Shipment tidak ditemukan atau bukan dalam status pending" },
        { status: 404 },
      );
    }

    if (!isPending.userProfile) {
      return NextResponse.json(
        { message: "Data Penerima tidak ditemukan" },
        { status: 404 },
      );
    }

    // ==== Kalau approve, update status shipment dan buat user profile penerima jadi verified agar auto approve bisa dipakai ====
    if (action === "Approve") {
      await prisma.$transaction([
        prisma.shipment.update({
          where: { id: Number(shipmentId) },
          data: {
            status: "Approved",
            receivedAt: new Date(),
            adminId: Number(decoded.id),
          },
        }),
        prisma.userProfile.update({
          where: { id: isPending.userProfile.id },
          data: {
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: Number(decoded.id),
          },
        }),
      ]);
      return NextResponse.json(
        { message: "Data penerima berhasil diverifikasi" },
        { status: 200 },
      );
    }

    if (action === "Reject") {
      await prisma.$transaction([
        prisma.shipment.update({
          where: { id: Number(shipmentId) },
          data: {
            status: "Rejected",
            adminId: Number(decoded.id),
          },
        }),
        prisma.item.update({
          where: { id: isPending.itemId},
          data: { status: "Tersedia" }
        })
      ]);
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
