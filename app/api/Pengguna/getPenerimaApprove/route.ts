import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getPenerimaApprove(
  req: NextRequest,
  decoded: { id: string; placeId?: number },
) {
  try {
    const placeId = decoded.placeId;

    if (!placeId) {
      return NextResponse.json(
        {
          message:
            "Place ID tidak ditemukan, pastikan sudah melakukan validasi key lokasi",
        },
        { status: 400 },
      );
    }

    const response = await prisma.shipment.findMany({
      where: {
        claimType: { not: null },
        status: "Approved",
        type: "claim",
        OR: [
          { claimType: "pickup" },
          { claimType: "delivery", paymentStatus: "Paid" },
        ],
        item: {
          placeId: Number(placeId),
        },
      },
      include: {
        userProfile: true,
        item: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Berhasil mengambil data penerima approve", data: response },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        message: "Gagal mengambil data penerima approve",
        error: err?.message || String(err),
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getPenerimaApprove, ["admin"]))(req);
}
