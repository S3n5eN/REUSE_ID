import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function pindahItem(
  req: NextRequest,
  decoded: { id: string },
  { params }: { params: { id: string } },
) {
  try {
    const rakAsalId = Number(params.id);
    const { rakTujuanId, itemIds } = await req.json();

    const [rakAsal, rakTujuan] = await Promise.all([
      prisma.rak.findFirst({ where: { id: rakAsalId } }),
      prisma.rak.findFirst({ where: { id: rakTujuanId } }),
    ]);

    if (!rakAsal || !rakTujuan) {
      return NextResponse.json(
        { message: "Rak asal atau rak tujuan tidak ditemukan" },
        { status: 404 },
      );
    }

    const jumlahItem = itemIds.length;
    const sisaKapasitas = rakTujuan.kapasitasMax - rakTujuan.kapasitasSekarang;

    if (sisaKapasitas < jumlahItem) {
      return NextResponse.json(
        {
          message:
            "Kapasitas rak tujuan tidak cukup untuk menampung item yang dipindahkan",
        },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.item.updateMany({
        where: { id: { in: itemIds }, rakId: rakAsalId },
        data: { rakId: rakTujuanId },
      }),
      prisma.rak.update({
        where: { id: rakTujuanId },
        data: { kapasitasSekarang: { increment: jumlahItem } },
      }),
      prisma.rak.update({
        where: { id: rakAsalId },
        data: { kapasitasSekarang: { decrement: jumlahItem } },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Item berhasil dipindahkan",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses permintaan" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
    return (await protect(pindahItem, ["admin"]))(req);
}