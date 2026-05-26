import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

async function expiredCleanup() {
  const now = new Date();

  const shipmentDeadline = new Date(now.getTime() - 60 * 60 * 1000);

  const shipmentExpired = await prisma.shipment.findMany({
    where: {
      type: "claim",
      claimType: null,
      createdAt: { lt: shipmentDeadline },
    },
    select: { id: true, itemId: true },
  });

  const paymentExpired = await prisma.shipment.findMany({
    where: {
      type: "claim",
      claimType: "delivery",
      paymentStatus: "Unpaid",
      paymentExpiredAt: { lt: now },
    },
    select: { id: true, itemId: true },
  });

  const allItemId = [
    ...shipmentExpired.map((ship) => ship.itemId),
    ...paymentExpired.map((pay) => pay.itemId),
  ];

  const allShipmentId = [
    ...shipmentExpired.map((ship) => ship.id),
    ...paymentExpired.map((pay) => pay.id),
  ];

  if (allItemId.length === 0) {
    return NextResponse.json(
      { message: "Tidak ada data yang expired, yang perlu dibersihkan" },
      { status: 200 },
    );
  }

  await prisma.$transaction([
    prisma.item.updateMany({
      where: { id: { in: allItemId } },
      data: { status: "Tersedia" },
    }),

    ...allShipmentId.map((id) =>
      prisma.shipment.update({
        where: { id },
        data: {
          type: `cancelled-${randomUUID()}`,
          paymentStatus: "Failed",
        },
      }),
    ),
  ]);

  return NextResponse.json(
    { success: true, message: "Berhasil membersihkan data expired" },
    { status: 200 },
  );
}

export async function GET(req: NextRequest) {
  return (await protect(expiredCleanup, ["user"]))(req);
}
