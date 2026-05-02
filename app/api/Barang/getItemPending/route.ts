import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { protect } from "@/lib/protect";

async function getItemPending(req: Request, payload: { id: string }) {
  try {
    const shipments = await prisma.shipment.findMany({
      where: {
        status: "Pending",
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
  return (await protect(getItemPending, ["admin"]))(req);
}
