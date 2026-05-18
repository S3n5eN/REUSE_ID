import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getItemDetail(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const itemId = url.searchParams.get("id");

    const item = await prisma.item.findUnique({
      where: { id: Number(itemId) },
      select: {
        name: true,
        category: true,
        weight: true,
        imageData: true,
        rak: {
          select: { nomor: true }
        }
      }
    });

    if (!item) return NextResponse.json({ message: "Item tidak ditemukan" }, { status: 404 });

    const imageBase64 = item.imageData
      ? Buffer.from(item.imageData).toString("base64")
      : null;

    return NextResponse.json({
      data: {
        name: item.name,
        category: item.category,
        weight: item.weight,
        imageBase64,
        imageType: item.imageType,
        rakNomor: item.rak?.nomor ?? null,
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching item detail:", error);
    return NextResponse.json({ message: "Gagal mengambil detail barang" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getItemDetail, ["admin"]))(req);
}