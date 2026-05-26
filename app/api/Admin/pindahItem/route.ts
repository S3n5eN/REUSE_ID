import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function moveItem(req: NextRequest) {
  try {
    const body = await req.json();

    const { itemIds, sourcePlaceId, targetPlaceId } = body;

    if (!itemIds || itemIds.length === 0 || !targetPlaceId || !sourcePlaceId) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const items = await prisma.item.findMany({
      where: {
        id: { in: itemIds },
      },
    });

    const invalidItems = items.filter((item) => item.placeId !== sourcePlaceId);

    if (invalidItems.length > 0) {
      return NextResponse.json(
        {
          message: "Beberapa item tidak berasal dari lokasi ini",
          invalidItemIds: invalidItems.map((i) => i.id),
        },
        { status: 400 },
      );
    }

    const itemsWithShipment = await prisma.item.findMany({
      where: {
        id: { in: itemIds },
      },
      include: {
        shipment: true,
      },
    });

    const invalidStatus = itemsWithShipment.filter((item) =>
      item.shipment.some((s) => s.status === "Delivered"),
    );

    if (invalidStatus.length > 0) {
      return NextResponse.json(
        {
          message: "Item yang sudah delivered tidak bisa dipindahkan",
          invalidItemIds: invalidStatus.map((i) => i.id),
        },
        { status: 400 },
      );
    }

    const rakGroups = itemsWithShipment.reduce(
      (acc, item) => {
        if (item.rakId) {
          acc[item.rakId] = (acc[item.rakId] || 0) + 1;
        }
        return acc;
      },
      {} as Record<number, number>,
    );

    await prisma.$transaction([
      ...Object.entries(rakGroups).map(([rakId, count]) =>
        prisma.rak.update({
          where: { id: Number(rakId) },
          data: { kapasitasSekarang: { decrement: count } },
        }),
      ),
      prisma.item.updateMany({
        where: {
          id: { in: itemIds },
        },
        data: {
          placeId: targetPlaceId,
          rakId: null,
        },
      }),
      prisma.shipment.updateMany({
        where: {
          itemId: { in: itemIds },
        },
        data: {
          status: "Pending",
        },
      }),
    ]);

    return NextResponse.json({
      message: "Item berhasil dipindahkan",
      movedItemIds: itemIds,
    });
  } catch {
    return NextResponse.json(
      { message: "Gagal memindahkan item" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  return (await protect(moveItem, ["admin"]))(req);
}