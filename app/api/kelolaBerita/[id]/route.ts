import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const berita = await prisma.news.findUnique({ where: { id: Number(id) } });

    if (!berita) return NextResponse.json({ message: "Berita tidak ditemukan" }, { status: 404 });

    return new NextResponse(berita.imageData, {
      headers: {
        "Content-Type": berita.imageType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}