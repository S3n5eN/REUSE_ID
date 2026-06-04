import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function TambahRak(
  req: NextRequest,
  decoded: { id: string; placeId?: number },
) {
  try {
    // ==== arrRak ini buat kumpulan Rak dalam bentuk array, ini biar Frontend bisa kirim banyak rak sekaligus, jadi cuman butuh 1 request aja ====
    const { arrRak } = await req.json();
    const placeId = decoded.placeId;

    if (!arrRak || !placeId) {
      return new Response(
        JSON.stringify({ message: "Rak dan Place ID harus diisi" }),
        { status: 400 },
      );
    }

    const isOverflow = arrRak.some(
      (rak: { nomorRak: string; kapasitasMax: number }) => {
        if (rak.nomorRak.length < 2 || rak.nomorRak.length > 10) {
          return true;
        }

        if (!rak.nomorRak.match(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/)) {
          return true;
        }

        if (rak.kapasitasMax < 10 || rak.kapasitasMax > 100) {
          return true;
        }
      },
    );

    if (isOverflow) {
      return NextResponse.json(
        {
          message:
            "Rak tidak valid, nomor rak harus 2-10 karakter dan wajib mengandung kombinasi huruf dan angka (tanpa spasi/simbol), serta kapasitas max minimal 10 dan maksimal 100",
        },
        { status: 400 },
      );
    }

    await prisma.rak.createMany({
      data: arrRak.map((rak: { nomorRak: string; kapasitasMax: number }) => ({
        nomor: rak.nomorRak,
        kapasitasMax: Number(rak.kapasitasMax),
        placeId: placeId,
      })),
    });

    return NextResponse.json(
      { message: "Rak berhasil ditambahkan" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses permintaan" },
      { status: 500 },
    );
  }
}

async function getAllRak(
  req: NextRequest,
  decoded: { id: string; placeId?: number },
) {
  try {
    const placeId = decoded.placeId;

    if (!placeId) {
      return NextResponse.json(
        { message: "Place ID harus diisi" },
        { status: 400 },
      );
    }

    const koleksiRak = await prisma.rak.findMany({
      where: { placeId: Number(placeId) },
      include: {
        item: true,
      },
    });

    const placeInfo = await prisma.place.findUnique({
      where: { id: Number(placeId) },
      select: { name: true, address: true, managerName: true },
    });

    return NextResponse.json(
      { message: "Rak berhasil diambil", data: koleksiRak, place: placeInfo },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses permintaan" },
      { status: 500 },
    );
  }
}

async function deleteRak(req: NextRequest, decoded: { id: string }) {
  try {
    const { searchParams } = new URL(req.url);
    // Ini kumpulan ID rak, case nya kalau mau hapus banyak
    const rakIds = searchParams
      .get("ids")
      ?.split(",")
      .map((id) => Number(id));

    if (!rakIds || rakIds.length === 0) {
      return NextResponse.json(
        { message: "ID Rak harus diisi" },
        { status: 400 },
      );
    }

    const rakTerisi = await prisma.rak.findMany({
      where: { id: { in: rakIds }, kapasitasSekarang: { gt: 0 } },
    });

    if (rakTerisi.length > 0) {
      const idRakTerisi = rakTerisi.map((rak) => rak.id).join(", ");
      return NextResponse.json(
        {
          message: `Tidak dapat menghapus Rak dengan ID ${idRakTerisi} karena masih terisi`,
        },
        { status: 400 },
      );
    }

    await prisma.rak.deleteMany({
      where: { id: { in: rakIds } },
    });

    return NextResponse.json(
      { message: "Rak berhasil dihapus" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses permintaan" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  return (await protect(deleteRak, ["admin"]))(req);
}

export async function POST(req: NextRequest) {
  return (await protect(TambahRak, ["admin"]))(req);
}

export async function GET(req: NextRequest) {
  return (await protect(getAllRak, ["admin"]))(req);
}
