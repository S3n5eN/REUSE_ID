import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function deleteLokasi(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: number[] = body.ids;

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { message: "ID lokasi wajib diisi" },
        { status: 400 }
      );
    }

    const lokasiList = await prisma.place.findMany({
      where: {
        id: { in: ids }
      },
      include: {
        item: {
          include: {
            shipment: true
          }
        }
      }
    });

    const blocked = lokasiList.filter((l) =>
      l.item.some((item) =>
        item.shipment.some((s) => s.status !== "Delivered")
      )
    );

    if (blocked.length > 0) {
      return NextResponse.json(
        {
          message:
            "Masih ada barang yang belum selesai. Silakan pindahkan terlebih dahulu.",
          blockedIds: blocked.map((b) => b.id)
        },
        { status: 400 }
      );
    }

    await prisma.admin.updateMany({
      where: {
        placeId: { in: ids }
      },
      data: {
        placeId: null
      }
    });

    await prisma.place.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({
      message: "Lokasi berhasil dihapus",
      deletedIds: ids
    });

  } catch (error: any){
    console.error("ERROR DELETE BULK:", error);
    if (error.code === "P2003") {
        return NextResponse.json(
         {
         message: "Lokasi masih memiliki relasi data (item / shipment)"
        },
         { status: 400 }
    );
  }

    return NextResponse.json(
      { message: "Gagal menghapus lokasi" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  return (await protect(deleteLokasi, ["admin"]))(req);
}