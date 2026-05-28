import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { protect } from "@/lib/protect";

async function getItemPending(req: NextRequest, decoded: { id: string; placeId?: number }) {
  try {
    const placeId = decoded.placeId;

    if (!placeId) {
      return NextResponse.json(
        { message: "Place ID tidak ditemukan, pastikan sudah melakukan validasi key lokasi" },
        { status: 400 },
      );
    }

    const shipments = await prisma.shipment.findMany({
      where: {
        status: "Pending",
        type: "Donation",
        item: { placeId: Number(placeId) }
      },
      include: {
        item: {
          include: {
            user: true,
            place: true,
          },
        },
      },
    });

    const items = shipments.map((shipment) => ({
      shipmentId: shipment.id,
      ...shipment.item,
    }));

    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getItemPending, ["admin"]))(req);
}
