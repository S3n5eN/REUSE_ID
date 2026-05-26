import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function publishBerita(
  req: NextRequest,
  decoded: { id: string },
  id: string,
) {
  try {
    const berita = await prisma.news.findUnique({ where: { id: Number(id) } });
    if (!berita)
      return NextResponse.json(
        { message: "Berita tidak ditemukan" },
        { status: 404 },
      );

    await prisma.news.update({
      where: { id: Number(id) },
      data: { isPublished: true },
    });

    return NextResponse.json({ message: "Berita berhasil dipublikasi" });
  } catch {
    return NextResponse.json(
      { message: "Gagal mempublikasi berita" },
      { status: 500 },
    );
  }
}

async function deleteBerita(
  req: NextRequest,
  decoded: { id: string },
  id: string,
) {
  try {
    const berita = await prisma.news.findUnique({ where: { id: Number(id) } });
    if (!berita)
      return NextResponse.json(
        { message: "Berita tidak ditemukan" },
        { status: 404 },
      );

    await prisma.news.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Berita berhasil dihapus" });
  } catch {
    return NextResponse.json(
      { message: "Gagal menghapus berita" },
      { status: 500 },
    );
  }
}
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const berita = await prisma.news.findUnique({ where: { id: Number(id) } });

    if (!berita)
      return NextResponse.json(
        { message: "Berita tidak ditemukan" },
        { status: 404 },
      );

    const etag = `W/"news-${berita.id}-${new Date(berita.createdAt).getTime()}"`;
    const ifNoneMatch = req.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": "no-cache",
          ETag: etag,
        },
      });
    }

    return new NextResponse(berita.imageData, {
      headers: {
        "Content-Type": berita.imageType,
        "Cache-Control": "no-cache",
        ETag: etag,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return (await protect((r: NextRequest, d: { id: string }) => publishBerita(r, d, id), ["admin"]))(req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return (await protect((r: NextRequest, d: { id: string }) => deleteBerita(r, d, id), ["admin"]))(req);
}
