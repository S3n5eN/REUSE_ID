import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function updateLokasi(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id || !body.locationName || !body.address || !body.managerName || !body.managerPhone || !body.operationalJam) {
      return NextResponse.json({ message: "Semua field harus diisi" }, { status: 400 });
    }

    const isExist = await prisma.place.findFirst({
      where: { id: body.id },
    });

    if (!isExist) {
      return NextResponse.json({ message: "Lokasi tidak ditemukan" }, { status: 404 });
    }

    // Cek nama duplikat tapi bukan milik diri sendiri
    const isDuplicate = await prisma.place.findFirst({
      where: {
        name: body.locationName,
        NOT: { id: body.id },
      },
    });

    if (isDuplicate) {
      return NextResponse.json({ message: "Nama lokasi sudah digunakan" }, { status: 400 });
    }

    await prisma.place.update({
      where: { id: body.id },
      data: {
        name: body.locationName,
        address: body.address,
        managerName: body.managerName,
        managerPhone: body.managerPhone,
        operationalJam: body.operationalJam,
      },
    });

    return NextResponse.json({ message: "Lokasi berhasil diupdate" }, { status: 200 });
  } catch (error) {
    console.error("Error update lokasi:", error);
    return NextResponse.json({ message: "Gagal mengupdate lokasi" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return (await protect(updateLokasi, ["admin"]))(req);
}