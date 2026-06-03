import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";
const typeAction: string[] = [
  "Semua",
  "Menunggu",
  "Pilih",
  "Perjalanan",
  "Selesai",
  "BelumDiantarkan",
];

async function getMyBarang(req: NextRequest, decoded: { id: string }) {
  try {
    const action = req.nextUrl.searchParams.get("action");

    if (!action || !typeAction.includes(action)) {
      return NextResponse.json({message: "gagal mendapatkan data barang"}, {status: 400});
    }

    let response;
    if (action === "Semua") {
      const shipments = await prisma.shipment.findMany({
        where: { userId: Number(decoded.id), type: "claim" },
        include: {
          item: { include: { user: true, place: true } },
        },
      });

      const pendingItems = await prisma.item.findMany({
        where: {
          userId: Number(decoded.id),
          status: "PendingApproval",
        },
        include: { user: true, place: true },
      });

      const mappedPendingItems = pendingItems.map((item) => ({
        id: -item.id,
        itemId: item.id,
        userId: item.userId,
        type: "donation",
        status: "Pending",
        createdAt: item.createdAt,
        item: item,
      }));

      response = [...shipments, ...mappedPendingItems].sort((a, b) => {
        if (a.type === "donation" && b.type !== "donation") return -1;
        if (a.type !== "donation" && b.type === "donation") return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (action === "Menunggu") {
      response = await prisma.shipment.findMany({
        where: {
          userId: Number(decoded.id),
          type: "claim",
          claimType: { in: null },
          userProfile: { isVerified: false },
        },
        include: {
          item: { include: { user: true, place: true } },
        },
      });
    } else if (action === "Pilih") {
      response = await prisma.shipment.findMany({
        where: {
          userId: Number(decoded.id),
          type: "claim",
          claimType: { in: null },
          userProfile: { isVerified: true },
        },
        include: {
          item: { include: { user: true, place: true } },
        },
      });
    } else if (action === "Perjalanan") {
      response = await prisma.shipment.findMany({
        where: {
          userId: Number(decoded.id),
          type: "claim",
          claimType: { in: ["pickup", "delivery"] },
        },
        include: {
          item: { include: { user: true, place: true } },
        },
      });
    } else if (action === "Selesai") {
      response = await prisma.shipment.findMany({
        where: {
          userId: Number(decoded.id),
          type: "claim",
          status: "Delivered",
        },
        include: {
          item: { include: { user: true, place: true } },
        },
      });
    } else if (action === "BelumDiantarkan") {
      const items = await prisma.item.findMany({
        where: {
          userId: Number(decoded.id),
          status: "PendingApproval",
        },
        include: { user: true, place: true },
      });

      // Map it to a fake shipment structure so the frontend can render it easily
      response = items.map((item) => ({
        id: -item.id,
        itemId: item.id,
        userId: item.userId,
        type: "donation",
        status: "Pending",
        createdAt: item.createdAt,
        item: item,
      }));
    }

    return NextResponse.json({
      message: "Berhasil mendapatkan data barang",
      data: response,
    });
  } catch {
    return NextResponse.json({
      message: "Gagal mendapatkan data barang",
    }, {status: 500});
  }
}

export async function GET(req: NextRequest) {
    return (await protect(getMyBarang, ["user"]))(req);
}