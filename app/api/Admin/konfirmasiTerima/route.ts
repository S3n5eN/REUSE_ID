import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

const Poin = {
  SangatBaik: 50,
  Baik: 40,
  CukupBaik: 30,
  Layak: 20,
  CukupLayak: 10,
};

async function konfirmasiTerima(req: NextRequest, decoded: { id: string }) {
  try {
    const { shipmentId, action } = await req.json();

    if (!shipmentId) {
      return NextResponse.json(
        { message: "Shipment ID dibutuhkan" },
        { status: 400 },
      );
    }

    if (!action) {
      return NextResponse.json(
        { message: "Action dibutuhkan" },
        { status: 400 },
      );
    }

    // ==== cek apakah shipment sudah di approve, typenya claim, dan sudah ada jenis pengirimannya ====
    const isShipmenttExist = await prisma.shipment.findFirst({
      where: {
        id: Number(shipmentId),
        status: "Approved",
        type: "claim",
        claimType: { not: null },
      },
      include: { item: true },
    });

    if (!isShipmenttExist) {
      return NextResponse.json(
        { message: "Shipment tidak ditemukan atau belum diapprove" },
        { status: 404 },
      );
    }

    // ==== Cek apakah item sudah ditentukan kualitasnya ====
    if (!isShipmenttExist.item.quality) {
      return NextResponse.json(
        { message: "Kualitas barang belum ditentukan" },
        { status: 400 },
      );
    }

    // ==== Ambil poin berdasarkan kualitas barang ====
    const tambahPoin = Poin[isShipmenttExist.item.quality];

    // ==== update shipment, dan poin user secara bersamaan ====
    if (action === "approve") {
      await prisma.$transaction([
        prisma.shipment.update({
          where: { id: Number(shipmentId) },
          data: {
            status: "Delivered",
            deliveredDate: new Date(),
            adminId: Number(decoded.id),
          },
        }),
        // ==== Tambah poin user berdasarkan kualitas yang sudah ditentukan diatas (tambahPoin) ====
        prisma.user.update({
          where: { id: Number(isShipmenttExist.item.userId) },
          data: { poin: { increment: tambahPoin } },
        }),
      ]);
    } else if (action === "reject") {
      await prisma.$transaction([
        prisma.shipment.delete({
          where: { id: Number(shipmentId)}
        }),
        prisma.item.update({
          where: { id: Number(isShipmenttExist.itemId)},
          data: { status: "Tersedia"}
        })
      ])
    }
    return NextResponse.json(
      {
        message: "Barang berhasil dikonfirmasi diterima",
        poinDiberikan: tambahPoin,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error konfirmasi terima:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat konfirmasi terima" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return (await protect(konfirmasiTerima, ["admin"]))(req);
}
