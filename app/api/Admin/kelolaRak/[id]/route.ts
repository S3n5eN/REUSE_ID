import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function updateRak(req: NextRequest, decoded: { id: string }, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { maxKapasitas, nomorRak} = await req.json();
    const resolvedParams = await params;
    const rakId = resolvedParams.id;

    if (!maxKapasitas || !nomorRak || !rakId) {
        return NextResponse.json({ message: "Nomor Rak, Max Kapasitas, dan ID Rak harus diisi" }, { status: 400 });
    }

    const isExist = await prisma.rak.findUnique({
        where: { id: Number(rakId) },
    })

    if (!isExist) {
        return NextResponse.json({ message: "Rak tidak ditemukan" }, { status: 404 });
    }

    await prisma.rak.update({
        where: { id: Number(rakId) },
        data: {
            nomor: nomorRak,
            kapasitasMax: maxKapasitas,
        }
    })
    return NextResponse.json({ message: "Rak berhasil diperbarui" }, { status: 200 });
  } catch {
      return NextResponse.json({ message: "Terjadi kesalahan saat memproses permintaan" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return (
    await protect(
      (req: NextRequest, decoded: { id: string }) =>
        updateRak(req, decoded, { params }),
      ["admin"],
    )
  )(req);
}

