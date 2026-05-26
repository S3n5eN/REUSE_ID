import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function checkStatusTransfer(req: NextRequest) {
  try {
    const shipmentId = req.nextUrl.searchParams.get("shipmentId");

    if (!shipmentId) {
      return NextResponse.json(
        { error: "shipment tidak ditemukan" },
        { status: 400 },
      );
    }

    const shipment = await prisma.shipment.findFirst({
      where: { id: Number(shipmentId), paymentStatus: "WaitingVerification" },
    });

    const status = !!shipment;

    if (status) {
      return NextResponse.json(
        { status: true, message: "Pembayaran menunggu verifikasi" },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { status: false, message: "Pembayaran sudah diverifikasi" },
        { status: 200 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Gagal cek status pembayaran" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(checkStatusTransfer, ["user"]))(req);
}
