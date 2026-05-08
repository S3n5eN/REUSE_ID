import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { protect } from "@/lib/protect";

async function getItemApproved(req: Request) {
  try {
    const shipments = await prisma.shipment.findMany({
      where: {
        status: "Approved",
        type: "Donation",
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