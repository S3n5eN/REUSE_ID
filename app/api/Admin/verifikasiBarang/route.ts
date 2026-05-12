import { ItemQuality } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function verifikasiBarang(req: NextRequest, decoded: { id: string }) {
  try {
    const { shipmentId, quality, action, rakId } = await req.json();

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
      where: {
        id: Number(shipmentId),
        status: "Pending",
        type: "Donation",
      },
    });

    if (!isPending) {
      return NextResponse.json(
        { message: "Shipment tidak ditemukan atau bukan dalam status pending" },
        { status: 404 },
      );
    }

    if (action === "Approve") {
      if (!quality) {
        return NextResponse.json(
          { message: "Kualitas barang harus diisi saat approve" },
          { status: 400 },
        );
      }

      const rak = await prisma.rak.findUnique({
        where: { id: Number(rakId) },
      });

      if (rak?.kapasitasSekarang === rak?.kapasitasMax) {
        return NextResponse.json(
          { message: "Rak sudah penuh, pilih rak lain" },
          { status: 400 },
        );
      }
      
      const shipment = await prisma.shipment.update({
        where: { id: Number(shipmentId) },
        data: {
          status: "Approved",
          receivedAt: new Date(),
          adminId: Number(decoded.id),
        },
      });

      await prisma.item.update({
        where: { id: shipment.itemId },
        data: {
          status: "Tersedia",
          quality: quality as ItemQuality,
          rakId: Number(rakId),
        },
      });

      await prisma.rak.update({
        where: { id: Number(rakId) },
        data: {
          kapasitasSekarang: { increment: 1 },
        }
      })

      return NextResponse.json(
        { message: "Barang berhasil diverifikasi" },
        { status: 200 },
      );
    }

    if (action === "Reject") {
      await prisma.shipment.delete({
        where: {id: Number(shipmentId)},
      })

      await prisma.item.delete({
        where: { id: isPending.itemId},
      })
      return NextResponse.json({message: "Barang ditolak"}, {status: 200});
    }
  } catch (error) {
    console.log("Error verifikasi barang:", error);
    return NextResponse.json(
      { message: "Gagal verifikasi barang" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return (await protect(verifikasiBarang, ["admin"]))(req);
}
