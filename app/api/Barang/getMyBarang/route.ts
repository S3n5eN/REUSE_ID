import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";
const typeAction: string[] = [
  "Semua",
  "Menunggu",
  "Pilih",
  "Perjalanan",
  "Selesai",
];

async function getMyBarang(req: NextRequest, decoded: { id: string }) {
  try {
    const action = req.nextUrl.searchParams.get("action");

    if (!action || !typeAction.includes(action)) {
      return NextResponse.json({message: "gagal mendapatkan data barang"}, {status: 400});
    }

    let response;
    if (action === "Semua") {
      response = await prisma.shipment.findMany({
        where: { userId: Number(decoded.id), type: "claim" },
        include: {
          item: { include: { user: true } },
        },
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