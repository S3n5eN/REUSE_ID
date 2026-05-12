import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { protect } from "@/lib/protect";

async function getItemApproved(req: NextRequest) {
  try {
    const placeId = req.cookies.get("placeId")?.value;

    if (!placeId) {
      return NextResponse.json(
        { message: "Place ID tidak ditemukan, pastikan sudah melakukan validasi key lokasi" },
        { status: 400 },
      );
    }

    const shipments = await prisma.shipment.findMany({
      where: {
        status: "Approved",
        type: "Donation",

        item: {
          status: "Tersedia",
          placeId: Number(placeId),
        }
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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getItemApproved, ["admin"]))(req);
}