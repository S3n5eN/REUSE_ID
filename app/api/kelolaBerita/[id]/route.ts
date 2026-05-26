import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
